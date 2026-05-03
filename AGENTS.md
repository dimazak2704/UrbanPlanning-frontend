# Urban Planning Frontend — AI Agent Context

## Project Overview

Цей проєкт — фронтенд для системи управління містобудуванням (курсова робота).
Backend готовий і працює на `http://localhost:8080`. API документація: `http://localhost:8080/swagger-ui.html`.

## Tech Stack

- **Vue 3** (Composition API, `<script setup>`, TypeScript)
- **Vite** — збірка
- **Vue Router 4** — роутинг
- **Pinia** — стан
- **Axios** — HTTP
- **TailwindCSS 3** — стилізація (БЕЗ shadcn-ui, БЕЗ PrimeVue)
- **HeadlessUI** + **Heroicons** — UI компоненти
- **Leaflet** + `@types/leaflet` — карта
- **Chart.js** + `vue-chartjs` — графіки
- **@vuelidate/core** — валідація
- **@vueuse/core** — composables
- **date-fns** — форматування дат

## Architectural Principles

1. **Composition API only**, `<script setup lang="ts">` у всіх компонентах.
2. **TypeScript strict mode** — ніяких `any` без причини.
3. **Feature-based structure** — код групується по доменах, не по технологіях.
4. **Pinia store per domain** — `auth`, `projects`, `cities` тощо.
5. **Composables для reuse** — `useApi`, `useDebounce`, `usePagination`, `useMap`.
6. **Типи з API винесені в `src/types/`** — одне джерело правди.
7. **Компоненти максимально чисті** — логіка в composables/stores, в компонентах тільки рендер.
8. **БЕЗ магії** — ніяких хаків, простий і читабельний код.

## Folder Structure
src/ ├── api/ # HTTP клієнти │ ├── client.ts # axios instance + interceptors │ ├── auth.api.ts │ ├── cities.api.ts │ ├── districts.api.ts │ ├── projects.api.ts │ ├── infrastructures.api.ts │ ├── architects.api.ts │ ├── users.api.ts │ ├── me.api.ts │ ├── analytics.api.ts │ ├── map.api.ts │ └── files.api.ts ├── assets/ │ └── images/ ├── components/ │ ├── common/ # Button, Input, Modal, Select, Badge... │ ├── layout/ # AppHeader, AppSidebar, AppFooter │ ├── map/ # MapView, MapMarker, MapPopup │ ├── charts/ # PieChart, BarChart, LineChart │ ├── forms/ # FormField, FileUpload, LocationPicker │ └── tables/ # DataTable, Pagination, FilterPanel ├── composables/ │ ├── useAuth.ts │ ├── useDebounce.ts │ ├── usePagination.ts │ ├── useFilters.ts │ ├── useI18n.ts │ └── useToast.ts ├── layouts/ │ ├── DefaultLayout.vue # з header + footer │ ├── AuthLayout.vue # для /login │ └── CabinetLayout.vue # для /me/* ├── pages/ │ ├── HomePage.vue │ ├── LoginPage.vue │ ├── cities/ │ │ ├── CitiesListPage.vue │ │ └── CityDetailPage.vue │ ├── projects/ │ │ ├── ProjectsListPage.vue │ │ ├── ProjectDetailPage.vue │ │ └── ProjectEditPage.vue │ ├── infrastructures/ │ │ ├── InfrastructuresListPage.vue │ │ └── InfrastructureDetailPage.vue │ ├── architects/ │ │ ├── ArchitectsListPage.vue │ │ └── ArchitectDetailPage.vue │ ├── map/ │ │ └── MapPage.vue │ ├── me/ │ │ ├── MyDashboardPage.vue │ │ ├── MyProjectsPage.vue │ │ └── MyProfilePage.vue │ └── admin/ │ ├── AdminUsersPage.vue │ ├── AdminCitiesPage.vue │ └── AdminDistrictsPage.vue ├── router/ │ └── index.ts ├── stores/ │ ├── auth.store.ts │ └── toast.store.ts ├── types/ │ ├── api.ts # generic API types (Page, Filter) │ ├── enums.ts # Role, ProjectStatus, InfrastructureType │ ├── city.ts │ ├── district.ts │ ├── project.ts │ ├── infrastructure.ts │ ├── architect.ts │ ├── user.ts │ ├── me.ts │ ├── analytics.ts │ └── map.ts ├── utils/ │ ├── format.ts # форматування чисел, валют, дат │ ├── enum-labels.ts # переклади enum-ів для UI │ └── validators.ts ├── App.vue ├── main.ts └── style.css # Tailwind imports + глобальні стилі




## Backend API Contract

### Base URL
- Dev: `http://localhost:8080/api`
- Змінна середовища: `VITE_API_BASE_URL`

### Authentication
- `POST /auth/login` → `{ token, email, role, userId }`
- Всі захищені ендпоінти вимагають: `Authorization: Bearer <token>`
- Токен зберігається в `localStorage`
- Якщо 401 — logout і редірект на `/login`

### Roles
```ts
type Role = 'ADMIN' | 'ARCHITECT'
// GUEST = не авторизований (просто нема токена)
Enums (з бекенду)
ts


type ProjectStatus = 'PLANNED' | 'APPROVED' | 'UNDER_CONSTRUCTION' | 'COMPLETED' | 'SUSPENDED'
type InfrastructureStatus = 'PLANNED' | 'UNDER_CONSTRUCTION' | 'OPERATIONAL'
type InfrastructureType = 'TRANSPORT' | 'SOCIAL' | 'UTILITY' | 'RECREATIONAL' | 'OTHER'
type DistrictType = 'RESIDENTIAL' | 'INDUSTRIAL' | 'RECREATIONAL' | 'MIXED'
Pagination Response Format
ts


interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number      // поточна сторінка (0-based!)
  size: number
  first: boolean
  last: boolean
}
Error Response Format
ts


interface ErrorResponse {
  status: number
  error: string
  message: string
  timestamp: string
}
Повний список ендпоінтів
Auth:

POST /auth/login — body: {email, password} → AuthResponse
Me (current user):

GET /me — мій профіль
PUT /me — оновити профіль (тільки архітектор)
PUT /me/password — змінити пароль
DELETE /me/avatar — видалити свій аватар
GET /me/stats — статистика архітектора
Users (ADMIN only):

GET /users?page=0&size=10 — список
GET /users/{id} — один
POST /users — створити
PUT /users/{id} — оновити
DELETE /users/{id} — видалити
Cities (ADMIN для CUD, GUEST для read):

GET /cities?name=...&region=...&minPopulation=...&page=0&size=10&sort=name,asc
GET /cities/{id}
POST /cities (auth)
PUT /cities/{id} (auth)
DELETE /cities/{id} (auth)
Districts:

GET /districts?name=&cityId=&type=...&page=0&size=10
GET /districts/{id}
POST /districts (auth)
PUT /districts/{id} (auth)
DELETE /districts/{id} (auth)
Projects (ADMIN + ARCHITECT для CUD):

GET /projects?name=&cityId=&districtId=&architectId=&status=&minBudget=&maxBudget=&startDateFrom=&startDateTo=&page=0&size=10
GET /projects/{id}
GET /projects/my (тільки ARCHITECT — свої проєкти)
POST /projects
PUT /projects/{id} (owner або admin)
DELETE /projects/{id} (owner або admin)
Infrastructures:

GET /infrastructures?name=&type=&status=&projectId=&districtId=&cityId=&page=0&size=10
GET /infrastructures/{id}
POST /infrastructures
PUT /infrastructures/{id}
DELETE /infrastructures/{id}
Architects (public read-only):

GET /architects?fullName=&specialization=&minExperience=&maxExperience=&page=0&size=10
GET /architects/{id}
Analytics (public):

GET /analytics/overview — overall KPI
GET /analytics/projects/by-status — pie chart data
GET /analytics/projects/by-city?limit=5 — bar chart
GET /analytics/infrastructures/by-type — pie chart
GET /analytics/architects/top?limit=5 — leaderboard
GET /analytics/projects/timeline — line chart
Map (public):

GET /map/cities — маркери міст
GET /map/districts?cityId=... — маркери районів
GET /map/projects?cityId=&districtId=&architectId=&status=&swLat=&swLng=&neLat=&neLng=
GET /map/infrastructures?cityId=&projectId=&type=&status=&swLat=&swLng=&neLat=&neLng=
Files (auth):

POST /files/avatars — form-data file, returns {url}
POST /files/projects — form-data, повертає URL
POST /files/infrastructures — form-data, повертає URL
Design System
Colors (Tailwind config)
Сучасна палітра з акцентом на темно-синьому + бірюзовий:

Primary: indigo (Tailwind indigo-600, indigo-700 hover)
Accent: teal (для CTA, графіків)
Neutral: slate (фони, текст)
Success: emerald
Warning: amber
Danger: red
Status colors для проєктів:
PLANNED → slate
APPROVED → blue
UNDER_CONSTRUCTION → amber
COMPLETED → emerald
SUSPENDED → red
Typography
Headings: Inter (import з Google Fonts)
Body: Inter
H1: text-3xl font-bold, H2: text-2xl font-semibold, H3: text-xl font-semibold
Spacing & Layout
Containers: max-w-7xl mx-auto px-4
Cards: bg-white rounded-xl shadow-sm border border-slate-200 p-6
Buttons: великі, з іконками
Всюди rounded-lg мінімум, ніяких гострих кутів
Components style
Cards з hover-ефектом на list-сторінках
Skeleton loaders замість спінерів (де можна)
Toast notifications в правому верхньому куті
Modal dialogs для confirmation
Empty states з ілюстрацією/іконкою + CTA
Localization
Default language: українська
Всі текстові константи UI — в src/utils/enum-labels.ts (мапінг enum → українська мітка) або локалізаційний файл
Дати: date-fns з uk locale
Валюта: формат ₴ 1 250 000 000
Roles & Permissions (frontend)
GUEST (не авторизований)
✅ Переглядати: головну, міста, райони, проєкти, інфраструктуру, архітекторів, карту, аналітику
❌ Ніяких CUD операцій
Бачить кнопку "Увійти" в header
ARCHITECT (авторизований архітектор)
✅ Все що GUEST +
✅ Створювати/редагувати/видаляти ВЛАСНІ проєкти
✅ Додавати/редагувати/видаляти інфраструктуру у своїх проєктах
✅ Кабінет /me/
❌ Редагувати чужі проєкти, чужі інфри, користувачів, міста, райони
У header: кнопка "Кабінет"
ADMIN
✅ Усе, що архітектор, але на всіх об'єктах (може редагувати чужі проєкти)
✅ CRUD міст/районів
✅ CRUD користувачів (адмін створює архітекторів)
У header: кнопка "Адмінка"
Важливі UX рішення
Пошук+фільтри на кожному списку — debounced input, dropdown для enum, range для числових полів.
URL-state sync — фільтри і сторінка зберігаються в query string, щоб можна було поділитися посиланням.
Loading states — ніколи не показувати порожній екран. Skeleton або spinner.
Error handling — всі помилки через toast, з повідомленням з бекенду (воно локалізоване).
Infinite scroll НЕ використовуємо — тільки пагінація з номерами сторінок.
Форми — валідація + on submit disabled якщо invalid.
Confirmation modals для delete.
Breadcrumbs на deep-сторінках.
Responsive — mobile-first, але основна цільова — desktop.
Code Conventions
Naming
Файли компонентів: PascalCase.vue
Composables: camelCase.ts починається з use*
Stores: kebab-case.store.ts
Types: PascalCase для типів, camelCase для полів
Import order
ts


// 1. Vue core
import { ref, computed } from 'vue'
// 2. 3rd party
import axios from 'axios'
// 3. Project aliases (@/...)
import { useAuthStore } from '@/stores/auth.store'
// 4. Relative
import CityCard from './CityCard.vue'
TypeScript
interface для об'єктів, type для unions/aliases
Props через defineProps<PropsType>()
Emits через defineEmits<{ (e: 'update', value: string): void }>()
Component structure
vue


<script setup lang="ts">
// 1. Imports
// 2. Props & Emits
// 3. Refs & reactive state
// 4. Computed
// 5. Methods
// 6. Lifecycle hooks
// 7. Watchers
</script>

<template>
  <!-- clean template, мінімум логіки -->
</template>

<!-- Без <style> блоків зазвичай. Все через Tailwind. -->
Don'ts
❌ НЕ використовуй Options API
❌ НЕ використовуй shadcn-ui, PrimeVue, Vuetify, Element-Plus
❌ НЕ пиши inline-стилі через style=""
❌ НЕ роби fetch/axios у компонентах — через store або composable
❌ НЕ дублюй типи — імпортуй з src/types/
❌ НЕ ігноруй TS помилки через as any
❌ НЕ роби глобальні змінні
Before you start coding
Прочитай цей файл повністю.
Подивися поточну структуру src/.
Дотримуйся її, не створюй нових папок без причини.
Якщо треба нова залежність — запитай у юзера.