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
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="h-32 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-sm text-gray-600 mb-2">Unable to load uptime stats</p>
        <p className="text-xs text-gray-400">Check your Updown.io API configuration</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 font-heading">Website Uptime Overview</h3>
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-sm font-medium text-blue-600 mb-1">Monitored Sites</div>
          <div className="text-2xl font-bold text-blue-900">{stats.totalChecks}</div>
        </div>

        <div className="bg-green-50 rounded-lg p-3">
          <div className="text-sm font-medium text-green-600 mb-1">Online</div>
          <div className="text-2xl font-bold text-green-900">{stats.onlineChecks}</div>
        </div>

        <div className="bg-red-50 rounded-lg p-3">
          <div className="text-sm font-medium text-red-600 mb-1">Offline</div>
          <div className="text-2xl font-bold text-red-900">{stats.offlineChecks}</div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-3">
          <div className="text-sm font-medium text-yellow-600 mb-1">Unknown</div>
          <div className="text-2xl font-bold text-yellow-900">{stats.unknownChecks}</div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 text-center">
        <div className="text-sm text-gray-600 mb-1">Average Uptime</div>
        <div className="text-xl font-bold text-gray-900">{stats.averageUptime}%</div>
        <div className="text-xs text-gray-500 mt-1">
          ${stats.estimatedMonthlyCost.toFixed(2)}/month estimated cost
        </div>
      </div>
    </div>
  )
}
