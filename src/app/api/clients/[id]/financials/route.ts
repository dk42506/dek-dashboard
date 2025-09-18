import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { freshbooks } from '@/lib/freshbooks'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id: clientId } = await params

    // Get client from database
    const client = await prisma.user.findUnique({
      where: { id: clientId, role: 'CLIENT' },
      select: {
        id: true,
        businessName: true,
        name: true,
        email: true,
        repName: true, // Contains FreshBooks ID if synced
      }
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Check if FreshBooks is configured
    const settings = await prisma.adminSettings.findUnique({
      where: { userId: session.user.id }
    })

    if (!settings?.freshbooksAccessToken || !settings?.freshbooksAccountId) {
      return NextResponse.json({
        error: 'FreshBooks not configured',
        configured: false,
        client,
        financialData: {
          totalInvoiced: 0,
          totalPaid: 0,
          outstanding: 0,
          lastPayment: null,
          invoices: [],
          currency: 'USD'
        }
      })
    }

    try {
      // Set the access token
      freshbooks.setAccessToken(settings.freshbooksAccessToken)
      
      // Get all invoices to find ones for this client
      const invoicesData = await freshbooks.getInvoices(settings.freshbooksAccountId, 1, 100)
      const allInvoices = invoicesData.invoices

      // Filter invoices for this client by email
      const clientInvoices = allInvoices.filter(invoice => {
        // Try to match by email or FreshBooks client ID
        const fbClientId = client.repName?.replace('FB-', '')
        return invoice.clientid?.toString() === fbClientId
      })

      // Calculate financial summary
      const paidStatuses = ['paid', 'auto-paid', 'autopaid']
      let totalInvoiced = 0
      let totalPaid = 0
      let outstanding = 0
      let lastPaymentDate: Date | null = null

      const processedInvoices = clientInvoices.map(invoice => {
        const invoiceAmount = parseFloat(invoice.amount.amount)
        const outstandingAmount = parseFloat(invoice.outstanding?.amount || '0')
        const paidAmount = parseFloat(invoice.paid?.amount || '0')
        
        totalInvoiced += invoiceAmount
        outstanding += outstandingAmount
        totalPaid += paidAmount

        // Track last payment date
        if (invoice.date_paid && paidAmount > 0) {
          const paymentDate = new Date(invoice.date_paid)
          if (!lastPaymentDate || paymentDate > lastPaymentDate) {
            lastPaymentDate = paymentDate
          }
        }

        return {
          id: invoice.id,
          invoice_number: invoice.invoice_number,
          amount: invoiceAmount,
          outstanding: outstandingAmount,
          paid: paidAmount,
          status: invoice.v3_status,
          create_date: invoice.create_date,
          due_date: invoice.due_date,
          date_paid: invoice.date_paid,
          currency: invoice.amount.code
        }
      })

      // Sort invoices by creation date (newest first)
      processedInvoices.sort((a, b) => new Date(b.create_date).getTime() - new Date(a.create_date).getTime())

      const financialData = {
        totalInvoiced,
        totalPaid,
        outstanding,
        lastPayment: lastPaymentDate,
        invoices: processedInvoices,
        currency: processedInvoices.length > 0 ? processedInvoices[0].currency : 'USD',
        freshbooksClientId: client.repName?.replace('FB-', '') || null
      }

      return NextResponse.json({
        success: true,
        client,
        configured: true,
        financialData
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
        error: 'Failed to fetch FreshBooks data',
        details: fbError.message,
        client,
        configured: true,
        financialData: {
          totalInvoiced: 0,
          totalPaid: 0,
          outstanding: 0,
          lastPayment: null,
          invoices: [],
          currency: 'USD'
        }
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error fetching client financials:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
