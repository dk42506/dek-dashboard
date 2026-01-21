import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { freshbooks } from '@/lib/freshbooks'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get admin settings to check FreshBooks connection
    const settings = await prisma.adminSettings.findUnique({
      where: { userId: session.user.id }
    })

    if (!settings?.freshbooksAccessToken || !settings?.freshbooksAccountId) {
      return NextResponse.json({ 
        error: 'FreshBooks not connected' 
      }, { status: 400 })
    }

    // Set the access token
    freshbooks.setAccessToken(settings.freshbooksAccessToken)
    
    try {
      // Get all FreshBooks clients
      const freshbooksClients = await freshbooks.getClients(settings.freshbooksAccountId)
      console.log('FreshBooks clients found:', freshbooksClients.length)
      console.log('FreshBooks clients:', freshbooksClients.map(c => ({ id: c.id, email: c.email, first_name: c.first_name, last_name: c.last_name, company_name: c.company_name })))
      
      // Get all dashboard clients
      const dashboardClients = await prisma.user.findMany({
        where: { role: 'CLIENT' }
      })
      console.log('Dashboard clients found:', dashboardClients.length)

      let syncResults = {
        imported: 0,
        updated: 0,
        errors: [] as string[],
        fbClientsFound: freshbooksClients.length,
        dashboardClientsFound: dashboardClients.length
      }

      // Import FreshBooks clients that don't exist in dashboard
      for (const fbClient of freshbooksClients) {
        try {
          // Check if client already exists by email OR by FreshBooks ID
          const existingClient = dashboardClients.find(
            client => {
              const emailMatch = client.email.toLowerCase() === fbClient.email.toLowerCase()
              const fbIdMatch = client.repRole === fbClient.id.toString() || client.repName === `FB-${fbClient.id}`
              return emailMatch || fbIdMatch
            }
          )

          if (!existingClient) {
            try {
              // Generate a temporary password for the new client
              const tempPassword = Math.random().toString(36).slice(-8)
              const bcrypt = require('bcryptjs')
              const hashedPassword = await bcrypt.hash(tempPassword, 12)

              console.log(`Attempting to create client: ${fbClient.email}`)
              console.log(`Client data:`, {
                email: fbClient.email,
                name: `${fbClient.first_name} ${fbClient.last_name}`.trim(),
                businessName: fbClient.company_name,
                phone: fbClient.business_phone || fbClient.mobile_phone,
                website: fbClient.website,
                freshbooksId: fbClient.id,
                created_at: fbClient.created_at
              })

              // Create new client in dashboard
              const newClient = await prisma.user.create({
                data: {
                  email: fbClient.email,
                  name: `${fbClient.first_name} ${fbClient.last_name}`.trim(),
                  password: hashedPassword,
                  role: 'CLIENT',
                  businessName: fbClient.company_name || null,
                  phone: fbClient.business_phone || fbClient.mobile_phone || null,
                  website: fbClient.website || null,
                  clientSince: fbClient.created_at ? new Date(fbClient.created_at) : new Date(),
                  passwordChanged: false,
                  // Store FreshBooks ID directly as string in repRole field
                  repRole: fbClient.id.toString(),
                  repName: null,
                }
              })
              
              syncResults.imported++
              console.log(`Successfully created client ${fbClient.email} with ID: ${newClient.id}`)
              console.log(`Temp password: ${tempPassword}`)
            } catch (createError: any) {
              console.error(`Failed to create client ${fbClient.email}:`, createError)
              syncResults.errors.push(`Failed to create ${fbClient.email}: ${createError.message || 'Unknown error'}`)
            }
          } else {
            // Update existing client with FreshBooks data if missing
            const updateData: any = {}
            
            if (!existingClient.businessName && fbClient.company_name) {
              updateData.businessName = fbClient.company_name
            }
            if (!existingClient.phone && (fbClient.business_phone || fbClient.mobile_phone)) {
              updateData.phone = fbClient.business_phone || fbClient.mobile_phone
            }
            if (!existingClient.website && fbClient.website) {
              updateData.website = fbClient.website
            }
            // Always update FreshBooks ID to ensure it's correct
            if (!existingClient.repRole || existingClient.repRole !== fbClient.id.toString()) {
              updateData.repRole = fbClient.id.toString()
              console.log(`Updating FreshBooks ID for ${fbClient.email}: ${fbClient.id}`)
            }
            // Clear old repName field if it has FB- prefix
            if (existingClient.repName?.startsWith('FB-')) {
              updateData.repName = null
            }

            if (Object.keys(updateData).length > 0) {
              await prisma.user.update({
                where: { id: existingClient.id },
                data: updateData
              })
              syncResults.updated++
              console.log(`Updated client ${fbClient.email} with FreshBooks data`)
            }
          }
        } catch (clientError) {
          console.error(`Error syncing client ${fbClient.email}:`, clientError)
          syncResults.errors.push(`Failed to sync ${fbClient.email}`)
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Client sync completed',
        results: syncResults
      })

    } catch (fbError: any) {
      console.error('FreshBooks API error:', fbError)
      
      // If token is expired, try to refresh it
      if (fbError.message?.includes('401') && settings.freshbooksRefreshToken) {
        try {
          const newAccessToken = await freshbooks.refreshAccessToken(settings.freshbooksRefreshToken)
          if (newAccessToken) {
            // Update the stored access token
            await prisma.adminSettings.update({
              where: { userId: session.user.id },
              data: { freshbooksAccessToken: newAccessToken }
            })
            
            return NextResponse.json({
              error: 'Token refreshed, please try again',
              tokenRefreshed: true
            }, { status: 401 })
          }
        } catch (refreshError) {
          console.error('Failed to refresh FreshBooks token:', refreshError)
        }
      }
      
      return NextResponse.json({ 
        error: 'Failed to sync with FreshBooks',
        details: fbError.message
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Client sync error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
