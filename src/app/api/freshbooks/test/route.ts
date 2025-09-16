import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { freshbooks } from '@/lib/freshbooks'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get admin settings
    const settings = await prisma.adminSettings.findUnique({
      where: { userId: session.user.id }
    })

    const testResults = {
      timestamp: new Date().toISOString(),
      freshbooksConfigured: freshbooks.isConfigured(),
      environmentVariables: {
        clientId: !!process.env.FRESHBOOKS_CLIENT_ID,
        clientSecret: !!process.env.FRESHBOOKS_CLIENT_SECRET,
        redirectUri: process.env.FRESHBOOKS_REDIRECT_URI || 'Not set'
      },
      databaseSettings: {
        hasSettings: !!settings,
        hasAccessToken: !!settings?.freshbooksAccessToken,
        hasRefreshToken: !!settings?.freshbooksRefreshToken,
        hasAccountId: !!settings?.freshbooksAccountId,
        accountId: settings?.freshbooksAccountId || 'Not set'
      },
      authUrl: null as string | null,
      apiTest: null as any,
      error: null as string | null
    }

    // Test 1: Check if we can generate auth URL
    try {
      if (freshbooks.isConfigured()) {
        testResults.authUrl = freshbooks.getAuthorizationUrl()
      }
    } catch (error) {
      testResults.error = `Auth URL generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }

    // Test 2: If we have tokens, test API call
    if (settings?.freshbooksAccessToken && settings?.freshbooksAccountId) {
      try {
        freshbooks.setAccessToken(settings.freshbooksAccessToken)
        
        // Test user profile first (simpler endpoint)
        const userProfile = await freshbooks.getUserProfile()
        testResults.apiTest = {
          userProfile: userProfile ? 'Success' : 'Failed',
          userProfileData: userProfile
        }

        // If user profile works, try financial summary
        if (userProfile) {
          try {
            const financialSummary = await freshbooks.getFinancialSummary(settings.freshbooksAccountId)
            testResults.apiTest.financialSummary = financialSummary
          } catch (fsError) {
            testResults.apiTest.financialSummaryError = fsError instanceof Error ? fsError.message : 'Unknown error'
          }
        }
      } catch (apiError) {
        testResults.apiTest = {
          error: apiError instanceof Error ? apiError.message : 'Unknown API error',
          needsReauth: apiError instanceof Error && apiError.message.includes('401')
        }
      }
    }

    return NextResponse.json(testResults, { status: 200 })
  } catch (error) {
    console.error('FreshBooks test error:', error)
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
