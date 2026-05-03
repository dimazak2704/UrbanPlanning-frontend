import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import { login as apiLogin } from '@/api/auth.api'
import apiClient from '@/api/client'
import type { AuthUser, MyProfile } from '@/types/me'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const user = ref<AuthUser | null>(null)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')
  const isArchitect = computed(() => user.value?.role === 'ARCHITECT')

  function setAuth(authToken: string, authUser: AuthUser) {
    token.value = authToken
    user.value = authUser
    localStorage.setItem('authToken', authToken)
    localStorage.setItem('authUser', JSON.stringify(authUser))
  }

  function clearAuth() {
    token.value = null
    user.value = null
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
  }

  async function login(email: string, password: string) {
    const { data } = await apiLogin(email, password)
    const authUser: AuthUser = {
      id: data.userId,
      email: data.email,
      role: data.role,
    }
    setAuth(data.token, authUser)
  }

  function logout() {
    clearAuth()
  }

  async function fetchMe() {
    try {
      const { data } = await apiClient.get<MyProfile>('/me')
      if (user.value) {
        user.value.email = data.email
        user.value.role = data.role
      }
    } catch {
      clearAuth()
    }
  }

  function init() {
    const savedToken = localStorage.getItem('authToken')
    const savedUser = localStorage.getItem('authUser')

    if (savedToken && savedUser) {
      try {
        token.value = savedToken
        user.value = JSON.parse(savedUser) as AuthUser
      } catch {
        clearAuth()
      }
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    isAdmin,
    isArchitect,
    login,
    logout,
    fetchMe,
    init,
  }
})
