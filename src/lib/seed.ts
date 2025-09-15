import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

export async function seedDatabase() {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: process.env.ADMIN_EMAIL || 'admin@dekinnovations.com' }
    })

    if (existingAdmin) {
      console.log('Admin user already exists')
      return
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD || 'admin123',
      12
    )

    const admin = await prisma.user.create({
      data: {
        name: 'DEK Admin',
        email: process.env.ADMIN_EMAIL || 'admin@dekinnovations.com',
        password: hashedPassword,
        role: 'ADMIN',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    })

    console.log('Admin user created:', admin.email)

    // Create some sample clients
    const sampleClients = [
      {
        name: 'John Smith',
        email: 'john@johnsautoshop.com',
        businessName: "John's Auto Shop",
        location: 'Baltimore, MD',
        phone: '(410) 555-0123',
        notes: 'Automotive repair shop, needs website redesign and SEO optimization.',
        clientSince: new Date('2023-06-15'),
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah@sarahsbakery.com',
        businessName: "Sarah's Bakery",
        location: 'Annapolis, MD',
        phone: '(410) 555-0456',
        notes: 'Local bakery, looking for social media marketing and online ordering system.',
        clientSince: new Date('2023-08-22'),
      },
      {
        name: 'Mike Wilson',
        email: 'mike@wilsonplumbing.com',
        businessName: 'Wilson Plumbing Services',
        location: 'Columbia, MD',
        phone: '(410) 555-0789',
        notes: 'Plumbing contractor, needs lead generation and Google Ads management.',
        clientSince: new Date('2023-11-10'),
      },
    ]

    for (const clientData of sampleClients) {
      const hashedClientPassword = await bcrypt.hash('client123', 12)
      
      await prisma.user.create({
        data: {
          ...clientData,
          password: hashedClientPassword,
          role: 'CLIENT',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      })
    }

    console.log('Sample clients created')
    console.log('Database seeded successfully!')

  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Seeding failed:', error)
      process.exit(1)
    })
}
