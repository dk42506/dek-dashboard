// Website monitoring utilities using updown.io API and basic ping functionality

export interface WebsiteStatus {
  status: 'up' | 'down' | 'unknown' | 'checking'
  lastChecked: Date
  responseTime?: number
  statusCode?: number
  error?: string
}

export interface UpdownCheck {
  token: string
  url: string
  down: boolean
  uptime: number
  last_status: number
  error: string | null
  last_check_at: string
}

/**
 * Basic website ping without external API - server-side only
 */
export async function pingWebsite(url: string): Promise<WebsiteStatus> {
  try {
    const startTime = Date.now()
    
    // Ensure URL has protocol
    const fullUrl = url.startsWith('http') ? url : `https://${url}`
    
    // Use fetch with proper headers and timeout
    const response = await fetch(fullUrl, {
      method: 'HEAD',
      signal: AbortSignal.timeout(10000), // 10 second timeout
      headers: {
        'User-Agent': 'DEK-Dashboard-Monitor/1.0',
        'Accept': '*/*',
      },
      // Follow redirects to get final status
      redirect: 'follow',
    })
    
    const responseTime = Date.now() - startTime
    
    // Only consider 2xx and 3xx status codes as "up"
    const isUp = response.status >= 200 && response.status < 400
    
    return {
      status: isUp ? 'up' : 'down',
      lastChecked: new Date(),
      responseTime,
      statusCode: response.status,
    }
  } catch (error) {
    console.error(`Website ping failed for ${url}:`, error)
    
    // Determine error type for better reporting
    let errorMessage = 'Unknown error'
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = 'Connection timeout'
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Connection failed - site cannot be reached'
      } else {
        errorMessage = error.message
      }
    }
    
    return {
      status: 'down',
      lastChecked: new Date(),
      error: errorMessage,
    }
  }
}

/**
 * Create a new updown.io check
 */
export async function createUpdownCheck(url: string, alias?: string): Promise<UpdownCheck | null> {
  const apiKey = process.env.UPDOWN_API_KEY
  if (!apiKey) {
    console.warn('UPDOWN_API_KEY not configured')
    return null
  }

  try {
    // Ensure URL has protocol
    const fullUrl = url.startsWith('http') ? url : `https://${url}`
    
    const response = await fetch('https://updown.io/api/checks', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        url: fullUrl,
        period: '300', // Check every 5 minutes
        apdex_t: '2.0', // 2 second threshold
        enabled: 'true',
        published: 'false',
        ...(alias && { alias }),
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Failed to create updown check:', error)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating updown check:', error)
    return null
  }
}

/**
 * Get status of an existing updown.io check
 */
export async function getUpdownStatus(token: string): Promise<UpdownCheck | null> {
  const apiKey = process.env.UPDOWN_API_KEY
  if (!apiKey) {
    console.warn('UPDOWN_API_KEY not configured')
    return null
  }

  try {
    const response = await fetch(`https://updown.io/api/checks/${token}`, {
      headers: {
        'X-API-KEY': apiKey,
      },
    })

    if (!response.ok) {
      console.error('Failed to get updown status:', response.statusText)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Error getting updown status:', error)
    return null
  }
}

/**
 * Delete an updown.io check
 */
export async function deleteUpdownCheck(token: string): Promise<boolean> {
  const apiKey = process.env.UPDOWN_API_KEY
  if (!apiKey) {
    console.warn('UPDOWN_API_KEY not configured')
    return false
  }

  try {
    const response = await fetch(`https://updown.io/api/checks/${token}`, {
      method: 'DELETE',
      headers: {
        'X-API-KEY': apiKey,
      },
    })

    return response.ok
  } catch (error) {
    console.error('Error deleting updown check:', error)
    return false
  }
}

/**
 * Monitor website status - tries updown.io first, falls back to basic ping
 */
export async function monitorWebsite(url: string, updownToken?: string): Promise<WebsiteStatus> {
  // If we have an updown token, use that
  if (updownToken) {
    const updownStatus = await getUpdownStatus(updownToken)
    if (updownStatus) {
      return {
        status: updownStatus.down ? 'down' : 'up',
        lastChecked: new Date(updownStatus.last_check_at),
        statusCode: updownStatus.last_status,
        error: updownStatus.error || undefined,
      }
    }
  }

  // Fall back to basic ping
  return await pingWebsite(url)
}

/**
 * Get website status display info
 */
export function getStatusDisplay(status: string | null) {
  switch (status) {
    case 'up':
      return {
        text: 'Online',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        icon: '🟢',
      }
    case 'down':
      return {
        text: 'Offline',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        icon: '🔴',
      }
    case 'checking':
      return {
        text: 'Checking...',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        icon: '🟡',
      }
    default:
      return {
        text: 'Unknown',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        icon: '⚪',
      }
  }
}
