import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { seedDatabase } from '@/lib/seed'

export async function GET(request: NextRequest) {
  try {
    // First, ensure database tables exist by running migrations
    await prisma.$executeRaw`SELECT 1`
    
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
    
    // If it's a database connection error, provide specific guidance
    if (error instanceof Error && error.message.includes('Unable to open the database file')) {
      return NextResponse.json(
        { 
          error: 'Database configuration issue',
          details: 'SQLite not supported on Vercel. Please use PostgreSQL.',
          solution: 'Add a PostgreSQL database URL to your environment variables'
        },
        { status: 500 }
      )
    }
    
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
