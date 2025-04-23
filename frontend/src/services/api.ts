import axios, { AxiosInstance } from 'axios'

const baseURL = 'http://localhost:8001/api/'

const api: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
})

// Intercepteur pour ajouter le token JWT, accessToken aux requêtes
api.interceptors.request.use((config) => {
  const token: string | null = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Intercepteur pour gérer les erreurs 401 (token expiré)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Si l'erreur est 401 et que nous n'avons pas déjà tenté de rafraîchir le token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Utiliser axios directement pour éviter une boucle avec l'intercepteur
        const response = await axios.post(
          `${baseURL}token-refresh/`,
          {},
          {
            withCredentials: true,
            headers: { 'Content-Type': 'application/json' },
          },
        )

        const newToken = response.data.access
        localStorage.setItem('access_token', newToken)

        // Mettre à jour le token dans la requête originale
        originalRequest.headers.Authorization = `Bearer ${newToken}`

        // Réessayer la requête originale avec le nouveau token
        return api(originalRequest)
      } catch (refreshError) {
        // En cas d'échec du rafraîchissement, déconnecter l'utilisateur
        localStorage.removeItem('access_token')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    // Pour les autres erreurs, simplement les rejeter
    return Promise.reject(error)
  },
)

export const logout = async (): Promise<void> => {
  try {
    localStorage.removeItem('access_token')
    window.location.href = '/login'
  } catch (error) {
    console.error(error)
  }
}

// Fonction pour récupérer les transactions d'un utilisateur
export const getUserTransactions = async (): Promise<Transaction[]> => {
  try {
    const response = await api.get('/transactions/')
    return response.data
  } catch (error) {
    console.error('Erreur lors de la récupération des transactions:', error)
    throw error
  }
}

export default api
