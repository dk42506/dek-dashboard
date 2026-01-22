import { NextResponse } from 'next/server'
import { freshbooks } from '@/lib/freshbooks'

export async function GET() {
  try {
    if (!freshbooks.isConfigured()) {
      return NextResponse.json(
        { error: 'FreshBooks not configured' },
        { status: 500 }
      )
    }

    const authUrl = freshbooks.getAuthorizationUrl()
    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error('Error generating FreshBooks auth URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate authorization URL' },
      { status: 500 }
    )
  }
}
