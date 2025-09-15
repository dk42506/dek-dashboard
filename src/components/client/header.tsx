'use client'

import { useSession, signOut } from 'next-auth/react'
import { LogOut, User } from 'lucide-react'
import { getInitials } from '@/lib/utils'

export function ClientHeader() {
  const { data: session } = useSession()

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' })
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <span className="text-lg font-bold text-white font-heading">DEK</span>
              </div>
              <div>
                <span className="font-heading font-semibold text-gray-900 block">DEK Innovations</span>
                <span className="text-xs text-gray-500">Client Portal</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* User menu */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">
                  {session?.user?.name || 'Client User'}
                </p>
                <p className="text-xs text-gray-500">Client</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                <span className="text-sm font-semibold text-white">
                  {session?.user?.name ? getInitials(session.user.name) : 'C'}
                </span>
              </div>
            </div>

            {/* Sign out button */}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
