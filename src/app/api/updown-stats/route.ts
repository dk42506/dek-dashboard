import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { fetchUpdownChecks, calculateUpdownStats, estimateMonthlyCost } from '@/lib/updown-stats'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if updown.io API key is configured
    if (!process.env.UPDOWN_API_KEY) {
      return NextResponse.json({ 
        error: 'Updown.io API key not configured',
        configured: false 
      }, { status: 400 })
    }

    try {
      // Fetch all checks from updown.io
      const checks = await fetchUpdownChecks()
      
      // Calculate statistics
      const stats = calculateUpdownStats(checks)
      
      // Estimate monthly cost
      const costEstimate = estimateMonthlyCost(stats)
      
      return NextResponse.json({
        ...stats,
        costEstimate,
        configured: true,
        checks: checks.map(check => ({
          token: check.token,
          url: check.url,
          alias: check.alias,
          enabled: check.enabled,
          down: check.down,
          uptime: check.uptime,
          period: check.period,
          last_check_at: check.last_check_at,
        }))
      })
    } catch (error) {
      console.error('Error fetching updown.io data:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch updown.io data',
        configured: true,
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }

    const total = await prisma.user.count({
      where: { website: { not: null } }
    })

    const up = await prisma.user.count({
      where: { websiteStatus: 'up' }
    })
    const down = await prisma.user.count({
      where: { websiteStatus: 'down' }
    })
    const unknown = await prisma.user.count({
      where: { 
        OR: [
          { websiteStatus: null },
          { websiteStatus: 'unknown' }
        ]
      }
    })
    const checking = await prisma.user.count({
      where: { websiteStatus: 'checking' }
    })

    const percentage = total > 0 ? Math.round((up / total) * 100) : 0

    return NextResponse.json({
      total, up, down, unknown, checking, percentage
    })
  } catch (error) {
    console.error('Error in updown stats API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
