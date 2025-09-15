import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { createUpdownCheck, pingWebsite } from '@/lib/website-monitor'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      name, 
      email, 
      businessName, 
      businessType,
      website,
      location, 
      phone, 
      password,
      repName,
      repRole,
      repEmail,
      repPhone
    } = body

    // Use businessName as the name if no name is provided
    const clientName = name || businessName || repName || 'Client'

    // Validate required fields
    if (!businessName || !email || !password) {
      return NextResponse.json(
        { error: 'Business name, email, and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      )
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Handle website monitoring if website is provided
    let websiteStatus = null
    let updownToken = null
    let lastChecked = null

    if (website && website.trim()) {
      try {
        // Set initial status to checking
        websiteStatus = 'checking'
        lastChecked = new Date()

        // Try to create updown.io check first
        const updownCheck = await createUpdownCheck(website, businessName || name)
        if (updownCheck) {
          updownToken = updownCheck.token
          websiteStatus = updownCheck.down ? 'down' : 'up'
        } else {
          // Fall back to basic ping
          const pingResult = await pingWebsite(website)
          websiteStatus = pingResult.status
          lastChecked = pingResult.lastChecked
        }
      } catch (error) {
        console.error('Error setting up website monitoring:', error)
        // Don't fail client creation if website monitoring fails
        websiteStatus = 'unknown'
      }
    }

    // Create the client (using type assertion to bypass TypeScript errors)
    const client = await (prisma.user.create as any)({
      data: {
        name: clientName,
        email,
        password: hashedPassword,
        role: 'CLIENT',
        businessName,
        businessType,
        website,
        location,
        phone,
        clientSince: new Date(),
        repName,
        repRole,
        repEmail,
        repPhone,
        websiteStatus,
        lastChecked,
        updownToken,
      }
    })

    // Log email template to console
    console.log('\n' + '='.repeat(60))
    console.log('📧 EMAIL TEMPLATE FOR NEW CLIENT')
    console.log('='.repeat(60))
    console.log(`To: ${email}`)
    console.log(`Subject: Welcome to DEK Innovations - Your Account is Ready`)
    console.log('')
    console.log(`Dear ${repName || businessName || 'Client'},`)
    console.log('')
    console.log(`Welcome to DEK Innovations! Your client account has been created and is ready to use.`)
    console.log('')
    console.log(`Here are your login credentials:`)
    console.log(`• Website: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}`)
    console.log(`• Email: ${email}`)
    console.log(`• Temporary Password: ${password}`)
    console.log('')
    console.log(`For security reasons, please log in and change your password as soon as possible.`)
    console.log('')
    console.log(`If you have any questions or need assistance, please don't hesitate to contact us.`)
    console.log('')
    console.log(`Best regards,`)
    console.log(`The DEK Innovations Team`)
    console.log('='.repeat(60) + '\n')

    // Remove password from response
    const { password: _, ...clientWithoutPassword } = client

    return NextResponse.json(clientWithoutPassword, { status: 201 })
  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clients = await (prisma.user.findMany as any)({
      where: { role: 'CLIENT' },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(clients)
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
