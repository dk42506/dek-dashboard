interface FreshBooksClient {
  id: number
  organization: string
  first_name: string
  last_name: string
  email: string
  company_name: string
  business_phone: string
  mobile_phone: string
  fax: string
  website: string
  currency_code: string
  language: string
  accounting_systemid: string
  created_at: string
  updated_at: string
  home_phone: string
  company_industry: string
  company_size: string
  note: string
  vat_name: string
  vat_number: string
  allow_late_fees: boolean
  allow_late_notifications: boolean
  preferred_language: string
  signup_date: string
  last_activity: string
  level: number
  userid: number
  username: string
  fname: string
  lname: string
  vis_state: number
}

interface FreshBooksInvoice {
  id: number
  accountid: string
  invoice_number: string
  clientid: number
  create_date: string
  amount: {
    amount: string
    code: string
  }
  status: number
  parent: number
  description: string
  po_number: string
  template: string
  terms: string
  notes: string
  address: string
  return_uri: string
  updated: string
  currency_code: string
  language: string
  accounting_systemid: string
  invoice_profile: {
    profileid: number
    entity_type: string
    entity_id: number
    outstanding_balance: {
      amount: string
      code: string
    }
    next_payment_date: string
    preferred_payment_method: string
  }
  payment_status: string
  last_order_status: string
  dispute_status: string
  deposit_status: string
  auto_bill: boolean
  v3_status: string
  date_paid: string
  payment_details: string
  presentation: {
    theme_primary_color: string
    theme_background_color: string
    theme_font_name: string
    theme_layout: string
    image_logo_src: string
  }
  v3_status_name: string
  allowed_gatewayids: number[]
  outstanding: {
    amount: string
    code: string
  }
  paid: {
    amount: string
    code: string
  }
  due_offset_days: number
  clientid_name: string
  estimateid: number
  basecampid: number
  sentid: number
  status_name: string
  current_organization: string
  invoice_date: string
  due_date: string
  payment_date: string
  generation_date: string
  discount_total: {
    amount: string
    code: string
  }
  created_at: string
  updated_at: string
  lines: any[]
}

interface FreshBooksExpense {
  id: number
  staff_id: number
  category_id: number
  project_id: number
  client_id: number
  amount: {
    amount: string
    code: string
  }
  vendor: string
  date: string
  notes: string
  markup_percent: string
  status: number
  tax_percent: string
  updated_at: string
  created_at: string
  background_job_id: number
  accounting_systemid: string
  categoryid: number
  clientid: number
  projectid: number
  staffid: number
  invoiceid: number
  vis_state: number
  taxName1: string
  taxAmount1: {
    amount: string
    code: string
  }
  taxName2: string
  taxAmount2: {
    amount: string
    code: string
  }
  compounded_tax: boolean
  has_receipt: boolean
  receipt: string
  expense_profile: {
    profileid: number
    entity_type: string
    entity_id: number
  }
}

export class FreshBooksService {
  private clientId: string
  private clientSecret: string
  private redirectUri: string
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private baseUrl = 'https://api.freshbooks.com'

  constructor() {
    this.clientId = process.env.FRESHBOOKS_CLIENT_ID || ''
    this.clientSecret = process.env.FRESHBOOKS_CLIENT_SECRET || ''
    this.redirectUri = process.env.FRESHBOOKS_REDIRECT_URI || 'https://dashboard.dekinnovations.com/api/freshbooks/callback'
    
    if (!this.clientId || !this.clientSecret) {
      console.warn('FreshBooks API credentials not fully configured')
    }
  }

  // Check if service is properly configured
  isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret && this.redirectUri)
  }

  // Generate OAuth authorization URL
  getAuthorizationUrl(): string {
    if (!this.isConfigured()) {
      throw new Error('FreshBooks API not configured')
    }

    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      scope: 'user:profile:read user:clients:read user:invoices:read user:expenses:read'
    })

    return `https://my.freshbooks.com/service/auth/oauth/authorize?${params.toString()}`
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(code: string): Promise<{ access_token: string; refresh_token: string } | null> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code,
          redirect_uri: this.redirectUri
        })
      })

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      this.accessToken = data.access_token
      this.refreshToken = data.refresh_token

      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token
      }
    } catch (error) {
      console.error('Error exchanging code for token:', error)
      return null
    }
  }

  // Refresh access token
  async refreshAccessToken(refreshToken: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          grant_type: 'refresh_token',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: refreshToken
        })
      })

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      this.accessToken = data.access_token
      
      return data.access_token
    } catch (error) {
      console.error('Error refreshing access token:', error)
      return null
    }
  }

  // Set access token for API calls
  setAccessToken(token: string): void {
    this.accessToken = token
  }

  // Make authenticated API request
  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!this.accessToken) {
      throw new Error('No access token available')
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    })

    if (!response.ok) {
      throw new Error(`FreshBooks API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Get user profile
  async getUserProfile(): Promise<any> {
    try {
      return await this.makeRequest('/auth/api/v1/users/me')
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }

  // Get clients
  async getClients(accountId: string): Promise<FreshBooksClient[]> {
    try {
      const response = await this.makeRequest(`/accounting/account/${accountId}/users/clients`)
      return response.response?.result?.clients || []
    } catch (error) {
      console.error('Error fetching clients:', error)
      return []
    }
  }

  // Get invoices
  async getInvoices(accountId: string, page = 1, perPage = 15): Promise<{ invoices: FreshBooksInvoice[]; total: number }> {
    try {
      const response = await this.makeRequest(`/accounting/account/${accountId}/invoices/invoices?page=${page}&per_page=${perPage}`)
      return {
        invoices: response.response?.result?.invoices || [],
        total: response.response?.result?.total || 0
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
      return { invoices: [], total: 0 }
    }
  }

  // Get expenses
  async getExpenses(accountId: string, page = 1, perPage = 15): Promise<{ expenses: FreshBooksExpense[]; total: number }> {
    try {
      const response = await this.makeRequest(`/accounting/account/${accountId}/expenses/expenses?page=${page}&per_page=${perPage}`)
      return {
        expenses: response.response?.result?.expenses || [],
        total: response.response?.result?.total || 0
      }
    } catch (error) {
      console.error('Error fetching expenses:', error)
      return { expenses: [], total: 0 }
    }
  }

  // Get financial summary
  async getFinancialSummary(accountId: string): Promise<{
    totalRevenue: number
    totalExpenses: number
    netIncome: number
    outstandingInvoices: number
    paidInvoices: number
    currency: string
  }> {
    try {
      const [invoicesData, expensesData] = await Promise.all([
        this.getInvoices(accountId, 1, 100),
        this.getExpenses(accountId, 1, 100)
      ])

      const invoices = invoicesData.invoices
      const expenses = expensesData.expenses

      // Calculate totals - check both status formats and include Auto-Paid
      const paidStatuses = ['paid', 'auto-paid', 'autopaid']
      const totalRevenue = invoices
        .filter(invoice => {
          const v3Status = invoice.v3_status?.toLowerCase()
          const numericStatus = invoice.status === 4 // Traditional paid status
          const isPaid = paidStatuses.includes(v3Status) || numericStatus
          return isPaid
        })
        .reduce((sum, invoice) => sum + parseFloat(invoice.amount.amount), 0)

      const totalExpenses = expenses
        .reduce((sum, expense) => sum + parseFloat(expense.amount.amount), 0)

      const outstandingInvoices = invoices
        .filter(invoice => {
          const outstandingAmount = parseFloat(invoice.outstanding?.amount || '0')
          return outstandingAmount > 0
        })
        .reduce((sum, invoice) => sum + parseFloat(invoice.outstanding?.amount || '0'), 0)

      const paidInvoices = invoices
        .filter(invoice => {
          const v3Status = invoice.v3_status?.toLowerCase()
          const numericStatus = invoice.status === 4
          const isPaid = paidStatuses.includes(v3Status) || numericStatus
          return isPaid
        })
        .length

      const currency = invoices.length > 0 ? invoices[0].currency_code : 'USD'

      return {
        totalRevenue,
        totalExpenses,
        netIncome: totalRevenue - totalExpenses,
        outstandingInvoices,
        paidInvoices,
        currency
      }
    } catch (error) {
      console.error('Error calculating financial summary:', error)
      return {
        totalRevenue: 0,
        totalExpenses: 0,
        netIncome: 0,
        outstandingInvoices: 0,
        paidInvoices: 0,
        currency: 'USD'
      }
    }
  }

  // Create a new client
  async createClient(accountId: string, clientData: {
    first_name: string
    last_name: string
    email: string
    company_name?: string
    business_phone?: string
    website?: string
  }): Promise<FreshBooksClient | null> {
    try {
      const response = await this.makeRequest(`/accounting/account/${accountId}/users/clients`, {
        method: 'POST',
        body: JSON.stringify({
          client: clientData
        })
      })

      return response.response?.result?.client || null
    } catch (error) {
      console.error('Error creating client:', error)
      return null
    }
  }

  // Update a client
  async updateClient(accountId: string, clientId: number, clientData: Partial<FreshBooksClient>): Promise<FreshBooksClient | null> {
    try {
      const response = await this.makeRequest(`/accounting/account/${accountId}/users/clients/${clientId}`, {
        method: 'PUT',
        body: JSON.stringify({
          client: clientData
        })
      })

      return response.response?.result?.client || null
    } catch (error) {
      console.error('Error updating client:', error)
      return null
    }
  }
}

// Export a singleton instance
export const freshbooks = new FreshBooksService()
