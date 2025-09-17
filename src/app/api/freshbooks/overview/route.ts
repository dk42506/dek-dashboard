import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { freshbooks } from '@/lib/freshbooks'

export async function GET() {
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
        error: 'FreshBooks not connected',
        connected: false 
      }, { status: 400 })
    }

    try {
      // Set the access token
      freshbooks.setAccessToken(settings.freshbooksAccessToken)
      
      // Get financial summary and detailed invoice data
      const [financialSummary, invoicesData] = await Promise.all([
        freshbooks.getFinancialSummary(settings.freshbooksAccountId),
        freshbooks.getInvoices(settings.freshbooksAccountId, 1, 50) // Get more invoices for better overview
      ])

      const invoices = invoicesData.invoices

      // Sort invoices by date (most recent first)
      const sortedInvoices = invoices.sort((a, b) => 
        new Date(b.create_date).getTime() - new Date(a.create_date).getTime()
      )

      // Get recent paid invoices
      const recentInvoices = sortedInvoices
        .filter(invoice => invoice.v3_status === 'paid')
        .slice(0, 10)

      // Get upcoming invoices (sent but not paid, due in next 30 days)
      const now = new Date()
      const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000))
      
      const upcomingInvoices = sortedInvoices
        .filter(invoice => {
          const dueDate = new Date(invoice.due_date)
          const hasOutstanding = parseFloat(invoice.outstanding.amount) > 0
          const isNotPaid = invoice.v3_status !== 'paid'
          const isDueSoon = dueDate >= now && dueDate <= thirtyDaysFromNow
          
          return hasOutstanding && isNotPaid && isDueSoon
        })
        .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
        .slice(0, 5)

      // Count paid invoices
      const paidInvoicesCount = invoices.filter(invoice => invoice.v3_status === 'paid').length

      const response = {
        totalRevenue: financialSummary.totalRevenue,
        totalExpenses: financialSummary.totalExpenses,
        netIncome: financialSummary.netIncome,
        outstandingInvoices: financialSummary.outstandingInvoices,
        paidInvoices: paidInvoicesCount,
        currency: financialSummary.currency,
        recentInvoices: recentInvoices,
        upcomingInvoices: upcomingInvoices,
        connected: true
      }

      return NextResponse.json(response)

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
            
            // Retry the API call with new token
            freshbooks.setAccessToken(newAccessToken)
            const [financialSummary, invoicesData] = await Promise.all([
              freshbooks.getFinancialSummary(settings.freshbooksAccountId),
              freshbooks.getInvoices(settings.freshbooksAccountId, 1, 50)
            ])

            const invoices = invoicesData.invoices
            const sortedInvoices = invoices.sort((a, b) => 
              new Date(b.create_date).getTime() - new Date(a.create_date).getTime()
            )

            const recentInvoices = sortedInvoices
              .filter(invoice => invoice.v3_status === 'paid')
              .slice(0, 10)

            const now = new Date()
            const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000))
            
            const upcomingInvoices = sortedInvoices
              .filter(invoice => {
                const dueDate = new Date(invoice.due_date)
                const hasOutstanding = parseFloat(invoice.outstanding.amount) > 0
                const isNotPaid = invoice.v3_status !== 'paid'
                const isDueSoon = dueDate >= now && dueDate <= thirtyDaysFromNow
                
                return hasOutstanding && isNotPaid && isDueSoon
              })
              .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
              .slice(0, 5)

            const paidInvoicesCount = invoices.filter(invoice => invoice.v3_status === 'paid').length

            const response = {
              totalRevenue: financialSummary.totalRevenue,
              totalExpenses: financialSummary.totalExpenses,
              netIncome: financialSummary.netIncome,
              outstandingInvoices: financialSummary.outstandingInvoices,
              paidInvoices: paidInvoicesCount,
              currency: financialSummary.currency,
              recentInvoices: recentInvoices,
              upcomingInvoices: upcomingInvoices,
              connected: true
            }

            return NextResponse.json(response)
          }
        } catch (refreshError) {
          console.error('Failed to refresh FreshBooks token:', refreshError)
        }
      }
      
      return NextResponse.json({ 
        error: 'Failed to fetch FreshBooks data',
        details: fbError.message,
        connected: false
      }, { status: 500 })
    }

  } catch (error) {
    console.error('FreshBooks overview error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
