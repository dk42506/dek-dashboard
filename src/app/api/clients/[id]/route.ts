import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const client = await prisma.user.findUnique({
      where: { 
        id,
        role: 'CLIENT'
      },
      select: {
        id: true,
        name: true,
        email: true,
        businessName: true,
        location: true,
        phone: true,
        notes: true,
        clientSince: true,
        createdAt: true,
        updatedAt: true,
        role: true,
        emailVerified: true,
        image: true,
      }
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
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
    const { name, email, businessName, location, phone, notes } = body

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

    // Update the client
    const updatedClient = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        businessName,
        location,
        phone,
        notes,
      },
      select: {
        id: true,
        name: true,
        email: true,
        businessName: true,
        location: true,
        phone: true,
        notes: true,
        clientSince: true,
        createdAt: true,
        updatedAt: true,
        role: true,
        emailVerified: true,
        image: true,
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
