import { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'
import { CommandPalette } from '@/components/CommandPalette'
import { HomePage } from '@/routes/HomePage'
import { NotePage } from '@/routes/NotePage'

function App() {
  const [paletteOpen, setPaletteOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div
      className="flex min-h-screen"
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >
      <Sidebar onOpenSearch={() => setPaletteOpen(true)} />
      <MainArea />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  )
}

function MainArea() {
  const location = useLocation()
  return (
    <main className="flex-1 min-w-0 relative">
      <div
        key={location.pathname}
        className="w-full max-w-[920px] mx-auto px-[64px] max-[1100px]:px-10 max-[900px]:px-6 pt-[72px] pb-[30vh] animate-fade-up"
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/note/*" element={<NotePage />} />
        </Routes>
      </div>
    </main>
  )
}

export default App
