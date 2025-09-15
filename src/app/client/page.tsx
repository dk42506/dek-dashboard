'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, MapPin, Phone, Mail, Calendar, FileText, TrendingUp, Globe, UserCheck, Activity } from 'lucide-react'
import { formatDate, formatPhoneNumber, calculateClientDuration } from '@/lib/utils'
import { getStatusDisplay } from '@/lib/website-monitor'

export default function ClientDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [clientData, setClientData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadClientData = async () => {
      if (!session?.user?.id) return
      
      setIsLoading(true)
      try {
        const response = await fetch(`/api/clients/${session.user.id}`)
        if (response.ok) {
          const data = await response.json()
          // Convert date strings back to Date objects
          const processedData = {
            ...data,
            createdAt: data.createdAt ? new Date(data.createdAt) : null,
            updatedAt: data.updatedAt ? new Date(data.updatedAt) : null,
            clientSince: data.clientSince ? new Date(data.clientSince) : null,
            lastChecked: data.lastChecked ? new Date(data.lastChecked) : null,
          }
          setClientData(processedData)
          
          // Check if user needs to change password (new users without passwordChanged flag)
          if (!data.passwordChanged) {
            router.push('/auth/change-password')
            return
          }
        } else {
          console.error('Failed to fetch client data')
        }
      } catch (error) {
        console.error('Error loading client data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      loadClientData()
    }
  }, [session, router])


  const placeholderSections = [
    {
      title: 'Billing & Invoices',
      description: 'View your invoices, payment history, and billing information',
      icon: FileText,
      comingSoon: true,
    },
    {
      title: 'Ads Performance',
      description: 'Track your advertising campaigns and performance metrics',
      icon: TrendingUp,
      comingSoon: true,
    },
    {
      title: 'Website Analytics',
      description: 'Monitor your website traffic and user engagement',
      icon: Globe,
      comingSoon: true,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold font-heading mb-2">
          Welcome, {session?.user?.name || 'Client'}!
        </h1>
        <p className="text-primary-100">
          Here's your business overview and account information.
        </p>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 font-heading">
          Business Profile
        </h2>
        
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-primary-500" />
                  <div>
                    <p className="text-sm text-gray-600">Business Name</p>
                    <p className="font-medium text-gray-900">
                      {clientData?.businessName || 'Not specified'}
                    </p>
                    {clientData?.businessType && (
                      <p className="text-xs text-gray-500">{clientData.businessType}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary-500" />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium text-gray-900">
                      {clientData?.location || 'Not specified'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary-500" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-gray-900">
                      {clientData?.phone ? formatPhoneNumber(clientData.phone) : 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary-500" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">
                      {clientData?.email}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary-500" />
                  <div>
                    <p className="text-sm text-gray-600">Client Since</p>
                    <p className="font-medium text-gray-900">
                      {clientData?.clientSince ? formatDate(clientData.clientSince) : 'Not specified'}
                    </p>
                    {clientData?.clientSince && (
                      <p className="text-xs text-gray-500">
                        {calculateClientDuration(clientData.clientSince)} with DEK Innovations
                      </p>
                    )}
                  </div>
                </div>

                {clientData?.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-primary-500" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Website</p>
                      <div className="flex items-center gap-2">
                        <a 
                          href={clientData.website.startsWith('http') ? clientData.website : `https://${clientData.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:text-blue-800"
                        >
                          {clientData.website}
                        </a>
                        {clientData.websiteStatus && (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusDisplay(clientData.websiteStatus).bgColor} ${getStatusDisplay(clientData.websiteStatus).color}`}>
                            {getStatusDisplay(clientData.websiteStatus).icon} {getStatusDisplay(clientData.websiteStatus).text}
                          </span>
                        )}
                      </div>
                      {clientData.lastChecked && (
                        <p className="text-xs text-gray-400 mt-1">
                          Last checked: {formatDate(clientData.lastChecked)}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Representative Contact Information */}
            {(clientData?.repName || clientData?.repEmail || clientData?.repPhone) && (
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-600 mb-4 flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Primary Contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {clientData.repName && (
                    <div className="flex items-center gap-3">
                      <UserCheck className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Contact Name</p>
                        <p className="font-medium text-gray-900">{clientData.repName}</p>
                        {clientData.repRole && (
                          <p className="text-xs text-gray-500">{clientData.repRole}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {clientData.repEmail && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Contact Email</p>
                        <a 
                          href={`mailto:${clientData.repEmail}`}
                          className="font-medium text-blue-600 hover:text-blue-800"
                        >
                          {clientData.repEmail}
                        </a>
                      </div>
                    </div>
                  )}

                  {clientData.repPhone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Contact Phone</p>
                        <a 
                          href={`tel:${clientData.repPhone}`}
                          className="font-medium text-blue-600 hover:text-blue-800"
                        >
                          {formatPhoneNumber(clientData.repPhone)}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {clientData?.notes && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Account Notes</h3>
            <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">
              {clientData.notes}
            </p>
          </div>
        )}
      </div>

      {/* Placeholder Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {placeholderSections.map((section) => (
          <div
            key={section.title}
            className="bg-white rounded-xl p-6 shadow-soft border border-gray-100 text-center"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <section.icon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 font-heading">
              {section.title}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {section.description}
            </p>
            {section.comingSoon && (
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                Coming Soon
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 font-heading">
          Need Help?
        </h3>
        <div className="bg-primary-50 rounded-lg p-4">
          <p className="text-gray-700 mb-2">
            Have questions about your account or services? Our team is here to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="mailto:admin@dekinnovations.com"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              <Mail className="h-4 w-4" />
              admin@dekinnovations.com
            </a>
            <span className="text-gray-400 hidden sm:inline">•</span>
            <span className="text-gray-600">
              Business Hours: Mon - Fri, 9AM - 6PM EST
            </span>
          </div>
        </div>
      </div>

    </div>
  )
}
