import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Project } from '@/types/project'
import type { ProjectStatus } from '@/types/enums'

const STORAGE_KEY = 'compareProjects'
export const MAX_COMPARE_PROJECTS = 4

function isProjectStatus(value: unknown): value is ProjectStatus {
  return typeof value === 'string' && [
    'PLANNED',
    'APPROVED',
    'UNDER_CONSTRUCTION',
    'COMPLETED',
    'SUSPENDED',
  ].includes(value)
}

function isValidProject(value: unknown): value is Project {
  if (!value || typeof value !== 'object') return false
  const project = value as Record<string, unknown>
  return (
    typeof project.id === 'number' &&
    typeof project.name === 'string' &&
    typeof project.districtId === 'number' &&
    typeof project.districtName === 'string' &&
    typeof project.cityId === 'number' &&
    typeof project.cityName === 'string' &&
    typeof project.architectId === 'number' &&
    typeof project.architectFullName === 'string' &&
    isProjectStatus(project.status) &&
    (typeof project.startDate === 'string' || project.startDate === null) &&
    (typeof project.endDate === 'string' || project.endDate === null) &&
    (typeof project.budget === 'number' || project.budget === null) &&
    (typeof project.description === 'string' || project.description === null) &&
    (typeof project.latitude === 'number' || project.latitude === null) &&
    (typeof project.longitude === 'number' || project.longitude === null) &&
    typeof project.infrastructureCount === 'number' &&
    typeof project.createdAt === 'string' &&
    typeof project.updatedAt === 'string' &&
    (typeof project.imageUrl === 'string' || project.imageUrl === null)
  )
}

function parseStoredProjects(): Project[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isValidProject).slice(0, MAX_COMPARE_PROJECTS)
  } catch {
    return []
  }
}

export const useCompareStore = defineStore('compare', () => {
  const projects = ref<Project[]>([])

  const count = computed(() => projects.value.length)
  const isFull = computed(() => count.value >= MAX_COMPARE_PROJECTS)

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects.value))
  }

  function init() {
    projects.value = parseStoredProjects()
    persist()
  }

  function has(id: number): boolean {
    return projects.value.some((project) => project.id === id)
  }

  function add(project: Project): boolean {
    if (has(project.id)) return true
    if (isFull.value) return false
    projects.value.push(project)
    persist()
    return true
  }

  function remove(id: number) {
    projects.value = projects.value.filter((project) => project.id !== id)
    persist()
  }

  function toggle(project: Project) {
    if (has(project.id)) {
      remove(project.id)
      return true
    }
    return add(project)
  }

  function clear() {
    projects.value = []
    persist()
  }

  return {
    projects,
    count,
    isFull,
    has,
    add,
    remove,
    toggle,
    clear,
    init,
  }
})
