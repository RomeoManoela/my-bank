import { FaUserCircle } from 'react-icons/fa'
import Logo from './Logo.tsx'
import { Link, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { logout } from '../services/api.ts'
import { jwtDecode } from 'jwt-decode'

function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const location = useLocation()
  const isDashboard = location.pathname === '/dashboard'

  // Vérifier l'authentification au chargement et quand le localStorage change
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('access_token')

      if (!token) {
        setIsAuthenticated(false)
        return
      }

      try {
        // Vérifier si le token est valide et non expiré
        const decodedToken = jwtDecode(token)
        const currentTime = Date.now() / 1000

        if (decodedToken.exp && decodedToken.exp > currentTime) {
          setIsAuthenticated(true)
        } else {
          // Token expiré
          localStorage.removeItem('access_token')
          setIsAuthenticated(false)
        }
      } catch (error) {
        // Token invalide
        console.error('Invalid token:', error)
        localStorage.removeItem('access_token')
        setIsAuthenticated(false)
      }
    }

    checkAuth()

    const handleStorageChange = () => checkAuth()
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu)
  }

  const handleLogout = async () => {
    await logout()
    setIsAuthenticated(false)
    setShowUserMenu(false)
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
        {isAuthenticated ? (
          // Si l'utilisateur est authentifié
          isDashboard ? (
            // Si on est sur la page dashboard, on affiche les liens de base
            <>
              <Link to="/">Home</Link>
              <Link to="/service">Nos services</Link>
              <Link to="/about">A propos de nous</Link>
            </>
          ) : (
            // Si on n'est pas sur la page dashboard, on affiche le lien dashboard
            <Link to="/dashboard">Dashboard</Link>
          )
        ) : (
          // Si l'utilisateur n'est pas authentifié, on affiche les liens de base
          <>
            <Link to="/">Home</Link>
            <Link to="/service">Nos services</Link>
            <Link to="/about">A propos de nous</Link>
          </>
        )}
      </nav>

      <div className="relative flex items-center space-x-4" ref={menuRef}>
        <FaUserCircle className="cursor-pointer text-2xl text-white" onClick={toggleUserMenu} />

        {showUserMenu && (
          <div className="absolute right-0 top-8 z-10 w-48 rounded-md border border-[#294e28] bg-[#031a09] shadow-lg">
            <div className="py-2">
              {isAuthenticated ? (
                // Menu pour utilisateur connecté
                <button
                  className="block w-full rounded-md px-4 py-2 text-left text-sm text-white hover:bg-[#294e28] hover:text-lime-400"
                  onClick={handleLogout}
                >
                  Se déconnecter
                </button>
              ) : (
                // Menu pour utilisateur non connecté
                <>
                  <Link
                    to="/login"
                    className="block rounded-md px-4 py-2 text-sm text-white hover:bg-[#294e28] hover:text-lime-400"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Se connecter
                  </Link>
                  <Link
                    to="/register"
                    className="block rounded-md px-4 py-2 text-sm text-white hover:bg-[#294e28] hover:text-lime-400"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Créer un compte
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
