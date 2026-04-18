import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'
import { CommandPalette } from '@/components/CommandPalette'
import { HomePage } from '@/routes/HomePage'
import { NotePage } from '@/routes/NotePage'

function App() {
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [progress, setProgress] = useState(0)

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

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement
      const max = h.scrollHeight - h.clientHeight
      setProgress(max > 0 ? (h.scrollTop / max) * 100 : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="flex min-h-screen">
      <div
        className="fixed top-0 left-0 h-0.5 bg-accent z-50 transition-[width] duration-150"
        style={{ width: `${progress}%` }}
      />
      <Sidebar onOpenSearch={() => setPaletteOpen(true)} />
      <main className="flex-1 min-w-0">
        <div className="max-w-3xl mx-auto px-8 lg:px-12 py-14">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/note/*" element={<NotePage />} />
          </Routes>
        </div>
      </main>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  )
}

export default App
