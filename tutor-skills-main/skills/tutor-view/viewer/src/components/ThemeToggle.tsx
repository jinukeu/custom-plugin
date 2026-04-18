import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('tutor-view-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('tutor-view-theme', 'light')
    }
  }, [dark])

  return (
    <button
      onClick={() => setDark(!dark)}
      aria-label={dark ? 'Switch to light' : 'Switch to dark'}
      className="relative w-[32px] h-[18px] rounded-full transition-colors flex-shrink-0"
      style={{
        background: dark ? 'rgba(255,255,255,0.16)' : 'rgba(55, 53, 47, 0.12)',
      }}
    >
      <span
        className="absolute top-[2px] w-[14px] h-[14px] rounded-full flex items-center justify-center text-[9px] transition-all"
        style={{
          left: dark ? '16px' : '2px',
          background: dark ? '#2b2b2b' : '#ffffff',
          boxShadow: '0 1px 2px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.06)',
          transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          transitionDuration: '220ms',
        }}
      >
        {dark ? '🌙' : '☀️'}
      </span>
    </button>
  )
}
