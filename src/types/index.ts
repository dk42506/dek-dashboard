// Using our own User interface instead of Prisma's to avoid import issues

export type Role = 'ADMIN' | 'CLIENT'

export interface ClientUser {
  id: string
  name: string | null
  email: string
  emailVerified: Date | null
  image: string | null
  password: string | null
  role: string
  createdAt: Date
  updatedAt: Date
  businessName: string | null
  location: string | null
  phone: string | null
  notes: string | null
  clientSince: Date | null
}

export interface DashboardStats {
  totalClients: number
  activeClients: number
  newThisMonth: number
  totalRevenue: number
}

export interface SearchFilters {
  query: string
  sortBy: 'name' | 'businessName' | 'clientSince' | 'location'
  sortOrder: 'asc' | 'desc'
}

export interface ClientFormData {
  name: string
  email: string
  businessName?: string
  location?: string
  phone?: string
  notes?: string
  password?: string
}

export interface Note {
  id: string
  content: string
  createdAt: Date
  updatedAt: Date
  userId: string
}

export interface PlaceholderSection {
  title: string
  description: string
  icon: string
  comingSoon?: boolean
}
