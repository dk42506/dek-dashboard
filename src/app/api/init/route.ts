import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { seedDatabase } from '@/lib/seed'

export async function GET(request: NextRequest) {
  try {
    // First, try to create the database tables by running a simple migration
    // This will create all tables if they don't exist
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT,
        "email" TEXT NOT NULL UNIQUE,
        "emailVerified" TIMESTAMP,
        "image" TEXT,
        "password" TEXT,
        "role" TEXT NOT NULL DEFAULT 'CLIENT',
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "businessName" TEXT,
        "businessType" TEXT,
        "website" TEXT,
        "location" TEXT,
        "phone" TEXT,
        "clientSince" TIMESTAMP,
        "repName" TEXT,
        "repRole" TEXT,
        "repEmail" TEXT,
        "repPhone" TEXT,
        "websiteStatus" TEXT,
        "lastChecked" TIMESTAMP,
        "updownToken" TEXT,
        "passwordChanged" BOOLEAN DEFAULT false
      )
    `

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Account" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "provider" TEXT NOT NULL,
        "providerAccountId" TEXT NOT NULL,
        "refresh_token" TEXT,
        "access_token" TEXT,
        "expires_at" INTEGER,
        "token_type" TEXT,
        "scope" TEXT,
        "id_token" TEXT,
        "session_state" TEXT,
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
        UNIQUE("provider", "providerAccountId")
      )
    `

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Session" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "sessionToken" TEXT NOT NULL UNIQUE,
        "userId" TEXT NOT NULL,
        "expires" TIMESTAMP NOT NULL,
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
      )
    `

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Note" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "content" TEXT NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "userId" TEXT NOT NULL,
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
      )
    `

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "AdminSettings" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL UNIQUE,
        "displayName" TEXT,
        "businessName" TEXT,
        "businessEmail" TEXT,
        "businessPhone" TEXT,
        "businessAddress" TEXT,
        "businessWebsite" TEXT,
        "defaultClientType" TEXT,
        "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
        "clientUpdateNotifications" BOOLEAN NOT NULL DEFAULT true,
        "systemAlerts" BOOLEAN NOT NULL DEFAULT true,
        "websiteMonitoringAlerts" BOOLEAN NOT NULL DEFAULT true,
        "monthlyReportEmails" BOOLEAN NOT NULL DEFAULT true,
        "autoBackup" BOOLEAN NOT NULL DEFAULT true,
        "backupFrequency" TEXT NOT NULL DEFAULT 'daily',
        "sessionTimeout" INTEGER NOT NULL DEFAULT 24,
        "compactMode" BOOLEAN NOT NULL DEFAULT false,
        "theme" TEXT NOT NULL DEFAULT 'light',
        "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
        "dateFormat" TEXT NOT NULL DEFAULT 'MM/dd/yyyy',
        "currency" TEXT NOT NULL DEFAULT 'USD',
        "freshbooksClientId" TEXT,
        "freshbooksClientSecret" TEXT,
        "freshbooksAccessToken" TEXT,
        "freshbooksRefreshToken" TEXT,
        "freshbooksAccountId" TEXT,
        "freshbooksAutoSync" BOOLEAN NOT NULL DEFAULT true,
        "freshbooksSyncFrequency" TEXT NOT NULL DEFAULT 'daily',
        "updownApiKey" TEXT,
        "updownAutoSync" BOOLEAN NOT NULL DEFAULT true,
        "updownSyncFrequency" TEXT NOT NULL DEFAULT 'hourly',
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
      )
    `

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Notification" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "type" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "read" BOOLEAN NOT NULL DEFAULT false,
        "userId" TEXT,
        "clientId" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
        FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE
      )
    `

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "VerificationToken" (
        "identifier" TEXT NOT NULL,
        "token" TEXT NOT NULL UNIQUE,
        "expires" TIMESTAMP NOT NULL,
        UNIQUE("identifier", "token")
      )
    `

    // Now check if admin user exists
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
