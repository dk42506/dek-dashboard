import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuth = !!token
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth')
    const isAdminPage = req.nextUrl.pathname.startsWith('/admin')
    const isClientPage = req.nextUrl.pathname.startsWith('/client')

    // Allow auth pages without authentication
    if (isAuthPage) {
      return null
    }

    // Redirect unauthenticated users to sign in (but not from root)
    if (!isAuth && req.nextUrl.pathname !== '/') {
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }

    // Role-based redirects for authenticated users
    if (isAuth) {
      if (isAdminPage && token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/client', req.url))
      }

      if (isClientPage && token?.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin', req.url))
      }
    }

    return null
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to auth pages and root page
        if (req.nextUrl.pathname.startsWith('/auth') || req.nextUrl.pathname === '/') {
          return true
        }
        // Require authentication for protected routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: ['/admin/:path*', '/client/:path*', '/auth/:path*']
}
