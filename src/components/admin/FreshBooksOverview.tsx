'use client'

import { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, FileText, AlertCircle, RefreshCw, ExternalLink, Receipt } from 'lucide-react'

interface FreshBooksData {
  totalRevenue: number
  totalExpenses: number
  netIncome: number
  outstandingInvoices: number
  paidInvoices: number
  currency: string
  recentInvoices: any[]
  upcomingInvoices: any[]
}

export default function FreshBooksOverview() {
  const [data, setData] = useState<FreshBooksData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFreshBooksData()
  }, [])

  const fetchFreshBooksData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/freshbooks/overview')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch FreshBooks data')
      }

      setData(result)
    } catch (err) {
      console.error('Error fetching FreshBooks data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch FreshBooks data')
    } finally {
      setIsLoading(false)
    }
  }

  const refreshData = () => {
    fetchFreshBooksData()
  }

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getNetIncomeStatus = (netIncome: number) => {
    if (netIncome > 0) return 'Profitable'
    if (netIncome === 0) return 'Break Even'
    return 'Loss'
  }

  const getNetIncomeColor = (netIncome: number) => {
    if (netIncome > 0) return 'text-green-600'
    if (netIncome === 0) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 font-heading flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-gray-600" />
            Financial Overview
          </h3>
        </div>
        <div className="h-32 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 font-heading flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-gray-600" />
            Financial Overview
          </h3>
          <button
            onClick={refreshData}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm mb-2">Unable to load financial data</p>
          <p className="text-gray-400 text-xs mb-4">Check your FreshBooks connection</p>
          <button
            onClick={refreshData}
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 font-heading flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-gray-600" />
          Financial Overview
        </h3>
        <button
          onClick={refreshData}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          title="Refresh data"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Main Financial Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="h-5 w-5 text-gray-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(data.totalRevenue, data.currency)}
          </div>
          <div className="text-sm text-gray-600">Total Revenue</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Receipt className="h-5 w-5 text-gray-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(data.totalExpenses, data.currency)}
          </div>
          <div className="text-sm text-gray-600">Total Expenses</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <DollarSign className="h-5 w-5 text-gray-500" />
          </div>
          <div className={`text-2xl font-bold ${getNetIncomeColor(data.netIncome)}`}>
            {formatCurrency(data.netIncome, data.currency)}
          </div>
          <div className="text-sm text-gray-600">Net Income</div>
        </div>
      </div>

      {/* Financial Status */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Business Status</span>
          <span className={`text-sm font-medium ${getNetIncomeColor(data.netIncome)}`}>
            {getNetIncomeStatus(data.netIncome)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                data.netIncome > 0 ? 'bg-green-500' :
                data.netIncome === 0 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ 
                width: data.totalRevenue > 0 
                  ? `${Math.max(10, Math.min(100, ((data.totalRevenue - data.totalExpenses) / data.totalRevenue) * 100))}%`
                  : '0%'
              }}
            />
          </div>
          <div className="text-sm text-gray-600">
            {data.paidInvoices} paid invoices
          </div>
        </div>
        {data.outstandingInvoices > 0 && (
          <div className="text-xs text-gray-500 mt-2">
            {formatCurrency(data.outstandingInvoices, data.currency)} outstanding
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mb-4">
        <a
          href="https://my.freshbooks.com/#/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors text-sm"
        >
          <ExternalLink className="h-4 w-4" />
          View Dashboard
        </a>
        
        {data.outstandingInvoices > 0 && (
          <button className="flex-1 inline-flex items-center justify-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-700 px-3 py-2 rounded-lg transition-colors text-sm">
            <AlertCircle className="h-4 w-4" />
            Outstanding
          </button>
        )}
        
        {data.outstandingInvoices === 0 && data.paidInvoices > 0 && (
          <button className="flex-1 inline-flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2 rounded-lg transition-colors text-sm">
            <TrendingUp className="h-4 w-4" />
            All Paid
          </button>
        )}
      </div>

      {/* Recent Invoices (if any) */}
      {data.recentInvoices && data.recentInvoices.length > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Activity</h4>
          <div className="space-y-2">
            {data.recentInvoices.slice(0, 3).map((invoice, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">
                    #{invoice.invoice_number}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(parseFloat(invoice.amount.amount), data.currency)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(invoice.date_paid || invoice.create_date)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!data.recentInvoices || data.recentInvoices.length === 0) && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm mb-2">No invoices found</p>
          <p className="text-gray-400 text-xs">Create invoices in FreshBooks to see them here</p>
        </div>
      )}
    </div>
  )
}
