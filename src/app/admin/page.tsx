'use client'

import { useEffect, useState } from 'react'
import { Users, UserPlus, TrendingUp, Building2, AlertCircle, X } from 'lucide-react'
import { DashboardStats } from '@/types'
import UpdownStatsWidget from '@/components/admin/UpdownStatsWidget'
import FreshBooksOverview from '@/components/admin/FreshBooksOverview'

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    activeClients: 0,
    newThisMonth: 0,
    totalRevenue: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/admin/stats')
        if (response.ok) {
          const data = await response.json()
          setStats({
            totalClients: data.totalClients,
            activeClients: data.activeClients,
            newThisMonth: data.newThisMonth,
            totalRevenue: data.totalRevenue || 0,
          })
        } else {
          console.error('Failed to fetch stats')
          // Fallback to mock data
          setStats({
            totalClients: 0,
            activeClients: 0,
            newThisMonth: 0,
            totalRevenue: 0,
          })
        }
      } catch (error) {
        console.error('Error loading stats:', error)
        // Fallback to mock data
        setStats({
          totalClients: 0,
          activeClients: 0,
          newThisMonth: 0,
          totalRevenue: 0,
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])

  const statCards = [
    {
      name: 'Total Clients',
      value: stats.totalClients,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      name: 'Active Clients',
      value: stats.activeClients,
      icon: Building2,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      name: 'New This Month',
      value: stats.newThisMonth,
      icon: UserPlus,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      name: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
  ]

  return (
    <div className="space-y-6">

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold font-heading mb-2">
          Welcome to DEK Innovations Dashboard
        </h1>
        <p className="text-primary-100">
          Manage your clients and track your business growth from one central location.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="bg-white rounded-xl p-6 shadow-soft border border-gray-100 card-hover"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {stat.name}
                </p>
                <div className="text-2xl font-bold text-gray-900">
                  {isLoading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                  ) : (
                    stat.value
                  )}
                </div>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 font-heading">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm mb-2">No recent activity</p>
                <p className="text-gray-400 text-xs">Activity will appear here as you use the dashboard</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 font-heading">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <a
              href="/admin/clients/new"
              className="flex items-center gap-3 p-4 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors group"
            >
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <UserPlus className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Add New Client</p>
                <p className="text-sm text-gray-600">Create a new client profile</p>
              </div>
            </a>
            
            <a
              href="/admin/clients"
              className="flex items-center gap-3 p-4 bg-secondary-50 hover:bg-secondary-100 rounded-lg transition-colors group"
            >
              <div className="w-10 h-10 bg-secondary-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">View All Clients</p>
                <p className="text-sm text-gray-600">Browse and manage clients</p>
              </div>
            </a>
            
            <a
              href="/admin/reports"
              className="flex items-center gap-3 p-4 bg-accent-50 hover:bg-accent-100 rounded-lg transition-colors group"
            >
              <div className="w-10 h-10 bg-accent-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Generate Reports</p>
                <p className="text-sm text-gray-600">View analytics and insights</p>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* FreshBooks Overview - Full Width */}
      <div className="grid grid-cols-1 gap-6">
        <FreshBooksOverview />
      </div>

      {/* Other Integrations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 font-heading">
            Ads Performance
          </h3>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">
              GoHighLevel integration coming soon
            </p>
          </div>
        </div>

        <UpdownStatsWidget />
      </div>
    </div>
  )
}
