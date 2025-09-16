'use client'
import { useEffect, useState } from 'react'

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
        <div className="font-medium text-gray-900">{stats.totalChecks}</div>

        <div className="text-sm text-green-600">Online</div>
        <div className="font-medium text-gray-900">{stats.onlineChecks}</div>

        <div className="text-sm text-red-600">Offline</div>
        <div className="font-medium text-gray-900">{stats.offlineChecks}</div>

        <div className="text-sm text-yellow-600">Unknown</div>
        <div className="font-medium text-gray-900">{stats.unknownChecks}</div>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        Uptime percentage (estimated): <span className="font-medium text-gray-900">{stats.averageUptime}%</span>
      </div>
    </div>
  )
}
