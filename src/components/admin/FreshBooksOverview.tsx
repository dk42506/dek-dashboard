'use client'

import { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, FileText, AlertCircle, RefreshCw, Calendar, Clock } from 'lucide-react'

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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'text-green-600 bg-green-50'
      case 'sent': return 'text-blue-600 bg-blue-50'
      case 'draft': return 'text-gray-600 bg-gray-50'
      case 'partial': return 'text-orange-600 bg-orange-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 font-heading">
            FreshBooks Overview
          </h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 font-heading">
            FreshBooks Overview
          </h3>
        </div>
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h4>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchFreshBooksData}
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
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
          <DollarSign className="h-5 w-5 text-green-600" />
          FreshBooks Overview
        </h3>
        <button
          onClick={fetchFreshBooksData}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          title="Refresh data"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold text-green-900">
            {formatCurrency(data.totalRevenue, data.currency)}
          </p>
        </div>

        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">Total Expenses</span>
          </div>
          <p className="text-2xl font-bold text-red-900">
            {formatCurrency(data.totalExpenses, data.currency)}
          </p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Net Income</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">
            {formatCurrency(data.netIncome, data.currency)}
          </p>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">Outstanding</span>
          </div>
          <p className="text-2xl font-bold text-orange-900">
            {formatCurrency(data.outstandingInvoices, data.currency)}
          </p>
        </div>
      </div>

      {/* Recent Invoices */}
      {data.recentInvoices && data.recentInvoices.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-600" />
              Recent Invoices
            </h4>
            <span className="text-sm text-gray-500">{data.paidInvoices} paid invoices</span>
          </div>
          
          <div className="space-y-3">
            {data.recentInvoices.slice(0, 5).map((invoice, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-medium text-gray-900">#{invoice.invoice_number}</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.v3_status)}`}>
                      {invoice.v3_status.charAt(0).toUpperCase() + invoice.v3_status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Created: {formatDate(invoice.create_date)}</span>
                    {invoice.date_paid && (
                      <span className="text-green-600">Paid: {formatDate(invoice.date_paid)}</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(parseFloat(invoice.amount.amount), data.currency)}
                  </p>
                  {parseFloat(invoice.outstanding.amount) > 0 && (
                    <p className="text-xs text-orange-600">
                      {formatCurrency(parseFloat(invoice.outstanding.amount), data.currency)} due
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Invoices */}
      {data.upcomingInvoices && data.upcomingInvoices.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-600" />
              Upcoming Due Dates
            </h4>
          </div>
          
          <div className="space-y-2">
            {data.upcomingInvoices.slice(0, 3).map((invoice, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">#{invoice.invoice_number}</p>
                  <p className="text-sm text-gray-600">Due: {formatDate(invoice.due_date)}</p>
                </div>
                <p className="font-semibold text-orange-900">
                  {formatCurrency(parseFloat(invoice.outstanding.amount), data.currency)}
                </p>
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
