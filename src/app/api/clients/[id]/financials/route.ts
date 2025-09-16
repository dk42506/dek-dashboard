import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { freshbooks } from '@/lib/freshbooks'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id: clientId } = await params

    // Get client from database
    const client = await prisma.user.findUnique({
      where: { id: clientId, role: 'CLIENT' },
      select: {
        id: true,
        businessName: true,
        name: true,
        email: true,
      }
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Check if FreshBooks is configured
    const settings = await prisma.adminSettings.findUnique({
      where: { userId: session.user.id }
    })

    if (!settings?.freshbooksAccessToken || !settings?.freshbooksAccountId) {
      return NextResponse.json({
        error: 'FreshBooks not configured',
        configured: false
      }, { status: 400 })
    }

    // For now, return a placeholder response indicating FreshBooks integration is available
    // Full implementation would require OAuth flow completion
    return NextResponse.json({
      success: true,
      client,
      matched: false,
      configured: freshbooks.isConfigured(),
      message: 'FreshBooks integration configured but requires OAuth authentication',
      authUrl: freshbooks.isConfigured() ? freshbooks.getAuthorizationUrl() : null
    })

  } catch (error) {
    console.error('Error fetching client financials:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
