import { Navigate, Outlet } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import { AxiosResponse } from 'axios'
import api from './api.ts'
import Loader from '../ui/Loader.tsx'

function ProtectedRoute(): React.ReactElement {
  const [authState, setAuthState] = useState<'loading' | 'authenticated' | 'unauthenticated'>(
    'loading',
  )

  useEffect((): void => {
    async function checkToken() {
      const token: string | null = localStorage.getItem('access_token')

      // Pas de token = non authentifié
      if (!token) {
        setAuthState('unauthenticated')
        return
      }

      try {
        // Vérifier si le token est expiré
        const exp: number = jwtDecode(token) as number
        const currentTime: number = Date.now() / 1000

        if (exp < currentTime) {
          // Token expiré, essayer de le rafraîchir
          try {
            const response: AxiosResponse = await api.post('token-refresh/', {
              withCredentials: true,
            })
            const newToken: string = response.data.access
            localStorage.setItem('access_token', newToken)
            setAuthState('authenticated')
          } catch (refreshError) {
            console.log(refreshError)
            localStorage.removeItem('access_token')
            setAuthState('unauthenticated')
          }
        } else {
          // Token valide
          setAuthState('authenticated')
        }
      } catch (error) {
        console.log(error)
        // Erreur de décodage = token invalide
        localStorage.removeItem('access_token')
        setAuthState('unauthenticated')
      }
    }

    checkToken().catch((): void => setAuthState('unauthenticated'))
  }, [])

  if (authState === 'loading') {
    return <Loader />
  }

  // Rediriger si non authentifié
  if (authState === 'unauthenticated') {
    return <Navigate to="/login" replace />
  }

  // Afficher les routes enfants si authentifié
  return <Outlet />
}

export default ProtectedRoute
