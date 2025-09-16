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
  businessType: string | null
  website: string | null
  location: string | null
  phone: string | null
  clientSince: Date | null
  
  // Representative contact information
  repName: string | null
  repRole: string | null
  repEmail: string | null
  repPhone: string | null
  
  // Website monitoring
  websiteStatus: string | null
  lastChecked: Date | null
  updownToken: string | null
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
  businessType?: string
  website?: string
  location?: string
  phone?: string
  password?: string
  
  // Representative contact information
  repName?: string
  repRole?: string
  repEmail?: string
  repPhone?: string
}

export interface Note {
  id: string
  content: string
  createdAt: Date
  updatedAt: Date
  userId: string
}

export interface AdminSettings {
  id: string
  userId: string
  displayName: string | null
  businessName: string | null
  businessEmail: string | null
  businessPhone: string | null
  businessAddress: string | null
  businessWebsite: string | null
  defaultClientType: string | null
  emailNotifications: boolean
  clientUpdateNotifications: boolean
  systemAlerts: boolean
  websiteMonitoringAlerts: boolean
  monthlyReportEmails: boolean
  autoBackup: boolean
  backupFrequency: string
  sessionTimeout: number
  compactMode: boolean
  theme: string
  timezone: string
  dateFormat: string
  currency: string
  freshbooksClientId: string | null
  freshbooksClientSecret: string | null
  freshbooksAccessToken: string | null
  freshbooksRefreshToken: string | null
  freshbooksAccountId: string | null
  freshbooksAutoSync: boolean
  freshbooksSyncFrequency: string
  updownApiKey: string | null
  updownAutoSync: boolean
  updownSyncFrequency: string
  createdAt: Date
  updatedAt: Date
}

export interface AdminSettingsFormData {
  displayName?: string
  businessName?: string
  businessEmail?: string
  businessPhone?: string
  businessAddress?: string
  businessWebsite?: string
  defaultClientType?: string
  emailNotifications: boolean
  clientUpdateNotifications: boolean
  systemAlerts: boolean
  websiteMonitoringAlerts: boolean
  monthlyReportEmails: boolean
  autoBackup: boolean
  backupFrequency: string
  sessionTimeout: number
  compactMode: boolean
  theme: string
  timezone: string
  dateFormat: string
  currency: string
  freshbooksClientId?: string
  freshbooksClientSecret?: string
  freshbooksAccessToken?: string
  freshbooksRefreshToken?: string
  freshbooksAccountId?: string
  freshbooksAutoSync: boolean
  freshbooksSyncFrequency: string
  updownApiKey?: string
  updownAutoSync: boolean
  updownSyncFrequency: string
}

export interface PlaceholderSection {
  title: string
  description: string
  icon: string
  comingSoon?: boolean
}
