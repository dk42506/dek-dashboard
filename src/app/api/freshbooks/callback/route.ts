import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { freshbooks } from '@/lib/freshbooks'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/auth/signin?error=unauthorized', request.url))
    }

    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    // Handle authorization errors
    if (error) {
      console.error('FreshBooks OAuth error:', error)
      return NextResponse.redirect(new URL('/admin/settings?error=freshbooks_auth_failed', request.url))
    }

    if (!code) {
      console.error('No authorization code received')
      return NextResponse.redirect(new URL('/admin/settings?error=no_auth_code', request.url))
    }

    try {
      // Exchange code for tokens
      const tokenData = await freshbooks.exchangeCodeForToken(code)
      
      if (!tokenData) {
        throw new Error('Failed to exchange code for tokens')
      }

      // Get user profile to get account ID
      freshbooks.setAccessToken(tokenData.access_token)
      const userProfile = await freshbooks.getUserProfile()
      
      if (!userProfile || !userProfile.response) {
        throw new Error('Failed to get user profile')
      }

      // Extract account ID from user profile
      const accountId = userProfile.response.id || userProfile.response.business_memberships?.[0]?.business?.account_id

      if (!accountId) {
        throw new Error('Could not determine account ID from user profile')
      }

      // Store tokens and account ID in database
      await prisma.adminSettings.upsert({
        where: { userId: session.user.id },
        update: {
          freshbooksAccessToken: tokenData.access_token,
          freshbooksRefreshToken: tokenData.refresh_token,
          freshbooksAccountId: accountId.toString(),
          updatedAt: new Date()
        },
        create: {
          userId: session.user.id,
          freshbooksAccessToken: tokenData.access_token,
          freshbooksRefreshToken: tokenData.refresh_token,
          freshbooksAccountId: accountId.toString()
        }
      })

      console.log('FreshBooks OAuth completed successfully')
      
      // Redirect to settings with success message
      return NextResponse.redirect(new URL('/admin/settings?success=freshbooks_connected', request.url))
      
    } catch (tokenError) {
      console.error('Error processing FreshBooks OAuth:', tokenError)
      return NextResponse.redirect(new URL('/admin/settings?error=freshbooks_token_exchange_failed', request.url))
    }

  } catch (error) {
    console.error('FreshBooks callback error:', error)
    return NextResponse.redirect(new URL('/admin/settings?error=freshbooks_callback_failed', request.url))
  }
}
