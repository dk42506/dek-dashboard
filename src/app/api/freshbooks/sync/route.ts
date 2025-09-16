import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { freshBooksService } from '@/lib/freshbooks'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Initialize FreshBooks service
    await freshBooksService.initialize(session.user.id)

    // Get all clients from database
    const dbClients = await prisma.user.findMany({
      where: { role: 'CLIENT' },
      select: {
        id: true,
        businessName: true,
        name: true,
        email: true,
      }
    })

    // Get all clients from FreshBooks
    const fbClients = await freshBooksService.getClients()

    const matches = []
    const unmatched = []

    // Try to match clients
    for (const dbClient of dbClients) {
      if (!dbClient.businessName) continue

      const fbClient = await freshBooksService.findClientByBusinessName(dbClient.businessName)
      
      if (fbClient) {
        matches.push({
          dbClient,
          fbClient,
          matchType: 'business_name'
        })
      } else {
        unmatched.push(dbClient)
      }
    }

    return NextResponse.json({
      success: true,
      matches: matches.length,
      unmatched: unmatched.length,
      matchedClients: matches,
      unmatchedClients: unmatched,
      totalFreshBooksClients: fbClients.length,
      totalDatabaseClients: dbClients.length
    })

  } catch (error) {
    console.error('Error syncing FreshBooks data:', error)
    return NextResponse.json(
      { error: 'Failed to sync FreshBooks data' },
      { status: 500 }
    )
  }
}
