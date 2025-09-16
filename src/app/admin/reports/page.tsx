'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, DollarSign, Users, Calendar, Download, Filter, RefreshCw, AlertCircle, X } from 'lucide-react'

export default function ReportsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('30')
  const [freshbooksConnected, setFreshbooksConnected] = useState(false)
  const [showFreshbooksAlert, setShowFreshbooksAlert] = useState(true)
  const [reportData, setReportData] = useState({
    revenue: {
      current: 0,
      previous: 0,
      growth: 0
    },
    clients: {
      total: 12,
      new: 3,
      active: 10,
      retention: 83.3
    },
    projects: {
      completed: 8,
      inProgress: 4,
      pending: 2
    }
  })

  useEffect(() => {
    const loadReports = async () => {
      setIsLoading(true)
      try {
        // Get admin stats for revenue data
        const statsResponse = await fetch('/api/admin/stats')
        let totalRevenue = 0
        let freshbooksStatus = false
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          totalRevenue = statsData.totalRevenue || 0
          freshbooksStatus = totalRevenue > 0
        }
        
        setFreshbooksConnected(freshbooksStatus)
        setShowFreshbooksAlert(!freshbooksStatus)
        
        // Try to get reports data
        const response = await fetch(`/api/admin/reports?period=${selectedPeriod}`)
        if (response.ok) {
          const data = await response.json()
          setReportData({
            revenue: {
              current: totalRevenue,
              previous: data.revenue?.previous || 0,
              growth: data.revenue?.growth || 0
            },
            clients: {
              total: data.clients?.total || 12,
              new: data.clients?.new || 3,
              active: data.clients?.active || 10,
              retention: data.clients?.retention || 83.3
            },
            projects: {
              completed: data.projects?.completed || 8,
              inProgress: data.projects?.inProgress || 4,
              pending: data.projects?.pending || 2
            }
          })
        } else {
          // Fallback data with real revenue
          setReportData({
            revenue: {
              current: totalRevenue,
              previous: 0,
              growth: 0
            },
            clients: {
              total: 12,
              new: 3,
              active: 10,
              retention: 83.3
            },
            projects: {
              completed: 8,
              inProgress: 4,
              pending: 2
            }
          })
        }
      } catch (error) {
        console.error('Error loading reports:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadReports()
  }, [selectedPeriod])

  const revenueCards = [
    {
      title: 'Total Revenue',
      value: `$${reportData.revenue.current.toLocaleString()}`,
      change: `+${reportData.revenue.growth}%`,
      changeType: 'positive',
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Active Clients',
      value: reportData.clients.active,
      change: `${reportData.clients.retention}% retention`,
      changeType: 'positive',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Projects Completed',
      value: reportData.projects.completed,
      change: `${reportData.projects.inProgress} in progress`,
      changeType: 'neutral',
      icon: BarChart3,
      color: 'bg-purple-500'
    },
    {
      title: 'Growth Rate',
      value: `${reportData.revenue.growth}%`,
      change: 'vs last period',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'bg-orange-500'
    }
  ]

  return (
    <div className="space-y-6">
      {/* FreshBooks Connection Alert */}
      {!freshbooksConnected && showFreshbooksAlert && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800 mb-1">
                FreshBooks Not Connected
              </h3>
              <p className="text-sm text-red-700 mb-3">
                Revenue data is currently unavailable. Connect your FreshBooks account to view real financial metrics and reports.
              </p>
              <div className="flex items-center gap-3">
                <a
                  href="/admin/settings"
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
                >
                  Connect FreshBooks
                </a>
                <button
                  onClick={() => setShowFreshbooksAlert(false)}
                  className="text-sm text-red-600 hover:text-red-800 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowFreshbooksAlert(false)}
              className="text-red-400 hover:text-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-heading">
            Reports & Analytics
          </h1>
          <p className="text-gray-600">
            Track your business performance and growth metrics
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          
          <button className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {revenueCards.map((card) => (
          <div key={card.title} className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${card.color.replace('bg-', 'bg-').replace('-500', '-100')}`}>
                <card.icon className={`h-6 w-6 ${card.color.replace('bg-', 'text-')}`} />
              </div>
              {isLoading && (
                <RefreshCw className="h-4 w-4 text-gray-400 animate-spin" />
              )}
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {isLoading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
                ) : (
                  card.value
                )}
              </div>
              <p className={`text-sm ${
                card.changeType === 'positive' ? 'text-green-600' : 
                card.changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
              }`}>
                {card.change}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 font-heading">
              Revenue Trend
            </h3>
            <Filter className="h-5 w-5 text-gray-400" />
          </div>
          
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="h-32 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg flex items-end justify-center">
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-primary-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Chart visualization coming soon</p>
                  <p className="text-xs text-gray-400">Integration with Chart.js planned</p>
                </div>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
              </div>
            </div>
          )}
        </div>

        {/* Client Growth Chart */}
        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 font-heading">
              Client Growth
            </h3>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="h-32 bg-gradient-to-r from-secondary-50 to-accent-50 rounded-lg flex items-end justify-center">
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-secondary-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Growth chart coming soon</p>
                  <p className="text-xs text-gray-400">Real-time client analytics</p>
                </div>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Week 1</span>
                <span>Week 2</span>
                <span>Week 3</span>
                <span>Week 4</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Clients */}
        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 font-heading">
            Top Clients
          </h3>
          
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    J
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">John's Auto Shop</p>
                    <p className="text-sm text-gray-500">$15,000</p>
                  </div>
                </div>
                <span className="text-green-600 text-sm font-medium">33%</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    S
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Sarah's Bakery</p>
                    <p className="text-sm text-gray-500">$12,000</p>
                  </div>
                </div>
                <span className="text-blue-600 text-sm font-medium">27%</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    W
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Wilson Plumbing</p>
                    <p className="text-sm text-gray-500">$10,000</p>
                  </div>
                </div>
                <span className="text-purple-600 text-sm font-medium">22%</span>
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 font-heading">
            Recent Activity
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Payment received</p>
                <p className="text-xs text-gray-500">John's Auto Shop - 2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New project started</p>
                <p className="text-xs text-gray-500">Sarah's Bakery - 5 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Invoice sent</p>
                <p className="text-xs text-gray-500">Wilson Plumbing - 1 day ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 font-heading">
            Quick Stats
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Average Project Value</span>
              <span className="font-semibold text-gray-900">$3,750</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Client Satisfaction</span>
              <span className="font-semibold text-green-600">98%</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Response Time</span>
              <span className="font-semibold text-blue-600">&lt; 2 hours</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Project Success Rate</span>
              <span className="font-semibold text-purple-600">95%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Future Integrations Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Coming in Phase 2
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-1">FreshBooks Integration</h4>
            <p>Real-time invoice and payment data</p>
          </div>
          <div>
            <h4 className="font-medium mb-1">GoHighLevel Analytics</h4>
            <p>Marketing and CRM performance metrics</p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Advanced Charts</h4>
            <p>Interactive visualizations and trends</p>
          </div>
        </div>
      </div>
    </div>
  )
}
