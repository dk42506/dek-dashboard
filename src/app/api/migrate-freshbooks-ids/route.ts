import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find all clients with FreshBooks IDs in repName field
    const clientsToMigrate = await prisma.user.findMany({
      where: {
        role: 'CLIENT',
        repName: {
          startsWith: 'FB-'
        }
      }
    })

    console.log(`Found ${clientsToMigrate.length} clients to migrate`)

    let migrated = 0
    for (const client of clientsToMigrate) {
      if (client.repName?.startsWith('FB-')) {
        await prisma.user.update({
          where: { id: client.id },
          data: {
            repRole: client.repName, // Move FB-xxx to repRole
            repName: null // Clear repName
          }
        })
        migrated++
        console.log(`Migrated client ${client.email}: ${client.repName} -> repRole`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Migrated ${migrated} clients`,
      migrated
    })

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
