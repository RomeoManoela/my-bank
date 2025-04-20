import { FaUserCircle } from 'react-icons/fa'
import Logo from './Logo.tsx'
import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'

function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <header className="flex items-center justify-between px-6">
      <Logo />
      <nav className="space-x-6 text-sm font-medium text-stone-500">
        <Link to="/">Home</Link>
        <Link to="/service">Nos services</Link>
        <Link to="/about">A propos de nous</Link>
      </nav>

      <div className="relative flex items-center space-x-4" ref={menuRef}>
        <FaUserCircle className="cursor-pointer text-2xl text-white" onClick={toggleUserMenu} />

        {showUserMenu && (
          <div className="absolute right-0 top-8 z-10 w-48 rounded-md border border-[#294e28] bg-[#031a09] shadow-lg">
            <div className="py-2">
              <Link
                to="/login"
                className={
                  'block rounded-md px-4 py-2 text-sm text-white hover:bg-[#294e28] hover:text-lime-400'
                }
                onClick={() => setShowUserMenu(false)}
              >
                Se connecter
              </Link>
              <Link
                to="/register"
                className={
                  'block rounded-md px-4 py-2 text-sm text-white hover:bg-[#294e28] hover:text-lime-400'
                }
                onClick={() => setShowUserMenu(false)}
              >
                Créer un compte
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
