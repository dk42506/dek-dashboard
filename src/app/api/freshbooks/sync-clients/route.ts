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
      
      // Get all dashboard clients
      const dashboardClients = await prisma.user.findMany({
        where: { role: 'CLIENT' }
      })

      let syncResults = {
        imported: 0,
        updated: 0,
        errors: [] as string[]
      }

      // Import FreshBooks clients that don't exist in dashboard
      for (const fbClient of freshbooksClients) {
        try {
          // Check if client already exists by email
          const existingClient = dashboardClients.find(
            client => client.email.toLowerCase() === fbClient.email.toLowerCase()
          )

          if (!existingClient) {
            // Create new client in dashboard
            await prisma.user.create({
              data: {
                email: fbClient.email,
                name: `${fbClient.first_name} ${fbClient.last_name}`.trim(),
                role: 'CLIENT',
                businessName: fbClient.company_name || null,
                phone: fbClient.business_phone || fbClient.mobile_phone || null,
                website: fbClient.website || null,
                clientSince: new Date(fbClient.created_at),
                // Store FreshBooks ID for future reference
                repName: `FB-${fbClient.id}`, // Temporary storage in repName field
              }
            })
            syncResults.imported++
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
            if (!existingClient.repName) {
              updateData.repName = `FB-${fbClient.id}` // Store FreshBooks ID
            }

            if (Object.keys(updateData).length > 0) {
              await prisma.user.update({
                where: { id: existingClient.id },
                data: updateData
              })
              syncResults.updated++
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
