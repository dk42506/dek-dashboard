'use client'
import { useEffect, useState } from 'react'

type UpdownStats = {
  total: number
  up: number
  down: number
  unknown: number
  checking: number
  percentage: number
}

export default function UpdownStatsWidget() {
  const [stats, setStats] = useState<UpdownStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/updown-stats')
        if (!res.ok) throw new Error('Failed to load')
        const data = await res.json()
        if (mounted) setStats(data)
      } catch (e) {
        console.error('Updown stats error', e)
        if (mounted) setStats(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
        <div className="h-28 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100 text-center">
        <p className="text-sm text-gray-600">Unable to load uptime stats.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Website Uptime Overview</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="text-sm text-gray-500">Monitored</div>
        <div className="font-medium text-gray-900">{stats.total}</div>

        <div className="text-sm text-green-600">Online</div>
        <div className="font-medium text-gray-900">{stats.up}</div>

        <div className="text-sm text-red-600">Offline</div>
        <div className="font-medium text-gray-900">{stats.down}</div>

        <div className="text-sm text-yellow-600">Unknown</div>
        <div className="font-medium text-gray-900">{stats.unknown}</div>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        Uptime percentage (estimated): <span className="font-medium text-gray-900">{stats.percentage}%</span>
      </div>
    </div>
  )
}
  }

  if (error || !stats?.configured) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 font-heading flex items-center gap-2">
          <Globe className="h-5 w-5 text-purple-500" />
          Updown.io Stats
        </h3>
        <div className="text-center py-4">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 text-sm mb-2">
            {error || 'Updown.io not configured'}
          </p>
          <button
            onClick={fetchStats}
            className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1 mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 font-heading flex items-center gap-2">
          <Globe className="h-5 w-5 text-purple-500" />
          Updown.io Stats
        </h3>
        <button
          onClick={fetchStats}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          title="Refresh stats"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Active Checks */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Active Checks
          </span>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900">{stats.activeChecks}</span>
            {stats.checksDown > 0 && (
              <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                {stats.checksDown} down
              </span>
            )}
          </div>
        </div>

        {/* Average Uptime */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Avg Uptime
          </span>
          <span className={`font-semibold ${stats.averageUptime >= 99 ? 'text-green-600' : stats.averageUptime >= 95 ? 'text-yellow-600' : 'text-red-600'}`}>
            {stats.averageUptime.toFixed(2)}%
          </span>
        </div>

        {/* Monthly Requests */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Monthly Requests
          </span>
          <span className="font-semibold text-gray-900">
            {formatNumber(stats.totalMonthlyRequests)}
          </span>
        </div>

        {/* Cost Estimate */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Est. Monthly Cost
          </span>
          <div className="text-right">
            <span className="font-semibold text-gray-900">
              ${stats.costEstimate.estimatedCost}
            </span>
            <div className="text-xs text-gray-500">
              {stats.costEstimate.tier}
            </div>
          </div>
        </div>

        {/* Check Periods Breakdown */}
        {Object.keys(stats.checksByPeriod).length > 0 && (
          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">Check Frequencies:</p>
            <div className="flex flex-wrap gap-1">
              {Object.entries(stats.checksByPeriod).map(([period, count]) => (
                <span
                  key={period}
                  className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full"
                >
                  {count}x {getPeriodDescription(parseInt(period))}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Last Updated */}
        <div className="text-xs text-gray-400 text-center pt-2 border-t border-gray-100">
          Updated {new Date(stats.lastUpdated).toLocaleTimeString()}
        </div>
      </div>
    </div>
  )
}
