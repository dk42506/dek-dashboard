import axios from 'axios'
import { prisma } from './prisma'

export interface FreshBooksClient {
  id: number
  organization: string
  fname: string
  lname: string
  email: string
  company: string
  business_phone: string
  mobile_phone: string
  fax: string
  language: string
  accounting_systemid: string
  currency_code: string
  created_at: string
  updated_at: string
  vis_state: number
}

export interface FreshBooksInvoice {
  id: number
  accountid: string
  invoiceid: string
  amount: {
    amount: string
    code: string
  }
  code: string
  create_date: string
  currency_code: string
  current_organization: string
  customerid: number
  date_paid: string | null
  deposit_amount: {
    amount: string
    code: string
  }
  deposit_percentage: string | null
  deposit_status: string
  description: string
  discount_description: string | null
  discount_total: {
    amount: string
    code: string
  }
  dispute_status: string | null
  due_date: string
  due_offset_days: number
  estimateid: number
  ext_archive: number
  fname: string
  fulfillment_date: string | null
  generation_date: string | null
  gmail: boolean
  invoice_number: string
  language: string
  last_order_status: string | null
  lname: string
  notes: string
  organization: string
  outstanding: {
    amount: string
    code: string
  }
  ownerid: number
  paid: {
    amount: string
    code: string
  }
  parent: number
  payment_details: string
  payment_status: string
  po_number: string | null
  sentid: number
  show_attachments: boolean
  status: number
  street: string
  street2: string
  template: string
  terms: string
  updated: string
  v3_status: string
  vat_name: string | null
  vat_number: string
  vis_state: number
}

export interface FreshBooksExpense {
  id: number
  amount: {
    amount: string
    code: string
  }
  categoryid: number
  clientid: number
  date: string
  expense_id: number
  has_receipt: boolean
  is_cogs: boolean
  isduplicate: boolean
  markup_percent: string
  notes: string
  profileid: number | null
  projectid: number
  staffid: number
  status: number
  taxAmount1: {
    amount: string
    code: string
  }
  taxAmount2: {
    amount: string
    code: string
  }
  taxName1: string | null
  taxName2: string | null
  taxPercent1: string | null
  taxPercent2: string | null
  transactionid: number | null
  updated: string
  vendor: string
  vis_state: number
}

class FreshBooksService {
  private baseURL = 'https://api.freshbooks.com'
  private accessToken: string | null = null
  private accountId: string | null = null

  async initialize(userId: string) {
    const settings = await prisma.adminSettings.findUnique({
      where: { userId }
    })

    if (!settings?.freshbooksAccessToken || !settings?.freshbooksAccountId) {
      throw new Error('FreshBooks credentials not configured')
    }

    this.accessToken = settings.freshbooksAccessToken
    this.accountId = settings.freshbooksAccountId
  }

  private async makeRequest(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', data?: any) {
    if (!this.accessToken || !this.accountId) {
      throw new Error('FreshBooks service not initialized')
    }

    try {
      const response = await axios({
        method,
        url: `${this.baseURL}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        data,
      })

      return response.data
    } catch (error) {
      console.error('FreshBooks API Error:', error)
      throw error
    }
  }

  async getClients(): Promise<FreshBooksClient[]> {
    const response = await this.makeRequest(`/accounting/account/${this.accountId}/users/clients`)
    return response.response.result.clients || []
  }

  async getInvoices(): Promise<FreshBooksInvoice[]> {
    const response = await this.makeRequest(`/accounting/account/${this.accountId}/invoices/invoices`)
    return response.response.result.invoices || []
  }

  async getInvoicesByClient(clientId: number): Promise<FreshBooksInvoice[]> {
    const response = await this.makeRequest(`/accounting/account/${this.accountId}/invoices/invoices?search[customerid]=${clientId}`)
    return response.response.result.invoices || []
  }

  async getExpenses(): Promise<FreshBooksExpense[]> {
    const response = await this.makeRequest(`/accounting/account/${this.accountId}/expenses/expenses`)
    return response.response.result.expenses || []
  }

  async getExpensesByClient(clientId: number): Promise<FreshBooksExpense[]> {
    const response = await this.makeRequest(`/accounting/account/${this.accountId}/expenses/expenses?search[clientid]=${clientId}`)
    return response.response.result.expenses || []
  }

  async refreshAccessToken(userId: string, refreshToken: string): Promise<string> {
    try {
      const settings = await prisma.adminSettings.findUnique({
        where: { userId }
      })

      if (!settings?.freshbooksClientId || !settings?.freshbooksClientSecret) {
        throw new Error('FreshBooks client credentials not configured')
      }

      const response = await axios.post('https://api.freshbooks.com/auth/oauth/token', {
        grant_type: 'refresh_token',
        client_id: settings.freshbooksClientId,
        client_secret: settings.freshbooksClientSecret,
        refresh_token: refreshToken,
      })

      const { access_token, refresh_token } = response.data

      // Update stored tokens
      await prisma.adminSettings.update({
        where: { userId },
        data: {
          freshbooksAccessToken: access_token,
          freshbooksRefreshToken: refresh_token,
        }
      })

      this.accessToken = access_token
      return access_token
    } catch (error) {
      console.error('Error refreshing FreshBooks token:', error)
      throw error
    }
  }

  // Helper method to match clients by business name
  async findClientByBusinessName(businessName: string): Promise<FreshBooksClient | null> {
    const clients = await this.getClients()
    return clients.find(client => 
      client.organization.toLowerCase().includes(businessName.toLowerCase()) ||
      client.company.toLowerCase().includes(businessName.toLowerCase())
    ) || null
  }

  // Get financial summary for a client
  async getClientFinancialSummary(clientId: number) {
    const [invoices, expenses] = await Promise.all([
      this.getInvoicesByClient(clientId),
      this.getExpensesByClient(clientId)
    ])

    const totalInvoiced = invoices.reduce((sum, invoice) => 
      sum + parseFloat(invoice.amount.amount), 0
    )

    const totalPaid = invoices.reduce((sum, invoice) => 
      sum + parseFloat(invoice.paid.amount), 0
    )

    const totalOutstanding = invoices.reduce((sum, invoice) => 
      sum + parseFloat(invoice.outstanding.amount), 0
    )

    const totalExpenses = expenses.reduce((sum, expense) => 
      sum + parseFloat(expense.amount.amount), 0
    )

    return {
      totalInvoiced,
      totalPaid,
      totalOutstanding,
      totalExpenses,
      invoiceCount: invoices.length,
      expenseCount: expenses.length,
      invoices: invoices.slice(0, 10), // Recent 10 invoices
      expenses: expenses.slice(0, 10), // Recent 10 expenses
    }
  }
}

export const freshBooksService = new FreshBooksService()
