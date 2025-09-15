# DEK Innovations Dashboard

A Next.js client management dashboard for DEK Innovations with role-based authentication and a clean, professional interface matching the DEK Innovations brand.

## Features

### Phase 1 (Current)
- **Authentication System**: NextAuth.js with credentials provider
- **Role-Based Access**: Admin and Client roles with protected routes
- **Admin Dashboard**: 
  - Overview with stats and recent activity
  - Client management capabilities
  - Professional sidebar navigation
  - Placeholder sections for future integrations
- **Client Portal**: 
  - Limited view showing only client's own profile
  - Business information display
  - Placeholder sections for billing and analytics
- **Responsive Design**: Mobile-friendly interface
- **DEK Innovations Branding**: Custom color scheme and typography

### Future Phases (Planned)
- FreshBooks API integration (invoices & payments)
- GoHighLevel API integration (ads & CRM data)
- Profit/expense tracking
- Calendar & meetings
- Reports and analytics
- Website uptime monitoring

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS with custom DEK Innovations theme
- **Authentication**: NextAuth.js
- **Database**: SQLite with Prisma ORM
- **Icons**: Lucide React
- **Deployment**: Ready for Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and navigate to the project**:
   ```bash
   cd dek-dashboard
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   The `.env.local` file is already configured with default values:
   ```env
   DATABASE_URL="file:./prisma/dev.db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
   ADMIN_EMAIL="admin@dekinnovations.com"
   ADMIN_PASSWORD="admin123"
   ```

4. **Initialize the database**:
   ```bash
   npx prisma db push
   ```

5. **Seed the database with sample data**:
   ```bash
   DATABASE_URL="file:./prisma/dev.db" npx tsx src/lib/seed.ts
   ```

6. **Start the development server**:
   ```bash
   npm run dev
   ```

7. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Test Accounts

### Admin Account
- **Email**: `admin@dekinnovations.com`
- **Password**: `admin123`
- **Access**: Full dashboard with client management

### Sample Client Accounts
- **John's Auto Shop**
  - Email: `john@johnsautoshop.com`
  - Password: `client123`
  
- **Sarah's Bakery**
  - Email: `sarah@sarahsbakery.com`
  - Password: `client123`
  
- **Wilson Plumbing Services**
  - Email: `mike@wilsonplumbing.com`
  - Password: `client123`

## Project Structure

```
dek-dashboard/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/             # Admin dashboard pages
│   │   ├── auth/              # Authentication pages
│   │   ├── client/            # Client portal pages
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── admin/             # Admin-specific components
│   │   └── client/            # Client-specific components
│   ├── lib/                   # Utility functions
│   │   ├── auth.ts           # NextAuth configuration
│   │   ├── prisma.ts         # Database client
│   │   ├── seed.ts           # Database seeding
│   │   └── utils.ts          # Helper functions
│   └── types/                 # TypeScript type definitions
├── prisma/                    # Database schema and migrations
├── public/                    # Static assets
└── README.md
```

## Key Features Explained

### Authentication Flow
1. Users visit the root page and are redirected to sign-in
2. After authentication, users are redirected based on their role:
   - Admins → `/admin` (full dashboard)
   - Clients → `/client` (limited portal)
3. Middleware protects routes and enforces role-based access

### Admin Dashboard
- **Overview**: Stats cards, recent activity, quick actions
- **Client Management**: View, search, and manage all clients
- **Navigation**: Sidebar with dashboard, clients, reports, settings
- **Placeholder Sections**: Ready for future API integrations

### Client Portal
- **Profile View**: Business information and contact details
- **Limited Access**: Only sees their own data
- **Placeholder Sections**: Billing, ads performance, website analytics

### Design System
- **Colors**: Custom DEK Innovations palette (primary: #8B7D8B, secondary: #7D4F5C)
- **Typography**: Inter for body text, Space Grotesk for headings
- **Components**: Consistent styling with hover effects and animations
- **Responsive**: Mobile-first design with Tailwind breakpoints

## Development

### Adding New Features
1. Create components in appropriate directories (`/admin` or `/client`)
2. Add new pages in the `src/app` directory
3. Update types in `src/types/index.ts`
4. Use the established design patterns and color scheme

### Database Changes
1. Update `prisma/schema.prisma`
2. Run `npx prisma db push` to apply changes
3. Update TypeScript types as needed

### Styling Guidelines
- Use the custom Tailwind classes: `btn-primary`, `btn-secondary`, `card-hover`
- Follow the DEK Innovations color scheme
- Maintain consistent spacing and typography

## Deployment

### Vercel Deployment
1. **Connect to Vercel**:
   - Push code to GitHub
   - Connect repository to Vercel
   - Set custom domain: `dashboard.dekinnovations.com`

2. **Environment Variables**:
   Set these in Vercel dashboard:
   ```env
   DATABASE_URL="your-production-database-url"
   NEXTAUTH_URL="https://dashboard.dekinnovations.com"
   NEXTAUTH_SECRET="your-secure-secret-key"
   ADMIN_EMAIL="admin@dekinnovations.com"
   ADMIN_PASSWORD="your-secure-admin-password"
   ```

3. **Database Setup**:
   - For production, consider upgrading to PostgreSQL
   - Run database migrations in production environment
   - Seed with initial admin user

### Production Considerations
- Change default passwords
- Use a secure `NEXTAUTH_SECRET`
- Set up proper database backups
- Configure monitoring and logging
- Enable HTTPS and security headers

## Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Ensure `DATABASE_URL` is set correctly
   - Run `npx prisma db push` to sync schema

2. **Authentication Issues**:
   - Check `NEXTAUTH_URL` matches your domain
   - Verify `NEXTAUTH_SECRET` is set

3. **Build Errors**:
   - Clear `.next` folder and rebuild
   - Check for TypeScript errors

4. **Styling Issues**:
   - Ensure Tailwind is configured properly
   - Check for conflicting CSS classes

## Support

For questions or issues:
- **Email**: admin@dekinnovations.com
- **Business Hours**: Mon - Fri, 9AM - 6PM EST

## License

Private project for DEK Innovations. All rights reserved.
