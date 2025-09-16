// Updown.io account statistics and usage tracking

import { prisma } from './prisma'

export interface UpdownStats {
  totalChecks: number
  activeChecks: number
  disabledChecks: number
  checksDown: number
  totalMonthlyRequests: number
  checksByPeriod: Record<number, number>
  averageUptime: number
  lastUpdated: Date
}

export interface UpdownCheck {
  token: string
  url: string
  alias: string | null
  enabled: boolean
  down: boolean
  uptime: number
  period: number
  last_check_at: string | null
  created_at: string
}

/**
 * Fetch all updown.io checks for the account
 */
export async function fetchUpdownChecks(): Promise<UpdownCheck[]> {
  const apiKey = process.env.UPDOWN_API_KEY
  if (!apiKey) {
    throw new Error('UPDOWN_API_KEY not configured')
  }

  try {
    const response = await fetch('https://updown.io/api/checks', {
      headers: {
        'X-API-KEY': apiKey,
      },
    })

    if (!response.ok) {
      throw new Error(`Updown.io API error: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching updown checks:', error)
    throw error
  }
}

/**
 * Calculate usage statistics from updown.io checks
 */
export function calculateUpdownStats(checks: UpdownCheck[]): UpdownStats {
  const totalChecks = checks.length
  const activeChecks = checks.filter(check => check.enabled).length
  const disabledChecks = totalChecks - activeChecks
  const checksDown = checks.filter(check => check.down && check.enabled).length

  // Calculate monthly requests based on check periods
  // Formula: (60 * 60 * 24 * 30) / period_in_seconds = requests per month per check
  const monthlySecondsTotal = 60 * 60 * 24 * 30 // 30 days in seconds
  let totalMonthlyRequests = 0
  const checksByPeriod: Record<number, number> = {}

  checks.forEach(check => {
    if (check.enabled) {
      const requestsPerMonth = Math.floor(monthlySecondsTotal / check.period)
      totalMonthlyRequests += requestsPerMonth
      
      checksByPeriod[check.period] = (checksByPeriod[check.period] || 0) + 1
    }
  })

  // Calculate average uptime (only for enabled checks)
  const enabledChecks = checks.filter(check => check.enabled)
  const averageUptime = enabledChecks.length > 0 
    ? enabledChecks.reduce((sum, check) => sum + check.uptime, 0) / enabledChecks.length
    : 0

  return {
    totalChecks,
    activeChecks,
    disabledChecks,
    checksDown,
    totalMonthlyRequests,
    checksByPeriod,
    averageUptime,
    lastUpdated: new Date(),
  }
}

/**
 * Get human-readable period description
 */
export function getPeriodDescription(periodInSeconds: number): string {
  if (periodInSeconds < 60) {
    return `${periodInSeconds}s`
  } else if (periodInSeconds < 3600) {
    return `${Math.floor(periodInSeconds / 60)}m`
  } else {
    return `${Math.floor(periodInSeconds / 3600)}h`
  }
}

/**
 * Estimate monthly cost based on updown.io pricing
 * Note: This is an estimate based on public pricing, actual costs may vary
 */
export function estimateMonthlyCost(stats: UpdownStats): { 
  estimatedCost: number
  tier: string
  description: string
} {
  const { activeChecks, totalMonthlyRequests } = stats

  // Updown.io pricing tiers (as of 2024, may change)
  if (activeChecks <= 10 && totalMonthlyRequests <= 100000) {
    return {
      estimatedCost: 0,
      tier: 'Free',
      description: 'Up to 10 checks, 100k requests/month'
    }
  } else if (activeChecks <= 50) {
    return {
      estimatedCost: 15,
      tier: 'Starter',
      description: 'Up to 50 checks, unlimited requests'
    }
  } else if (activeChecks <= 200) {
    return {
      estimatedCost: 35,
      tier: 'Business',
      description: 'Up to 200 checks, unlimited requests'
    }
  } else {
    return {
      estimatedCost: 75,
      tier: 'Enterprise',
      description: '500+ checks, unlimited requests'
    }
  }
}

/**
 * Get Updown statistics from the database
 */
export async function getUpdownStats() {
  const total = await prisma.user.count({
    where: { website: { not: null } }
  })

  const up = await prisma.user.count({ where: { websiteStatus: 'up' } })
  const down = await prisma.user.count({ where: { websiteStatus: 'down' } })
  const unknown = await prisma.user.count({ 
    where: { 
      OR: [
        { websiteStatus: null },
        { websiteStatus: 'unknown' }
      ]
    }
  })
  const checking = await prisma.user.count({ where: { websiteStatus: 'checking' } })

  const percentage = total > 0 ? Math.round((up / total) * 100) : 0

  return { total, up, down, unknown, checking, percentage }
}
