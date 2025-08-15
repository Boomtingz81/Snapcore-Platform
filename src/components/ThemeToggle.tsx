// FILE: /src/components/ThemeToggle.tsx
import { useEffect } from 'react'
import { initTheme, toggleTheme } from '../theme'

export default function ThemeToggle() {
  useEffect(() => { initTheme() }, [])
  return (
    <button
      onClick={toggleTheme}
      className="glass px-4 py-2 rounded-lg hover:shadow-[0_0_10px_rgba(0,240,255,0.3)]"
      aria-label="Toggle theme"
    >
      Toggle Theme
    </button>
  )
}
