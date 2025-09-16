'use client'

import { useSession } from 'next-auth/react'
import { useState, useRef, useEffect } from 'react'
import { Bell, Search, User, X, CheckCircle, AlertCircle, Info, UserPlus, Globe } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export function AdminHeader() {
  const { data: session } = useSession()
  const router = useRouter()
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  // Load notifications when dropdown is opened
  useEffect(() => {
    if (showNotifications && notifications.length === 0) {
      loadNotifications()
    }
  }, [showNotifications])

  const loadNotifications = async () => {
    setIsLoadingNotifications(true)
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      } else {
        console.error('Failed to fetch notifications')
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setIsLoadingNotifications(false)
    }
  }

  // Mock search results
  const searchResults = [
    { id: 1, type: 'client', name: 'John Smith', business: "John's Auto Shop", email: 'john@johnsautoshop.com' },
    { id: 2, type: 'client', name: 'Sarah Johnson', business: "Sarah's Bakery", email: 'sarah@sarahsbakery.com' },
    { id: 3, type: 'client', name: 'Mike Wilson', business: 'Wilson Plumbing Services', email: 'mike@wilsonplumbing.com' }
  ].filter(item => 
    searchQuery && (
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.business.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900 font-heading">
              Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden md:block relative" ref={searchRef}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setShowSearchResults(e.target.value.length > 0)
                  }}
                  onFocus={() => setShowSearchResults(searchQuery.length > 0)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                  <div className="p-2">
                    <div className="text-xs text-gray-500 px-2 py-1 font-medium">Search Results</div>
                    {searchResults.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => {
                          router.push(`/admin/clients/${result.id}`)
                          setSearchQuery('')
                          setShowSearchResults(false)
                        }}
                        className="w-full text-left p-2 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 font-semibold text-sm">
                              {result.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{result.name}</p>
                            <p className="text-xs text-gray-500 truncate">{result.business}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {showSearchResults && searchQuery && searchResults.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-4 text-center text-sm text-gray-500">
                    No clients found for "{searchQuery}"
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-400 hover:text-gray-600 relative"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div data-notification-dropdown className="absolute top-full right-0 mt-1 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-600 bg-white dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    {unreadCount > 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{unreadCount} unread</p>
                    )}
                  </div>

                  <div className="max-h-64 overflow-y-auto bg-white dark:bg-gray-800">
                    {isLoadingNotifications ? (
                      <div className="p-4 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 mb-1">No notifications</p>
                        <p className="text-xs text-gray-400">You're all caught up!</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-50 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                            !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {notification.type === 'new_client' ? (
                              <UserPlus className="h-4 w-4 text-green-500" />
                            ) : notification.type === 'website_down' ? (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            ) : notification.type === 'website_up' ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Info className="h-4 w-4 text-blue-500" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                  {notification.title}
                                </p>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                {new Date(notification.createdAt).toLocaleDateString()} at {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-3 border-t border-gray-100 dark:border-gray-600 bg-white dark:bg-gray-800">
                    <button className="w-full text-center text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">
                  {session?.user?.name || 'DEK Admin'}
                </p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                <span className="text-sm font-semibold text-white">
                  {session?.user?.name ? getInitials(session.user.name) : 'DA'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
