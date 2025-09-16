import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

export async function seedDatabase() {
  try {
    // Remove any existing admin users
    await prisma.user.deleteMany({
      where: { role: 'ADMIN' }
    })

    // Create the new admin user
    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD || 'DylanK6205',
      12
    )

    const admin = await prisma.user.create({
      data: {
        name: 'Dylan Keller',
        email: process.env.ADMIN_EMAIL || 'dkeller@dekinnovations.com',
        password: hashedPassword,
        role: 'ADMIN',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    })

    console.log('Admin user created:', admin.email)
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
