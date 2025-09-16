import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { seedDatabase } from '@/lib/seed'

export async function GET(request: NextRequest) {
  try {
    // Check if database is already initialized
    const adminExists = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (adminExists) {
      return NextResponse.json({ 
        message: 'Database already initialized',
        admin: adminExists.email 
      })
    }

    // Initialize database with seed data
    await seedDatabase()

    return NextResponse.json({ 
      message: 'Database initialized successfully',
      admin: process.env.ADMIN_EMAIL || 'dkeller@dekinnovations.com'
    })

  } catch (error) {
    console.error('Database initialization error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to initialize database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Force re-initialization (useful for debugging)
    await seedDatabase()

    return NextResponse.json({ 
      message: 'Database re-initialized successfully',
      admin: process.env.ADMIN_EMAIL || 'dkeller@dekinnovations.com'
    })

  } catch (error) {
    console.error('Database re-initialization error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to re-initialize database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
