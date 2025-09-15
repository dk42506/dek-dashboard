'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      // Check system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme('system')
      setResolvedTheme(systemPrefersDark ? 'dark' : 'light')
    }
  }, [])

  useEffect(() => {
    const root = window.document.documentElement

    // Don't apply theme to signin page - always keep it light
    if (window.location.pathname.includes('/auth/signin')) {
      root.classList.remove('light', 'dark')
      root.classList.add('light')
      setResolvedTheme('light')
      return
    }

    // Remove existing theme classes
    root.classList.remove('light', 'dark')

    let effectiveTheme: 'light' | 'dark'

    if (theme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      effectiveTheme = systemPrefersDark ? 'dark' : 'light'
    } else {
      effectiveTheme = theme
    }

    // Add the effective theme class
    root.classList.add(effectiveTheme)
    setResolvedTheme(effectiveTheme)

    // Save to localStorage
    localStorage.setItem('theme', theme)
  }, [theme])

  // Listen for route changes to reapply theme after signin
  useEffect(() => {
    const handleRouteChange = () => {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const root = window.document.documentElement
        
        // If we're not on signin page, reapply the saved theme
        if (!window.location.pathname.includes('/auth/signin')) {
          const savedTheme = localStorage.getItem('theme') as Theme
          if (savedTheme && savedTheme !== theme) {
            setTheme(savedTheme)
          }
        }
      }, 100)
    }

    // Listen for popstate (back/forward navigation)
    window.addEventListener('popstate', handleRouteChange)
    
    // Also check on mount in case we just navigated from signin
    handleRouteChange()

    return () => window.removeEventListener('popstate', handleRouteChange)
  }, [theme])

  useEffect(() => {
    // Listen for system theme changes when theme is set to 'system'
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      const handleChange = (e: MediaQueryListEvent) => {
        const root = window.document.documentElement
        root.classList.remove('light', 'dark')
        const newTheme = e.matches ? 'dark' : 'light'
        root.classList.add(newTheme)
        setResolvedTheme(newTheme)
      }

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
