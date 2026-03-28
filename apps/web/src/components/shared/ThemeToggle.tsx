'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Sun, Moon } from 'lucide-react'

type Theme = 'dark' | 'light'
const ThemeCtx = createContext<{ theme: Theme; toggle: () => void }>({ theme: 'dark', toggle: () => {} })

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const stored = localStorage.getItem('bookit-theme') as Theme | null
    if (stored) {
      setTheme(stored)
      document.documentElement.setAttribute('data-theme', stored)
    }
  }, [])

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('bookit-theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  return <ThemeCtx.Provider value={{ theme, toggle }}>{children}</ThemeCtx.Provider>
}

export const useTheme = () => useContext(ThemeCtx)

export function ThemeToggle() {
  const { theme, toggle } = useTheme()

  return (
    <button
      onClick={toggle}
      className="relative w-14 h-7 rounded-full bg-surface-700 border border-white/10 transition-colors duration-300 hover:border-white/20 group"
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div
        className={`absolute top-0.5 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
          theme === 'dark'
            ? 'left-0.5 bg-surface-500'
            : 'left-[1.625rem] bg-amber-400'
        }`}
      >
        {theme === 'dark' ? (
          <Moon size={14} className="text-blue-300" />
        ) : (
          <Sun size={14} className="text-amber-800" />
        )}
      </div>
    </button>
  )
}
