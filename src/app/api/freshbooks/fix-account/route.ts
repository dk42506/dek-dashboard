import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Update the account ID to the correct business account ID
    const settings = await prisma.adminSettings.update({
      where: { userId: session.user.id },
      data: {
        freshbooksAccountId: 'MMGEPp', // The correct business account ID
        updatedAt: new Date()
      }
    })

    console.log('Updated FreshBooks account ID to MMGEPp')

    return NextResponse.json({ 
      success: true, 
      message: 'Account ID updated to MMGEPp',
      accountId: settings.freshbooksAccountId
    })

  } catch (error) {
    console.error('Error updating account ID:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
