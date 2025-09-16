# DEK Innovations Dashboard

A comprehensive client management dashboard built with Next.js, featuring client management, website monitoring, financial integration, and business analytics.

## 🚀 Quick Start - Deploy to Vercel

### Prerequisites
- GitHub account
- Vercel account (free tier works)
- Your admin credentials ready

### Step 1: Deploy to Vercel

1. **Push to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Ready for production deployment"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository `dk42506/dek-dashboard`
   - Vercel will auto-detect Next.js settings

3. **Configure Environment Variables** in Vercel:
   ```
   DATABASE_URL=file:./prisma/dev.db
   NEXTAUTH_URL=https://dashboard.dekinnovations.com
   NEXTAUTH_SECRET=your-super-secret-key-change-this-now
   ADMIN_EMAIL=dkeller@dekinnovations.com
   ADMIN_PASSWORD=DylanK6205
   NODE_ENV=production
   ```

4. **Set Custom Domain**:
   - In Vercel project settings → Domains
   - Add `dashboard.dekinnovations.com`
   - Update your DNS to point to Vercel

### Step 2: Initialize Database

After deployment, run the database setup:

1. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

2. **Push Database Schema**:
   ```bash
   npx prisma db push
   ```

3. **Seed Admin Account**:
   ```bash
   npm run seed
   ```

### Step 3: Configure Your Dashboard

1. **Login**: Go to `https://dashboard.dekinnovations.com`
   - Email: `dkeller@dekinnovations.com`
   - Password: `DylanK6205`

2. **Configure Settings**:
   - Go to Settings
   - Add your FreshBooks API credentials
   - Add your Updown.io API key (optional)
   - Set up business profile

3. **Start Adding Clients**:
   - Click "Add New Client"
   - Fill in client details
   - Watch notifications appear in real-time

## 🔗 Add Dashboard Button to Your Website

Add this HTML to your main website to link to the dashboard:

```html
<!-- Dashboard Access Button -->
<div style="position: fixed; top: 20px; right: 20px; z-index: 1000;">
  <a href="https://dashboard.dekinnovations.com" 
     target="_blank"
     style="
       display: inline-flex;
       align-items: center;
       gap: 8px;
       background: linear-gradient(135deg, #8B7D8B, #6B5B6B);
       color: white;
       padding: 12px 20px;
       border-radius: 8px;
       text-decoration: none;
       font-family: 'Inter', sans-serif;
       font-weight: 600;
       font-size: 14px;
       box-shadow: 0 4px 12px rgba(0,0,0,0.15);
       transition: all 0.3s ease;
       border: none;
     "
     onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.2)'"
     onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)'">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
    </svg>
    Dashboard
  </a>
</div>
```

Or for a more subtle approach, add to your navigation:

```html
<!-- In your navigation menu -->
<a href="https://dashboard.dekinnovations.com" 
   target="_blank"
   style="
     color: #8B7D8B;
     text-decoration: none;
     font-weight: 500;
     padding: 8px 16px;
     border-radius: 6px;
     transition: all 0.2s ease;
   "
   onmouseover="this.style.backgroundColor='#f3f4f6'; this.style.color='#6B5B6B'"
   onmouseout="this.style.backgroundColor='transparent'; this.style.color='#8B7D8B'">
  Client Dashboard
</a>
```

## 🛠 Development Setup

### Local Development

1. **Clone and Install**:
   ```bash
   git clone https://github.com/dk42506/dek-dashboard.git
   cd dek-dashboard
   npm install
   ```

2. **Environment Setup**:
   ```bash
   cp .env.example .env
   # Edit .env with your local settings
   ```

3. **Database Setup**:
   ```bash
   npx prisma generate
   npx prisma db push
   npm run seed
   ```

4. **Start Development**:
   ```bash
   npm run dev
   ```

### Production Updates

To update the live dashboard:

1. **Make Changes Locally**
2. **Test Thoroughly**:
   ```bash
   npm run build
   npm run start
   ```

3. **Deploy**:
   ```bash
   git add .
   git commit -m "Update: description of changes"
   git push origin main
   ```
   
   Vercel will automatically deploy your changes.

## 📊 Features

### ✅ Client Management
- Add, edit, and manage client profiles
- Track business information and contacts
- Client portal access with password management

### ✅ Website Monitoring
- Integration with Updown.io for uptime monitoring
- Real-time website status tracking
- Automated alerts for downtime

### ✅ Financial Integration
- FreshBooks API integration
- Revenue tracking and reporting
- Financial summaries and analytics

### ✅ Notification System
- Real-time notifications for new clients
- Website monitoring alerts
- Activity tracking and history

### ✅ Business Analytics
- Client growth metrics
- Revenue reporting
- Monthly business summaries

### ✅ Security Features
- Secure authentication with NextAuth.js
- Role-based access control
- Password encryption and management

## 🔧 Configuration

### Environment Variables

```bash
# Database
DATABASE_URL="file:./prisma/dev.db"

# Authentication
NEXTAUTH_URL="https://dashboard.dekinnovations.com"
NEXTAUTH_SECRET="your-secret-key-here"

# Admin Account
ADMIN_EMAIL="dkeller@dekinnovations.com"
ADMIN_PASSWORD="DylanK6205"

# API Integrations (Optional)
UPDOWN_API_KEY="your-updown-api-key"
FRESHBOOKS_CLIENT_ID="your-freshbooks-client-id"
FRESHBOOKS_CLIENT_SECRET="your-freshbooks-client-secret"
```

### API Integrations

#### FreshBooks Setup
1. Go to [FreshBooks Developers](https://www.freshbooks.com/api)
2. Create an application
3. Get your Client ID and Client Secret
4. Add to dashboard settings

#### Updown.io Setup
1. Sign up at [Updown.io](https://updown.io)
2. Get your API key from settings
3. Add to dashboard settings

## 🚀 Deployment Architecture

```
dashboard.dekinnovations.com
├── Next.js App (Vercel)
├── SQLite Database (Vercel)
├── Authentication (NextAuth.js)
├── API Routes (Serverless Functions)
└── Static Assets (Vercel CDN)
```

## 📱 Mobile Responsive

The dashboard is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🔒 Security

- All passwords are hashed with bcrypt
- Session-based authentication
- CSRF protection
- SQL injection prevention
- XSS protection
- Secure headers

## 📈 Performance

- Server-side rendering with Next.js
- Optimized images and assets
- CDN delivery via Vercel
- Efficient database queries
- Caching strategies

## 🆘 Support

If you encounter any issues:

1. **Check the logs** in Vercel dashboard
2. **Verify environment variables** are set correctly
3. **Ensure database is properly initialized**
4. **Check API integrations** are configured

## 📝 License

This project is proprietary software for DEK Innovations.

---

**Ready to manage your clients like a pro!** 🎉

Login at: https://dashboard.dekinnovations.com
- Email: dkeller@dekinnovations.com
- Password: DylanK6205
