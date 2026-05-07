import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import type { Role } from '@/types/enums'
import { useAuthStore } from '@/stores/auth.store'
import i18n from '@/i18n'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    requiresRole?: Role | Role[]
    layout?: 'default' | 'auth' | 'cabinet'
    title?: string
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/HomePage.vue'),
    meta: { title: 'titles.home' },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/LoginPage.vue'),
    meta: { layout: 'auth', title: 'titles.login' },
  },

  // Cities
  {
    path: '/cities',
    name: 'cities',
    component: () => import('@/pages/cities/CitiesListPage.vue'),
    meta: { title: 'titles.cities' },
  },
  {
    path: '/cities/:id',
    name: 'city-detail',
    component: () => import('@/pages/cities/CityDetailPage.vue'),
    meta: { title: 'titles.city' },
  },

  // Districts
  {
    path: '/districts',
    name: 'districts',
    component: () => import('@/pages/districts/DistrictsListPage.vue'),
    meta: { title: 'titles.districts' },
  },
  {
    path: '/districts/:id',
    name: 'district-detail',
    component: () => import('@/pages/districts/DistrictDetailPage.vue'),
    meta: { title: 'titles.district' },
  },

  // Projects
  {
    path: '/projects',
    name: 'projects',
    component: () => import('@/pages/projects/ProjectsListPage.vue'),
    meta: { title: 'titles.projects' },
  },
  {
    path: '/projects/new',
    name: 'project-create',
    component: () => import('@/pages/projects/ProjectEditPage.vue'),
    meta: { requiresAuth: true, requiresRole: ['ADMIN', 'ARCHITECT'], title: 'titles.projectCreate' },
  },
  {
    path: '/projects/:id/edit',
    name: 'project-edit',
    component: () => import('@/pages/projects/ProjectEditPage.vue'),
    meta: { requiresAuth: true, requiresRole: ['ADMIN', 'ARCHITECT'], title: 'titles.projectEdit' },
  },
  {
    path: '/projects/compare',
    name: 'compare',
    component: () => import('@/pages/projects/ComparePage.vue'),
    meta: { title: 'titles.compare' },
  },
  {
    path: '/projects/:id',
    name: 'project-detail',
    component: () => import('@/pages/projects/ProjectDetailPage.vue'),
    meta: { title: 'titles.project' },
  },

  // Infrastructures
  {
    path: '/infrastructures',
    name: 'infrastructures',
    component: () => import('@/pages/infrastructures/InfrastructuresListPage.vue'),
    meta: { title: 'titles.infrastructures' },
  },
  {
    path: '/infrastructures/new',
    name: 'infrastructure-create',
    component: () => import('@/pages/infrastructures/InfrastructureEditPage.vue'),
    meta: { requiresAuth: true, requiresRole: ['ADMIN', 'ARCHITECT'], title: 'titles.infraCreate' },
  },
  {
    path: '/infrastructures/:id/edit',
    name: 'infrastructure-edit',
    component: () => import('@/pages/infrastructures/InfrastructureEditPage.vue'),
    meta: { requiresAuth: true, requiresRole: ['ADMIN', 'ARCHITECT'], title: 'titles.infraEdit' },
  },
  {
    path: '/infrastructures/:id',
    name: 'infrastructure-detail',
    component: () => import('@/pages/infrastructures/InfrastructureDetailPage.vue'),
    meta: { title: 'titles.infrastructure' },
  },

  // Architects
  {
    path: '/architects',
    name: 'architects',
    component: () => import('@/pages/architects/ArchitectsListPage.vue'),
    meta: { title: 'titles.architects' },
  },
  {
    path: '/architects/:id',
    name: 'architect-detail',
    component: () => import('@/pages/architects/ArchitectDetailPage.vue'),
    meta: { title: 'titles.architect' },
  },

  // Map
  {
    path: '/map',
    name: 'map',
    component: () => import('@/pages/map/MapPage.vue'),
    meta: { title: 'titles.map' },
  },

  // Cabinet (me)
  {
    path: '/me',
    name: 'my-dashboard',
    component: () => import('@/pages/me/MyDashboardPage.vue'),
    meta: { requiresAuth: true, layout: 'cabinet', title: 'titles.meDashboard' },
  },
  {
    path: '/me/projects',
    name: 'my-projects',
    component: () => import('@/pages/me/MyProjectsPage.vue'),
    meta: { requiresAuth: true, requiresRole: 'ARCHITECT', layout: 'cabinet', title: 'titles.meProjects' },
  },
  {
    path: '/me/profile',
    name: 'my-profile',
    component: () => import('@/pages/me/MyProfilePage.vue'),
    meta: { requiresAuth: true, layout: 'cabinet', title: 'titles.meProfile' },
  },

  // Admin
  {
    path: '/admin/users',
    name: 'admin-users',
    component: () => import('@/pages/admin/AdminUsersPage.vue'),
    meta: { requiresAuth: true, requiresRole: 'ADMIN', layout: 'cabinet', title: 'titles.adminUsers' },
  },
  {
    path: '/admin/cities',
    name: 'admin-cities',
    component: () => import('@/pages/admin/AdminCitiesPage.vue'),
    meta: { requiresAuth: true, requiresRole: 'ADMIN', layout: 'cabinet', title: 'titles.adminCities' },
  },
  {
    path: '/admin/districts',
    name: 'admin-districts',
    component: () => import('@/pages/admin/AdminDistrictsPage.vue'),
    meta: { requiresAuth: true, requiresRole: 'ADMIN', layout: 'cabinet', title: 'titles.adminDistricts' },
  },
  {
    path: '/admin/projects',
    name: 'admin-projects',
    component: () => import('@/pages/admin/AdminProjectsPage.vue'),
    meta: { requiresAuth: true, requiresRole: 'ADMIN', layout: 'cabinet', title: 'titles.adminProjects' },
  },
  {
    path: '/admin/infrastructures',
    name: 'admin-infrastructures',
    component: () => import('@/pages/admin/AdminInfrastructuresPage.vue'),
    meta: { requiresAuth: true, requiresRole: 'ADMIN', layout: 'cabinet', title: 'titles.adminInfrastructures' },
  },

  // 404
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/pages/NotFoundPage.vue'),
    meta: { title: 'titles.notFound' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition || { top: 0 }
  },
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.requiresRole && auth.user) {
    const allowed = Array.isArray(to.meta.requiresRole)
      ? to.meta.requiresRole
      : [to.meta.requiresRole]
    if (!allowed.includes(auth.user.role)) {
      return { name: 'home' }
    }
  }

  if (to.meta.title) {
    document.title = `${i18n.global.t(to.meta.title)} — ${i18n.global.t('titles.suffix')}`
  }
})

export default router
