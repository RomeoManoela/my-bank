import axios, { AxiosInstance } from 'axios'

const baseURL = 'http://localhost:8001/api/'

const api: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token: string | null = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
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
        const response = await axios.post(
          `${baseURL}/token-refresh/`,
          {},
          { withCredentials: true },
        )

        const newToken = response.data.access
        localStorage.setItem('accessToken', newToken)

        originalRequest.headers.Authorization = `Bearer ${newToken}`

        return api(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem('accessToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export const logout = async (): Promise<void> => {
  try {
    await api.post('logout/')
    localStorage.removeItem('accessToken')
    window.location.href = '/login'
  } catch (error) {
    console.error(error)
  }
}

export default api
