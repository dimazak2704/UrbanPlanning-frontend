import axios from 'axios'
import type { ErrorResponse } from '@/types/api'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // Send locale for backend i18n (AcceptHeaderLocaleResolver)
  const locale = localStorage.getItem('locale') || 'uk'
  config.headers['Accept-Language'] = locale

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('authUser')
      window.location.href = '/login'
    }

    const serverMessage = (error.response?.data as ErrorResponse)?.message
    const message = serverMessage || error.message || 'Unknown error'
    return Promise.reject(new Error(message))
  },
)

export default apiClient
