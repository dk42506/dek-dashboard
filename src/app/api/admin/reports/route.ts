import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // days

    const daysAgo = parseInt(period)
    const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
    const previousPeriodStart = new Date(startDate.getTime() - daysAgo * 24 * 60 * 60 * 1000)

    // Get client statistics
    const totalClients = await prisma.user.count({
      where: { role: 'CLIENT' }
    })

    const newClientsThisPeriod = await prisma.user.count({
      where: {
        role: 'CLIENT',
        createdAt: { gte: startDate }
      }
    })

    const newClientsPreviousPeriod = await prisma.user.count({
      where: {
        role: 'CLIENT',
        createdAt: {
          gte: previousPeriodStart,
          lt: startDate
        }
      }
    })

    const activeClients = await prisma.user.count({
      where: {
        role: 'CLIENT',
        updatedAt: { gte: startDate }
      }
    })

    // Calculate retention rate (simplified - clients who have been active in the period)
    const retentionRate = totalClients > 0 ? Math.round((activeClients / totalClients) * 100) : 0

    // Mock uptime statistics for now (until websiteStatus field is properly recognized)
    const uptimeStats = {
      total: Math.max(1, Math.floor(totalClients * 0.8)), // Assume 80% of clients have websites
      up: Math.max(1, Math.floor(totalClients * 0.75)), // 75% up
      down: Math.max(0, Math.floor(totalClients * 0.05)), // 5% down
      unknown: Math.max(0, Math.floor(totalClients * 0.05)) // 5% unknown
    }

    const overallUptimePercentage = uptimeStats.total > 0 
      ? Math.round((uptimeStats.up / uptimeStats.total) * 100) 
      : 0

    // Get top clients by recent activity (simplified ranking)
    const topClients = await prisma.user.findMany({
      where: {
        role: 'CLIENT'
      },
      select: {
        id: true,
        name: true,
        businessName: true,
        updatedAt: true,
        createdAt: true
      },
      orderBy: [
        { updatedAt: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 5
    })

    // Format top clients with mock revenue data (since we don't have FreshBooks yet)
    const formattedTopClients = topClients.map((client, index) => {
      const mockRevenue = [15000, 12000, 10000, 8500, 7000][index] || 5000
      const percentage = Math.round((mockRevenue / 45000) * 100) // Mock total revenue
      
      return {
        id: client.id,
        name: client.businessName || client.name || 'Unknown Client',
        revenue: mockRevenue,
        percentage,
        initial: (client.businessName || client.name || 'U')[0].toUpperCase()
      }
    })

    // Recent activity
    const recentActivity = await prisma.user.findMany({
      where: {
        role: 'CLIENT',
        updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
      },
      select: {
        id: true,
        name: true,
        businessName: true,
        updatedAt: true,
        createdAt: true
      },
      orderBy: { updatedAt: 'desc' },
      take: 10
    })

    const formattedActivity = recentActivity.map(client => {
      const isNew = Math.abs(client.createdAt.getTime() - client.updatedAt.getTime()) < 60000 // Within 1 minute
      return {
        id: client.id,
        name: client.businessName || client.name || 'Unknown Client',
        action: isNew ? 'New client added' : 'Profile updated',
        timestamp: client.updatedAt,
        type: isNew ? 'new' : 'update'
      }
    })

    // Calculate growth rate
    const clientGrowthRate = newClientsPreviousPeriod > 0 
      ? Math.round(((newClientsThisPeriod - newClientsPreviousPeriod) / newClientsPreviousPeriod) * 100)
      : newClientsThisPeriod > 0 ? 100 : 0

    return NextResponse.json({
      period: daysAgo,
      clients: {
        total: totalClients,
        new: newClientsThisPeriod,
        active: activeClients,
        retention: retentionRate,
        growthRate: clientGrowthRate
      },
      uptime: {
        ...uptimeStats,
        percentage: overallUptimePercentage
      },
      topClients: formattedTopClients,
      recentActivity: formattedActivity,
      // Mock data for revenue (until FreshBooks integration)
      revenue: {
        current: 45000,
        previous: Math.round(45000 * (1 - clientGrowthRate / 100)),
        growth: clientGrowthRate
      },
      // Mock project data
      projects: {
        completed: Math.max(1, Math.floor(totalClients * 0.7)),
        inProgress: Math.max(1, Math.floor(totalClients * 0.3)),
        pending: Math.max(0, Math.floor(totalClients * 0.1))
      }
    })
  } catch (error) {
    console.error('Error fetching reports data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
