'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Save, Building2, UserCheck, Globe, MapPin, Phone, Mail } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ClientUser } from '@/types'

interface EditFormData {
  name: string
  email: string
  businessName: string
  businessType: string
  website: string
  location: string
  phone: string
  repName: string
  repRole: string
  repEmail: string
  repPhone: string
}

export default function EditClientPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.id as string
  
  const [client, setClient] = useState<ClientUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<EditFormData>({
    name: '',
    email: '',
    businessName: '',
    businessType: '',
    website: '',
    location: '',
    phone: '',
    repName: '',
    repRole: '',
    repEmail: '',
    repPhone: '',
  })

  useEffect(() => {
    const loadClient = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/clients/${clientId}`)
        if (response.ok) {
          const clientData = await response.json()
          setClient(clientData)
          
          // Populate form with existing data
          setFormData({
            name: clientData.name || '',
            email: clientData.email || '',
            businessName: clientData.businessName || '',
            businessType: clientData.businessType || '',
            website: clientData.website || '',
            location: clientData.location || '',
            phone: clientData.phone || '',
            repName: clientData.repName || '',
            repRole: clientData.repRole || '',
            repEmail: clientData.repEmail || '',
            repPhone: clientData.repPhone || '',
          })
        } else {
          console.error('Failed to fetch client')
        }
      } catch (error) {
        console.error('Error loading client:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadClient()
  }, [clientId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update client')
      }

      // Redirect back to client profile
      router.push(`/admin/clients/${clientId}`)
    } catch (error) {
      console.error('Error updating client:', error)
      alert(error instanceof Error ? error.message : 'Failed to update client')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="bg-gray-200 h-96 rounded-xl"></div>
        </div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Client Not Found</h1>
        <p className="text-gray-600 mb-6">The client you're trying to edit doesn't exist.</p>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/admin/clients/${clientId}`}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-heading">
            Edit Client: {client.name || client.businessName}
          </h1>
          <p className="text-gray-600">
            Update client information and business details
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Information */}
        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 font-heading flex items-center gap-2">
            <Building2 className="h-5 w-5 text-secondary-500" />
            Business Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter contact name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="client@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                Business Name
              </label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter business name"
              />
            </div>

            <div>
              <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-2">
                Business Type/Industry
              </label>
              <input
                type="text"
                id="businessType"
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Restaurant, Law Firm, E-commerce"
              />
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                Website URL
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Website monitoring will be updated automatically
              </p>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="City, State"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Representative Contact */}
        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 font-heading flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-purple-500" />
            Representative Contact
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="repName" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Name
              </label>
              <input
                type="text"
                id="repName"
                name="repName"
                value={formData.repName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Primary contact person"
              />
            </div>

            <div>
              <label htmlFor="repRole" className="block text-sm font-medium text-gray-700 mb-2">
                Role/Title
              </label>
              <input
                type="text"
                id="repRole"
                name="repRole"
                value={formData.repRole}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Owner, Manager, Marketing Director"
              />
            </div>

            <div>
              <label htmlFor="repEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  id="repEmail"
                  name="repEmail"
                  value={formData.repEmail}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="contact@business.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="repPhone" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="tel"
                  id="repPhone"
                  name="repPhone"
                  value={formData.repPhone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Link
            href={`/admin/clients/${clientId}`}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </Link>
          
          <button
            type="submit"
            disabled={isSaving || !formData.name || !formData.email}
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
