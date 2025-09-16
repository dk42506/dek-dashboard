import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AdminSettingsFormData } from '@/types'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get or create admin settings
    let settings = await prisma.adminSettings.findUnique({
      where: { userId: session.user.id }
    })

    if (!settings) {
      // Create default settings if they don't exist
      settings = await prisma.adminSettings.create({
        data: {
          userId: session.user.id,
          displayName: session.user.name || null,
          businessEmail: session.user.email || null,
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching admin settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const data: AdminSettingsFormData = await request.json()

    // Validate required fields and data types
    if (typeof data.emailNotifications !== 'boolean' ||
        typeof data.clientUpdateNotifications !== 'boolean' ||
        typeof data.systemAlerts !== 'boolean' ||
        typeof data.websiteMonitoringAlerts !== 'boolean' ||
        typeof data.monthlyReportEmails !== 'boolean' ||
        typeof data.autoBackup !== 'boolean' ||
        typeof data.compactMode !== 'boolean' ||
        typeof data.sessionTimeout !== 'number') {
      return NextResponse.json(
        { error: 'Invalid data types' },
        { status: 400 }
      )
    }

    // Validate enum values
    const validThemes = ['light', 'dark', 'system']
    const validBackupFrequencies = ['hourly', 'daily', 'weekly']
    const validDateFormats = ['MM/dd/yyyy', 'dd/MM/yyyy', 'yyyy-MM-dd']
    const validCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD']

    if (!validThemes.includes(data.theme)) {
      return NextResponse.json(
        { error: 'Invalid theme' },
        { status: 400 }
      )
    }

    if (!validBackupFrequencies.includes(data.backupFrequency)) {
      return NextResponse.json(
        { error: 'Invalid backup frequency' },
        { status: 400 }
      )
    }

    if (!validDateFormats.includes(data.dateFormat)) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      )
    }

    if (!validCurrencies.includes(data.currency)) {
      return NextResponse.json(
        { error: 'Invalid currency' },
        { status: 400 }
      )
    }

    // Update or create settings
    const settings = await prisma.adminSettings.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        displayName: data.displayName || null,
        businessName: data.businessName || null,
        businessEmail: data.businessEmail || null,
        businessPhone: data.businessPhone || null,
        businessAddress: data.businessAddress || null,
        businessWebsite: data.businessWebsite || null,
        defaultClientType: data.defaultClientType || null,
        emailNotifications: data.emailNotifications,
        clientUpdateNotifications: data.clientUpdateNotifications,
        systemAlerts: data.systemAlerts,
        websiteMonitoringAlerts: data.websiteMonitoringAlerts,
        monthlyReportEmails: data.monthlyReportEmails,
        autoBackup: data.autoBackup,
        backupFrequency: data.backupFrequency,
        sessionTimeout: data.sessionTimeout,
        compactMode: data.compactMode,
        theme: data.theme,
        timezone: data.timezone,
        dateFormat: data.dateFormat,
        currency: data.currency,
        freshbooksClientId: data.freshbooksClientId || null,
        freshbooksClientSecret: data.freshbooksClientSecret || null,
        freshbooksAccessToken: data.freshbooksAccessToken || null,
        freshbooksRefreshToken: data.freshbooksRefreshToken || null,
        freshbooksAccountId: data.freshbooksAccountId || null,
        freshbooksAutoSync: data.freshbooksAutoSync,
        freshbooksSyncFrequency: data.freshbooksSyncFrequency,
        updownApiKey: data.updownApiKey || null,
        updownAutoSync: data.updownAutoSync,
        updownSyncFrequency: data.updownSyncFrequency,
      },
      update: {
        displayName: data.displayName || null,
        businessName: data.businessName || null,
        businessEmail: data.businessEmail || null,
        businessPhone: data.businessPhone || null,
        businessAddress: data.businessAddress || null,
        businessWebsite: data.businessWebsite || null,
        defaultClientType: data.defaultClientType || null,
        emailNotifications: data.emailNotifications,
        clientUpdateNotifications: data.clientUpdateNotifications,
        systemAlerts: data.systemAlerts,
        websiteMonitoringAlerts: data.websiteMonitoringAlerts,
        monthlyReportEmails: data.monthlyReportEmails,
        autoBackup: data.autoBackup,
        backupFrequency: data.backupFrequency,
        sessionTimeout: data.sessionTimeout,
        compactMode: data.compactMode,
        theme: data.theme,
        timezone: data.timezone,
        dateFormat: data.dateFormat,
        currency: data.currency,
        freshbooksClientId: data.freshbooksClientId || null,
        freshbooksClientSecret: data.freshbooksClientSecret || null,
        freshbooksAccessToken: data.freshbooksAccessToken || null,
        freshbooksRefreshToken: data.freshbooksRefreshToken || null,
        freshbooksAccountId: data.freshbooksAccountId || null,
        freshbooksAutoSync: data.freshbooksAutoSync,
        freshbooksSyncFrequency: data.freshbooksSyncFrequency,
        updownApiKey: data.updownApiKey || null,
        updownAutoSync: data.updownAutoSync,
        updownSyncFrequency: data.updownSyncFrequency,
      }
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating admin settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
