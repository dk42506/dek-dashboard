interface UpdownCheck {
  token: string
  url: string
  alias: string
  last_status: number
  uptime: number
  down: boolean
  down_since: string | null
  up_since: string | null
  error: string | null
  period: number
  apdex_t: number
  string_match: string | null
  enabled: boolean
  published: boolean
  disabled_locations: string[]
  recipients: string[]
  last_check_at: string
  next_check_at: string
  created_at: string
  mute_until: string | null
  favicon_url: string
  custom_headers: Record<string, string>
  http_verb: string
  http_body: string
  ssl: {
    tested_at: string
    expires_at: string
    valid: boolean
    error: string | null
  }
}

interface UpdownMetrics {
  requests: number
  samples: number
  apdex: number
  timings: {
    redirect: number
    namelookup: number
    connect: number
    pretransfer: number
    starttransfer: number
    total: number
  }
}

export class UpdownStatsService {
  private apiKey: string
  private baseUrl = 'https://updown.io/api'

  constructor() {
    this.apiKey = process.env.UPDOWN_API_KEY || ''
    if (!this.apiKey) {
      console.warn('UPDOWN_API_KEY environment variable not set')
    }
  }

  private async makeRequest(endpoint: string): Promise<any> {
    if (!this.apiKey) {
      throw new Error('Updown.io API key not configured')
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'X-API-KEY': this.apiKey,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Updown.io API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getAllChecks(): Promise<UpdownCheck[]> {
    try {
      return await this.makeRequest('/checks')
    } catch (error) {
      console.error('Error fetching Updown.io checks:', error)
      return []
    }
  }

  async getCheck(token: string): Promise<UpdownCheck | null> {
    try {
      return await this.makeRequest(`/checks/${token}`)
    } catch (error) {
      console.error(`Error fetching Updown.io check ${token}:`, error)
      return null
    }
  }

  async getCheckMetrics(token: string, from?: string, to?: string): Promise<UpdownMetrics | null> {
    try {
      let endpoint = `/checks/${token}/metrics`
      const params = new URLSearchParams()
      
      if (from) params.append('from', from)
      if (to) params.append('to', to)
      
      if (params.toString()) {
        endpoint += `?${params.toString()}`
      }

      return await this.makeRequest(endpoint)
    } catch (error) {
      console.error(`Error fetching metrics for check ${token}:`, error)
      return null
    }
  }

  async getDowntime(token: string, page = 1): Promise<any[]> {
    try {
      return await this.makeRequest(`/checks/${token}/downtimes?page=${page}`)
    } catch (error) {
      console.error(`Error fetching downtime for check ${token}:`, error)
      return []
    }
  }

  async createCheck(url: string, options: {
    alias?: string
    period?: number
    apdex_t?: number
    enabled?: boolean
    published?: boolean
    recipients?: string[]
    string_match?: string
    custom_headers?: Record<string, string>
    http_verb?: string
    http_body?: string
  } = {}): Promise<UpdownCheck | null> {
    try {
      const response = await fetch(`${this.baseUrl}/checks`, {
        method: 'POST',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url,
          ...options
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to create check: ${response.status} ${response.statusText}`)
      }

      return response.json()
    } catch (error) {
      console.error('Error creating Updown.io check:', error)
      return null
    }
  }

  async updateCheck(token: string, options: {
    url?: string
    alias?: string
    period?: number
    apdex_t?: number
    enabled?: boolean
    published?: boolean
    recipients?: string[]
    string_match?: string
    custom_headers?: Record<string, string>
    http_verb?: string
    http_body?: string
  }): Promise<UpdownCheck | null> {
    try {
      const response = await fetch(`${this.baseUrl}/checks/${token}`, {
        method: 'PUT',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(options)
      })

      if (!response.ok) {
        throw new Error(`Failed to update check: ${response.status} ${response.statusText}`)
      }

      return response.json()
    } catch (error) {
      console.error(`Error updating Updown.io check ${token}:`, error)
      return null
    }
  }

  async deleteCheck(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/checks/${token}`, {
        method: 'DELETE',
        headers: {
          'X-API-KEY': this.apiKey
        }
      })

      return response.ok
    } catch (error) {
      console.error(`Error deleting Updown.io check ${token}:`, error)
      return false
    }
  }

  // Helper method to get uptime percentage as a formatted string
  formatUptime(uptime: number): string {
    return `${(uptime * 100).toFixed(2)}%`
  }

  // Helper method to get status color based on uptime
  getStatusColor(uptime: number): string {
    if (uptime >= 0.99) return 'green'
    if (uptime >= 0.95) return 'yellow'
    return 'red'
  }

  // Helper method to check if service is configured
  isConfigured(): boolean {
    return !!this.apiKey
  }
}

// Export a singleton instance
export const updownStats = new UpdownStatsService()
