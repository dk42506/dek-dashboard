import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createUpdownCheck, deleteUpdownCheck, monitorWebsite } from '@/lib/website-monitor'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Allow admins to access any client, or clients to access their own data
    if (session.user.role !== 'ADMIN' && session.user.id !== id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await prisma.user.findUnique({
      where: { 
        id,
        role: 'CLIENT'
      }
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Remove sensitive data for client access
    if (session.user.role === 'CLIENT') {
      const { password, ...clientWithoutPassword } = client
      return NextResponse.json(clientWithoutPassword)
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error('Error fetching client:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if client exists
    const client = await prisma.user.findUnique({
      where: { 
        id,
        role: 'CLIENT'
      }
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Delete the client
    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Client deleted successfully' })
  } catch (error) {
    console.error('Error deleting client:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
      const body = await request.json()
    const { 
      name, 
      email, 
      businessName, 
      businessType,
      website,
      location, 
      phone, 
      repName,
      repRole,
      repEmail,
      repPhone
    } = body

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Check if client exists
    const existingClient = await prisma.user.findUnique({
      where: { 
        id,
        role: 'CLIENT'
      }
    })

    if (!existingClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Check if email is already taken by another user
    if (email !== existingClient.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email }
      })

      if (emailTaken) {
        return NextResponse.json(
          { error: 'A user with this email already exists' },
          { status: 400 }
        )
      }
    }

    // Handle website URL changes (using type assertion to access new fields)
    const clientData = existingClient as any
    let websiteStatus = clientData.websiteStatus
    let updownToken = clientData.updownToken
    let lastChecked = clientData.lastChecked

    if (website !== clientData.website) {
      console.log(`Website URL changed from "${clientData.website}" to "${website}"`)
      
      // Delete old updown.io check if it exists
      if (clientData.updownToken) {
        console.log(`Deleting old updown.io check: ${clientData.updownToken}`)
        try {
          await deleteUpdownCheck(clientData.updownToken)
          console.log('Old updown.io check deleted successfully')
        } catch (error) {
          console.error('Error deleting old updown check:', error)
        }
      }

      // Create new monitoring setup if new website is provided
      if (website && website.trim()) {
        try {
          console.log(`Setting up monitoring for new website: ${website}`)
          websiteStatus = 'checking'
          lastChecked = new Date()

          // Try to create new updown.io check
          const updownCheck = await createUpdownCheck(website, businessName || name)
          if (updownCheck) {
            updownToken = updownCheck.token
            websiteStatus = updownCheck.down ? 'down' : 'up'
            console.log(`New updown.io check created: ${updownToken}`)
          } else {
            // Fall back to basic ping
            console.log('Falling back to basic ping monitoring')
            const pingResult = await monitorWebsite(website)
            websiteStatus = pingResult.status
            lastChecked = pingResult.lastChecked
            updownToken = null
          }
        } catch (error) {
          console.error('Error setting up website monitoring:', error)
          websiteStatus = 'unknown'
          updownToken = null
        }
      } else {
        // No website provided, clear monitoring
        websiteStatus = null
        updownToken = null
        lastChecked = null
      }
    }

    // Update the client (using type assertion to bypass TypeScript errors)
    const updatedClient = await (prisma.user.update as any)({
      where: { id },
      data: {
        name,
        email,
        businessName,
        businessType,
        website,
        location,
        phone,
        repName,
        repRole,
        repEmail,
        repPhone,
        websiteStatus,
        updownToken,
        lastChecked,
      }
    })

    return NextResponse.json(updatedClient)
  } catch (error) {
    console.error('Error updating client:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
