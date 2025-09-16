import { NextRequest, NextResponse } from 'next/server'
import { updownStats } from '@/lib/updown-stats'

export async function GET(request: NextRequest) {
  try {
    // Check if Updown.io is configured
    if (!updownStats.isConfigured()) {
      return NextResponse.json({
        error: 'Updown.io API not configured',
        details: 'UPDOWN_API_KEY environment variable not set'
      }, { status: 500 })
    }

    // Get all checks from Updown.io
    const checks = await updownStats.getAllChecks()
    
    if (!checks || checks.length === 0) {
      return NextResponse.json({
        totalChecks: 0,
        onlineChecks: 0,
        offlineChecks: 0,
        unknownChecks: 0,
        averageUptime: 0,
        estimatedMonthlyCost: 0,
        checks: []
      })
    }

    // Calculate statistics
    const totalChecks = checks.length
    const onlineChecks = checks.filter(check => !check.down && check.last_status === 200).length
    const offlineChecks = checks.filter(check => check.down || check.last_status !== 200).length
    const unknownChecks = checks.filter(check => !check.last_status).length
    
    // Calculate average uptime
    const totalUptime = checks.reduce((sum, check) => sum + (check.uptime || 0), 0)
    const averageUptime = totalChecks > 0 ? totalUptime / totalChecks : 0
    
    // Estimate monthly cost (Updown.io pricing: $0.15 per check per month for basic plan)
    const estimatedMonthlyCost = totalChecks * 0.15

    // Format checks for response
    const formattedChecks = checks.map(check => ({
      token: check.token,
      url: check.url,
      alias: check.alias || check.url,
      status: check.down ? 'down' : (check.last_status === 200 ? 'up' : 'unknown'),
      uptime: updownStats.formatUptime(check.uptime || 0),
      uptimeRaw: check.uptime || 0,
      lastChecked: check.last_check_at,
      nextCheck: check.next_check_at,
      enabled: check.enabled,
      error: check.error,
      ssl: check.ssl
    }))

    return NextResponse.json({
      totalChecks,
      onlineChecks,
      offlineChecks,
      unknownChecks,
      averageUptime: Math.round(averageUptime * 10000) / 100, // Convert to percentage with 2 decimal places
      estimatedMonthlyCost,
      checks: formattedChecks
    })

  } catch (error) {
    console.error('Error fetching Updown.io stats:', error)
    return NextResponse.json({
      error: 'Failed to fetch Updown.io statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!updownStats.isConfigured()) {
      return NextResponse.json({
        error: 'Updown.io API not configured'
      }, { status: 500 })
    }

    const body = await request.json()
    const { url, alias, period = 300 } = body

    if (!url) {
      return NextResponse.json({
        error: 'URL is required'
      }, { status: 400 })
    }

    // Create new check
    const check = await updownStats.createCheck(url, {
      alias,
      period,
      enabled: true,
      published: false
    })

    if (!check) {
      return NextResponse.json({
        error: 'Failed to create check'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      check: {
        token: check.token,
        url: check.url,
        alias: check.alias,
        enabled: check.enabled
      }
    })

  } catch (error) {
    console.error('Error creating Updown.io check:', error)
    return NextResponse.json({
      error: 'Failed to create check',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
