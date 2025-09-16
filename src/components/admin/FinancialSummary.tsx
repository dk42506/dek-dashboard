'use client'

import { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, FileText, AlertCircle, RefreshCw } from 'lucide-react'

interface FinancialData {
  totalInvoiced: number
  totalPaid: number
  totalOutstanding: number
  totalExpenses: number
  invoiceCount: number
  expenseCount: number
  invoices: any[]
  expenses: any[]
}

interface FinancialSummaryProps {
  clientId: string
  clientName: string
  businessName?: string
}

export default function FinancialSummary({ clientId, clientName, businessName }: FinancialSummaryProps) {
  const [financialData, setFinancialData] = useState<FinancialData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isConfigured, setIsConfigured] = useState(false)
  const [isMatched, setIsMatched] = useState(false)

  useEffect(() => {
    fetchFinancialData()
  }, [clientId])

  const fetchFinancialData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/clients/${clientId}/financials`)
      const data = await response.json()

      if (!response.ok) {
        if (data.configured === false) {
          setIsConfigured(false)
          setError('FreshBooks integration not configured')
        } else if (data.matched === false) {
          setIsConfigured(true)
          setIsMatched(false)
          setError('No matching FreshBooks client found')
        } else {
          throw new Error(data.error || 'Failed to fetch financial data')
        }
        return
      }

      setIsConfigured(true)
      setIsMatched(true)
      setFinancialData(data.financials)
    } catch (err) {
      console.error('Error fetching financial data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch financial data')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Financial Summary
          </h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (!isConfigured) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Financial Summary
          </h3>
        </div>
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">FreshBooks Not Configured</h4>
          <p className="text-gray-600 mb-4">
            Configure FreshBooks integration in admin settings to view financial data.
          </p>
          <a
            href="/admin/settings"
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Configure FreshBooks
          </a>
        </div>
      </div>
    )
  }

  if (!isMatched) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Financial Summary
          </h3>
        </div>
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No FreshBooks Match</h4>
          <p className="text-gray-600 mb-2">
            No matching FreshBooks client found for <strong>{businessName || clientName}</strong>.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Make sure the business name matches exactly in FreshBooks.
          </p>
          <button
            onClick={fetchFinancialData}
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Financial Summary
          </h3>
        </div>
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h4>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchFinancialData}
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!financialData) {
    return null
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          Financial Summary
        </h3>
        <button
          onClick={fetchFinancialData}
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
            <span className="text-sm font-medium text-green-800">Total Invoiced</span>
          </div>
          <p className="text-2xl font-bold text-green-900">
            {formatCurrency(financialData.totalInvoiced)}
          </p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Total Paid</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">
            {formatCurrency(financialData.totalPaid)}
          </p>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">Outstanding</span>
          </div>
          <p className="text-2xl font-bold text-orange-900">
            {formatCurrency(financialData.totalOutstanding)}
          </p>
        </div>

        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">Expenses</span>
          </div>
          <p className="text-2xl font-bold text-red-900">
            {formatCurrency(financialData.totalExpenses)}
          </p>
        </div>
      </div>

      {/* Invoice Overview */}
      {financialData.invoices.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-semibold text-gray-900">Invoice Overview</h4>
            <span className="text-sm text-gray-500">{financialData.invoices.length} total invoices</span>
          </div>
          
          {/* Invoice Status Summary */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-sm font-medium text-green-800">Paid</p>
              <p className="text-lg font-bold text-green-900">
                {financialData.invoices.filter(inv => inv.v3_status === 'paid').length}
              </p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-center">
              <p className="text-sm font-medium text-orange-800">Outstanding</p>
              <p className="text-lg font-bold text-orange-900">
                {financialData.invoices.filter(inv => parseFloat(inv.outstanding.amount) > 0).length}
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <p className="text-sm font-medium text-blue-800">Draft</p>
              <p className="text-lg font-bold text-blue-900">
                {financialData.invoices.filter(inv => inv.v3_status === 'draft').length}
              </p>
            </div>
          </div>

          {/* Recent Invoices List */}
          <div className="space-y-3">
            <h5 className="text-sm font-medium text-gray-700">Recent Invoices</h5>
            {financialData.invoices.slice(0, 8).map((invoice, index) => {
              const isOverdue = invoice.v3_status !== 'paid' && 
                parseFloat(invoice.outstanding.amount) > 0 && 
                new Date(invoice.due_date) < new Date()
              
              const getStatusColor = (status: string, isOverdue: boolean) => {
                if (isOverdue) return 'text-red-600 bg-red-50'
                switch (status) {
                  case 'paid': return 'text-green-600 bg-green-50'
                  case 'sent': return 'text-blue-600 bg-blue-50'
                  case 'draft': return 'text-gray-600 bg-gray-50'
                  case 'partial': return 'text-orange-600 bg-orange-50'
                  default: return 'text-gray-600 bg-gray-50'
                }
              }

              return (
                <div key={index} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-medium text-gray-900">#{invoice.invoice_number}</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.v3_status, isOverdue)}`}>
                        {isOverdue ? 'Overdue' : invoice.v3_status.charAt(0).toUpperCase() + invoice.v3_status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Created: {formatDate(invoice.create_date)}</span>
                      <span>Due: {formatDate(invoice.due_date)}</span>
                      {invoice.date_paid && (
                        <span className="text-green-600">Paid: {formatDate(invoice.date_paid)}</span>
                      )}
                    </div>
                    {invoice.notes && (
                      <p className="text-sm text-gray-500 mt-1 truncate">{invoice.notes}</p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-semibold text-gray-900 mb-1">
                      {formatCurrency(parseFloat(invoice.amount.amount))}
                    </p>
                    {parseFloat(invoice.paid.amount) > 0 && parseFloat(invoice.outstanding.amount) > 0 && (
                      <p className="text-xs text-blue-600">
                        {formatCurrency(parseFloat(invoice.paid.amount))} paid
                      </p>
                    )}
                    {parseFloat(invoice.outstanding.amount) > 0 && (
                      <p className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-orange-600'}`}>
                        {formatCurrency(parseFloat(invoice.outstanding.amount))} due
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
            
            {financialData.invoices.length > 8 && (
              <div className="text-center pt-2">
                <p className="text-sm text-gray-500">
                  Showing 8 of {financialData.invoices.length} invoices
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t border-gray-200">
        <span>{financialData.invoiceCount} total invoices</span>
        <span>{financialData.expenseCount} total expenses</span>
      </div>
    </div>
  )
}
