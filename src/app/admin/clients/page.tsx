'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Filter, MoreVertical, Globe, Phone, Mail, Calendar, User, Building2, RefreshCw, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ClientUser } from '@/types'

export default function ClientsPage() {
  const router = useRouter()
  const [clients, setClients] = useState<ClientUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'businessName' | 'clientSince'>('name')
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    // Load clients from API
    const loadClients = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/clients')
        if (response.ok) {
          const clientsData = await response.json()
          // Convert date strings back to Date objects
          const processedClients = clientsData.map((client: any) => ({
            ...client,
            createdAt: new Date(client.createdAt),
            updatedAt: new Date(client.updatedAt),
            clientSince: client.clientSince ? new Date(client.clientSince) : null,
            role: 'CLIENT' // Ensure role is set
          }))
          setClients(processedClients)
        } else {
          console.error('Failed to fetch clients')
          // Fall back to empty array
          setClients([])
        }
      } catch (error) {
        console.error('Error loading clients:', error)
        setClients([])
      } finally {
        setIsLoading(false)
      }
    }

    loadClients()
  }, [])

  const handleSyncFreshBooks = async () => {
    setIsSyncing(true)
    try {
      const response = await fetch('/api/freshbooks/sync-clients', {
        method: 'POST',
      })

      if (response.ok) {
        const result = await response.json()
        const details = `Sync completed!\nFreshBooks clients found: ${result.results.fbClientsFound || 0}\nDashboard clients found: ${result.results.dashboardClientsFound || 0}\nImported: ${result.results.imported}\nUpdated: ${result.results.updated}`
        alert(details)
        
        // Reload clients to show newly imported ones
        const clientsResponse = await fetch('/api/clients')
        if (clientsResponse.ok) {
          const clientsData = await clientsResponse.json()
          const processedClients = clientsData.map((client: any) => ({
            ...client,
            createdAt: new Date(client.createdAt),
            updatedAt: new Date(client.updatedAt),
            clientSince: client.clientSince ? new Date(client.clientSince) : null,
            role: 'CLIENT'
          }))
          setClients(processedClients)
        }
      } else {
        const error = await response.json()
        alert(`Sync failed: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error syncing FreshBooks clients:', error)
      alert('Failed to sync FreshBooks clients. Please try again.')
    } finally {
      setIsSyncing(false)
    }
  }

  const handleDeleteClient = async (clientId: string, clientName: string) => {
    if (!confirm(`Are you sure you want to delete ${clientName}? This action cannot be undone.`)) {
      return
    }

    setDeletingClientId(clientId)
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Remove the client from the local state
        setClients(clients.filter(client => client.id !== clientId))
      } else {
        const error = await response.json()
        alert(`Failed to delete client: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting client:', error)
      alert('Failed to delete client. Please try again.')
    } finally {
      setDeletingClientId(null)
    }
  }

  const filteredClients = clients.filter(client =>
    (client.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.location?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sortedClients = [...filteredClients].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return (a.name || '').localeCompare(b.name || '')
      case 'businessName':
        return (a.businessName || '').localeCompare(b.businessName || '')
      case 'clientSince':
        return new Date(b.clientSince || 0).getTime() - new Date(a.clientSince || 0).getTime()
      default:
        return 0
    }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-heading">
            Clients
          </h1>
          <p className="text-gray-600">
            Manage your client relationships and profiles
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSyncFreshBooks}
            disabled={isSyncing}
            className={`inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors text-sm ${
              isSyncing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync FreshBooks'}
          </button>
          <Link
            href="/admin/clients/new"
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Client
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="name">Sort by Name</option>
              <option value="businessName">Sort by Business</option>
              <option value="clientSince">Sort by Date Added</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clients List */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : sortedClients.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery ? 'Try adjusting your search terms' : 'Get started by adding your first client'}
            </p>
            <Link
              href="/admin/clients/new"
              className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Client
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sortedClients.map((client) => (
              <div key={client.id} className="relative">
                <div
                  className="block p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/admin/clients/${client.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-semibold text-lg">
                          {(client.name || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{client.name || 'Unknown'}</h3>
                        <p className="text-sm text-gray-600">{client.businessName}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span>{client.email}</span>
                          <span>{client.location}</span>
                          <span>{client.phone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 relative z-10">
                      <Link
                        href={`/admin/clients/${client.id}/edit`}
                        className="p-2 text-gray-400 hover:text-secondary-600 hover:bg-secondary-50 rounded-lg transition-colors"
                        title="Edit client"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        className={`p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ${
                          deletingClientId === client.id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        title="Delete client"
                        disabled={deletingClientId === client.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteClient(client.id, client.name || 'Unknown Client')
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      {!isLoading && sortedClients.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {sortedClients.length} of {clients.length} clients
            </span>
            <span>
              {searchQuery && `Filtered by "${searchQuery}"`}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
