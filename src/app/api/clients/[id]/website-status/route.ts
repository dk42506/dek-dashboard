import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { monitorWebsite } from '@/lib/website-monitor'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get the client
    const client = await prisma.user.findUnique({
      where: { 
        id,
        role: 'CLIENT'
      }
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Use type assertion to access new fields
    const clientData = client as any

    if (!clientData.website) {
      return NextResponse.json({ error: 'No website configured for this client' }, { status: 400 })
    }

    // Check website status
    const status = await monitorWebsite(clientData.website, clientData.updownToken || undefined)

    // Update the client's website status (using type assertion)
    await (prisma.user.update as any)({
      where: { id },
      data: {
        websiteStatus: status.status,
        lastChecked: status.lastChecked,
      }
    })

    return NextResponse.json({
      status: status.status,
      lastChecked: status.lastChecked,
      responseTime: status.responseTime,
      statusCode: status.statusCode,
      error: status.error,
    })
  } catch (error) {
    console.error('Error checking website status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
