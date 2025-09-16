import { prisma } from './prisma'

export interface CreateNotificationData {
  type: 'new_client' | 'website_down' | 'website_up'
  title: string
  message: string
  userId?: string
  clientId?: string
}

export async function createNotification(data: CreateNotificationData) {
  try {
    const notification = await prisma.notification.create({
      data: {
        type: data.type,
        title: data.title,
        message: data.message,
        userId: data.userId,
        clientId: data.clientId,
      }
    })
    return notification
  } catch (error) {
    console.error('Error creating notification:', error)
    return null
  }
}

export async function createNewClientNotification(clientName: string, clientId: string) {
  return createNotification({
    type: 'new_client',
    title: 'New Client Added',
    message: `${clientName} has been added as a new client`,
    clientId,
  })
}

export async function createWebsiteDownNotification(clientName: string, website: string, clientId: string) {
  return createNotification({
    type: 'website_down',
    title: 'Website Down Alert',
    message: `${clientName}'s website (${website}) is currently down`,
    clientId,
  })
}

export async function createWebsiteUpNotification(clientName: string, website: string, clientId: string) {
  return createNotification({
    type: 'website_up',
    title: 'Website Back Online',
    message: `${clientName}'s website (${website}) is back online`,
    clientId,
  })
}

export async function getNotifications(userId?: string, limit = 10) {
  try {
    const notifications = await prisma.notification.findMany({
      where: userId ? { userId } : {},
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        client: {
          select: {
            name: true,
            businessName: true,
          }
        }
      }
    })
    return notifications
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return []
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true }
    })
    return true
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return false
  }
}
