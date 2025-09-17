'use client'
import { useEffect, useState } from 'react'
import { Globe, Activity, RefreshCw, ExternalLink, AlertTriangle, CheckCircle } from 'lucide-react'

type UpdownStats = {
  totalChecks: number
  onlineChecks: number
  offlineChecks: number
  unknownChecks: number
  averageUptime: number
  estimatedMonthlyCost: number
  checks: any[]
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

  const refreshStats = () => {
    setLoading(true)
    const load = async () => {
      try {
        const res = await fetch('/api/updown-stats')
        if (!res.ok) throw new Error('Failed to load')
        const data = await res.json()
        setStats(data)
      } catch (e) {
        console.error('Updown stats error', e)
        setStats(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 font-heading flex items-center gap-2">
            <Activity className="h-5 w-5 text-gray-600" />
            Website Monitoring
          </h3>
        </div>
        <div className="h-32 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 font-heading flex items-center gap-2">
            <Activity className="h-5 w-5 text-gray-600" />
            Website Monitoring
          </h3>
          <button
            onClick={refreshStats}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm mb-2">Unable to load uptime stats</p>
          <p className="text-gray-400 text-xs mb-4">Check your Updown.io API configuration</p>
          <button
            onClick={refreshStats}
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 99.5) return 'text-green-600'
    if (uptime >= 95) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getUptimeStatus = (uptime: number) => {
    if (uptime >= 99.5) return 'Excellent'
    if (uptime >= 95) return 'Good'
    return 'Needs Attention'
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 font-heading flex items-center gap-2">
          <Activity className="h-5 w-5 text-gray-600" />
          Website Monitoring
        </h3>
        <button
          onClick={refreshStats}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          title="Refresh data"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
      
      {/* Main Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Globe className="h-5 w-5 text-gray-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalChecks}</div>
          <div className="text-sm text-gray-600">Total Sites</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.onlineChecks}</div>
          <div className="text-sm text-gray-600">Online</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.offlineChecks}</div>
          <div className="text-sm text-gray-600">Issues</div>
        </div>
      </div>

      {/* Uptime Status */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Uptime</span>
          <span className={`text-sm font-medium ${getUptimeColor(stats.averageUptime)}`}>
            {getUptimeStatus(stats.averageUptime)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className={`text-2xl font-bold ${getUptimeColor(stats.averageUptime)}`}>
            {stats.averageUptime.toFixed(2)}%
          </div>
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                stats.averageUptime >= 99.5 ? 'bg-green-500' :
                stats.averageUptime >= 95 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(stats.averageUptime, 100)}%` }}
            />
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          Monitoring cost: ${stats.estimatedMonthlyCost.toFixed(2)}/month
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <a
          href="https://updown.io/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors text-sm"
        >
          <ExternalLink className="h-4 w-4" />
          View Dashboard
        </a>
        
        {stats.offlineChecks > 0 && (
          <button className="flex-1 inline-flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded-lg transition-colors text-sm">
            <AlertTriangle className="h-4 w-4" />
            View Issues
          </button>
        )}
        
        {stats.offlineChecks === 0 && (
          <button className="flex-1 inline-flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2 rounded-lg transition-colors text-sm">
            <CheckCircle className="h-4 w-4" />
            All Good
          </button>
        )}
      </div>

      {/* Site List (if there are issues) */}
      {stats.offlineChecks > 0 && stats.checks && stats.checks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Sites with Issues</h4>
          <div className="space-y-2">
            {stats.checks
              .filter(check => check.status !== 'up')
              .slice(0, 3)
              .map((check, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {check.alias || check.url}
                    </span>
                  </div>
                  <span className="text-xs text-red-600 capitalize">
                    {check.status || 'Unknown'}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
