'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Edit, Mail, Phone, MapPin, Calendar, FileText, DollarSign, TrendingUp, Globe, Clock, Building2, UserCheck, Activity } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ClientUser } from '@/types'
import NotesSection from '@/components/admin/NotesSection'
import FinancialSummary from '@/components/admin/FinancialSummary'
import { getStatusDisplay } from '@/lib/website-monitor'

export default function ClientProfilePage() {
  const params = useParams()
  const clientId = params.id as string
  const [client, setClient] = useState<ClientUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)

  useEffect(() => {
    // Load client data from API
    const loadClient = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/clients/${clientId}`)
        if (response.ok) {
          const clientData = await response.json()
          // Convert date strings back to Date objects
          const processedClient = {
            ...clientData,
            createdAt: new Date(clientData.createdAt),
            updatedAt: new Date(clientData.updatedAt),
            clientSince: clientData.clientSince ? new Date(clientData.clientSince) : null,
          }
          setClient(processedClient)
        } else if (response.status === 404) {
          setClient(null)
        } else {
          console.error('Failed to fetch client')
          setClient(null)
        }
      } catch (error) {
        console.error('Error loading client:', error)
        setClient(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadClient()
  }, [clientId])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-200 h-64 rounded-xl"></div>
              <div className="bg-gray-200 h-48 rounded-xl"></div>
            </div>
            <div className="space-y-6">
              <div className="bg-gray-200 h-32 rounded-xl"></div>
              <div className="bg-gray-200 h-48 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Client Not Found</h1>
        <p className="text-gray-600 mb-6">The client you're looking for doesn't exist.</p>
        <Link
          href="/admin/clients"
          className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Clients
        </Link>
      </div>
    )
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  const getTimeAsClient = () => {
    if (!client.clientSince) return 'Unknown'
    const now = new Date()
    const clientSince = new Date(client.clientSince)
    const diffTime = Math.abs(now.getTime() - clientSince.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 30) return `${diffDays} days`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`
    return `${Math.floor(diffDays / 365)} years`
  }

  const checkWebsiteStatus = async () => {
    if (!client?.website) return
    
    setIsCheckingStatus(true)
    try {
      const response = await fetch(`/api/clients/${client.id}/website-status`, {
        method: 'POST',
      })
      
      if (response.ok) {
        const statusData = await response.json()
        // Update the client state with new status
        setClient(prev => prev ? {
          ...prev,
          websiteStatus: statusData.status,
          lastChecked: new Date(statusData.lastChecked),
        } : null)
      } else {
        console.error('Failed to check website status')
      }
    } catch (error) {
      console.error('Error checking website status:', error)
    } finally {
      setIsCheckingStatus(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/clients"
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 font-heading">
            {client.name || 'Unknown Client'}
          </h1>
          <p className="text-gray-600">
            Client profile and business information
          </p>
        </div>
        <Link
          href={`/admin/clients/${client.id}/edit`}
          className="inline-flex items-center gap-2 bg-secondary-500 hover:bg-secondary-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Edit className="h-4 w-4" />
          Edit Client
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Overview */}
          <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-bold text-2xl">
                  {(client.name || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
              
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-2">{client.businessName || client.name || 'Unknown Client'}</h2>
                <p className="text-lg text-gray-700 mb-4">Client Profile</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900">{client.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-sm font-medium text-gray-900">{client.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="text-sm font-medium text-gray-900">{client.location || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Client Since</p>
                      <p className="text-sm font-medium text-gray-900">
                        {client.clientSince ? formatDate(client.clientSince) : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 font-heading flex items-center gap-2">
              <Building2 className="h-5 w-5 text-secondary-500" />
              Business Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Business Type</p>
                  <p className="text-sm font-medium text-gray-900">{client.businessType || 'Not specified'}</p>
                </div>
              </div>

              {(client.repRole?.startsWith('FB-') || client.repName?.startsWith('FB-')) && (
                <div className="flex items-center gap-3">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">FreshBooks ID</p>
                    <p className="text-sm font-medium text-gray-900">
                      {client.repRole?.startsWith('FB-') ? client.repRole.replace('FB-', '') : 
                       client.repName?.startsWith('FB-') ? client.repName.replace('FB-', '') : '-'}
                    </p>
                  </div>
                </div>
              )}

              {client.website && (
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Website</p>
                    <div className="flex items-center gap-2">
                      <a 
                        href={client.website.startsWith('http') ? client.website : `https://${client.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        {client.website}
                      </a>
                      {client.websiteStatus && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusDisplay(client.websiteStatus).bgColor} ${getStatusDisplay(client.websiteStatus).color}`}>
                          {getStatusDisplay(client.websiteStatus).icon} {getStatusDisplay(client.websiteStatus).text}
                        </span>
                      )}
                    </div>
                    {client.lastChecked && (
                      <p className="text-xs text-gray-400 mt-1">
                        Last checked: {formatDate(new Date(client.lastChecked))}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Representative Contact */}
          {((client.repName && !client.repName.startsWith('FB-')) || client.repEmail || client.repPhone) && (
            <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 font-heading flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-purple-500" />
                Representative Contact
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {client.repName && (
                  <div className="flex items-center gap-3">
                    <UserCheck className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Contact Name</p>
                      <p className="text-sm font-medium text-gray-900">{client.repName}</p>
                      {client.repRole && (
                        <p className="text-xs text-gray-500">{client.repRole}</p>
                      )}
                    </div>
                  </div>
                )}

                {client.repEmail && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Contact Email</p>
                      <a 
                        href={`mailto:${client.repEmail}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        {client.repEmail}
                      </a>
                    </div>
                  </div>
                )}

                {client.repPhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Contact Phone</p>
                      <a 
                        href={`tel:${client.repPhone}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        {client.repPhone}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Meeting Notes */}
          <NotesSection clientId={client.id} />

          {/* Financial Summary */}
          <FinancialSummary 
            clientId={client.id} 
            clientName={client.name || 'Unknown Client'} 
            businessName={client.businessName || undefined}
          />

          {/* Placeholder Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ads Performance Placeholder */}
            <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 font-heading flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Ads Performance
              </h3>
              <div className="text-center py-6">
                <TrendingUp className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-1">GoHighLevel Integration</p>
                <p className="text-xs text-gray-400">Coming in Phase 2</p>
              </div>
            </div>

            {/* Projects Placeholder */}
            <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 font-heading flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-500" />
                Projects
              </h3>
              <div className="text-center py-6">
                <FileText className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-1">Project Management</p>
                <p className="text-xs text-gray-400">Coming in Phase 2</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 font-heading">
              Quick Stats
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Time as Client</span>
                <span className="font-semibold text-gray-900">{getTimeAsClient()}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">FreshBooks ID</span>
                <span className="font-semibold text-gray-900">
                  {client.repRole?.startsWith('FB-') ? client.repRole.replace('FB-', '') : 
                   client.repName?.startsWith('FB-') ? client.repName.replace('FB-', '') : '-'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Account Status</span>
                <span className="font-semibold text-green-600">
                  {(client.repRole?.startsWith('FB-') || client.repName?.startsWith('FB-')) ? 'Synced' : 'Manual'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Password Changed</span>
                <span className={`font-semibold ${client.passwordChanged ? 'text-green-600' : 'text-orange-600'}`}>
                  {client.passwordChanged ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* Website Uptime */}
          <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 font-heading flex items-center gap-2">
              <Globe className="h-5 w-5 text-purple-500" />
              Website Monitoring
            </h3>
            
            {client.website ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusDisplay(client.websiteStatus).bgColor} ${getStatusDisplay(client.websiteStatus).color}`}>
                    {getStatusDisplay(client.websiteStatus).icon} {getStatusDisplay(client.websiteStatus).text}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Website</span>
                  <a 
                    href={client.website.startsWith('http') ? client.website : `https://${client.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 truncate max-w-32"
                    title={client.website}
                  >
                    {client.website}
                  </a>
                </div>
                
                {client.lastChecked && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Checked</span>
                    <span className="text-sm text-gray-900">
                      {formatDate(new Date(client.lastChecked))}
                    </span>
                  </div>
                )}
                
                {client.updownToken && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Monitoring</span>
                    <span className="text-sm text-green-600 font-medium">
                      Updown.io Active
                    </span>
                  </div>
                )}
                
                <button
                  onClick={checkWebsiteStatus}
                  disabled={isCheckingStatus}
                  className="w-full mt-4 px-3 py-2 text-sm bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isCheckingStatus ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Checking...
                    </>
                  ) : (
                    <>
                      <Activity className="h-4 w-4" />
                      Check Status Now
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="text-center py-6">
                <Globe className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-1">No Website Configured</p>
                <p className="text-xs text-gray-400">Add a website URL to enable monitoring</p>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 font-heading flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Recent Activity
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Client profile created</p>
                  <p className="text-xs text-gray-500">
                    {client.createdAt ? formatDate(client.createdAt) : 'Unknown date'}
                  </p>
                </div>
              </div>
              
              <div className="text-center py-4">
                <p className="text-xs text-gray-400">More activity tracking coming soon</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 font-heading">
              Quick Actions
            </h3>
            
            <div className="space-y-3">
              <Link
                href={`/admin/clients/${client.id}/edit`}
                className="w-full text-left p-3 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors block"
              >
                Edit Client Information
              </Link>
              <button className="w-full text-left p-3 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                Send Email
              </button>
              <button className="w-full text-left p-3 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                Create Invoice
              </button>
              <button className="w-full text-left p-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                Archive Client
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
