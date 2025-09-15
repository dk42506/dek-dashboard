'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Edit, Mail, Phone, MapPin, Calendar, FileText, DollarSign, TrendingUp, Globe, Clock } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ClientUser } from '@/types'

export default function ClientProfilePage() {
  const params = useParams()
  const clientId = params.id as string
  const [client, setClient] = useState<ClientUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading client data - in real app, this would be an API call
    const loadClient = async () => {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Mock client data based on ID
      const mockClients: Record<string, ClientUser> = {
        '1': {
          id: '1',
          name: 'John Smith',
          email: 'john@johnsautoshop.com',
          emailVerified: null,
          image: null,
          password: null,
          role: 'CLIENT',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
          businessName: "John's Auto Shop",
          location: 'Baltimore, MD',
          phone: '(410) 555-0123',
          notes: 'Automotive repair shop, 15+ years in business. Specializes in European cars. Very reliable client, always pays on time.',
          clientSince: new Date('2024-01-15'),
        },
        '2': {
          id: '2',
          name: 'Sarah Johnson',
          email: 'sarah@sarahsbakery.com',
          emailVerified: null,
          image: null,
          password: null,
          role: 'CLIENT',
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date('2024-02-01'),
          businessName: "Sarah's Bakery",
          location: 'Annapolis, MD',
          phone: '(410) 555-0456',
          notes: 'Local bakery specializing in custom cakes and wedding desserts. Growing business with strong social media presence.',
          clientSince: new Date('2024-02-01'),
        },
        '3': {
          id: '3',
          name: 'Mike Wilson',
          email: 'mike@wilsonplumbing.com',
          emailVerified: null,
          image: null,
          password: null,
          role: 'CLIENT',
          createdAt: new Date('2024-03-10'),
          updatedAt: new Date('2024-03-10'),
          businessName: 'Wilson Plumbing Services',
          location: 'Columbia, MD',
          phone: '(410) 555-0789',
          notes: 'Residential and commercial plumbing services. Family-owned business, second generation. Excellent reputation in the community.',
          clientSince: new Date('2024-03-10'),
        },
      }
      
      setClient(mockClients[clientId] || null)
      setIsLoading(false)
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
                <h2 className="text-xl font-bold text-gray-900 mb-2">{client.name}</h2>
                <p className="text-lg text-gray-700 mb-4">{client.businessName}</p>
                
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

          {/* Notes */}
          <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 font-heading flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary-500" />
              Notes
            </h3>
            
            {client.notes ? (
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed">{client.notes}</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No notes added yet</p>
                <Link
                  href={`/admin/clients/${client.id}/edit`}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Add notes
                </Link>
              </div>
            )}
          </div>

          {/* Placeholder Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Invoices Placeholder */}
            <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 font-heading flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                Invoices
              </h3>
              <div className="text-center py-6">
                <DollarSign className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-1">FreshBooks Integration</p>
                <p className="text-xs text-gray-400">Coming in Phase 2</p>
              </div>
            </div>

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
                <span className="text-sm text-gray-600">Total Projects</span>
                <span className="font-semibold text-gray-900">-</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Revenue</span>
                <span className="font-semibold text-green-600">-</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Contact</span>
                <span className="font-semibold text-gray-900">-</span>
              </div>
            </div>
          </div>

          {/* Website Uptime Placeholder */}
          <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 font-heading flex items-center gap-2">
              <Globe className="h-5 w-5 text-purple-500" />
              Website Uptime
            </h3>
            
            <div className="text-center py-6">
              <Globe className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-1">Uptime Monitoring</p>
              <p className="text-xs text-gray-400">Coming in Phase 2</p>
            </div>
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
