import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { freshBooksService } from '@/lib/freshbooks'
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

    try {
      // Initialize FreshBooks service
      await freshBooksService.initialize(session.user.id)

      // Find matching FreshBooks client
      const fbClient = client.businessName 
        ? await freshBooksService.findClientByBusinessName(client.businessName)
        : null

      if (!fbClient) {
        return NextResponse.json({
          error: 'No matching FreshBooks client found',
          client,
          matched: false,
          configured: true
        })
      }

      // Get financial summary
      const financialSummary = await freshBooksService.getClientFinancialSummary(fbClient.id)

      return NextResponse.json({
        success: true,
        client,
        fbClient,
        matched: true,
        configured: true,
        financials: financialSummary
      })

    } catch (fbError) {
      console.error('FreshBooks API Error:', fbError)
      return NextResponse.json({
        error: 'Failed to fetch FreshBooks data',
        client,
        matched: false,
        configured: true,
        fbError: fbError instanceof Error ? fbError.message : 'Unknown error'
      })
    }

  } catch (error) {
    console.error('Error fetching client financials:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
