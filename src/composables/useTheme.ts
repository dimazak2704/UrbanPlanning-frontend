import { computed } from 'vue'
import { useDark, usePreferredDark, useStorage, useToggle } from '@vueuse/core'

export type ThemeMode = 'light' | 'dark' | 'auto'

export function useTheme() {
  const preferredDark = usePreferredDark()
  const theme = useStorage<ThemeMode>('theme', 'auto', localStorage)
  const isDark = useDark({
    selector: 'html',
    attribute: 'class',
    valueDark: 'dark',
    valueLight: '',
  })
  const toggleDark = useToggle(isDark)

  const resolvedTheme = computed<'light' | 'dark'>(() => {
    if (theme.value === 'auto') {
      return preferredDark.value ? 'dark' : 'light'
    }
    return theme.value
  })

  const options: ThemeMode[] = ['light', 'dark', 'auto']

  function applyTheme(mode: ThemeMode) {
    theme.value = mode

    if (mode === 'auto') {
      isDark.value = preferredDark.value
      return
    }

    isDark.value = mode === 'dark'
  }

  function cycleTheme() {
    const currentIndex = options.indexOf(theme.value)
    const nextIndex = (currentIndex + 1) % options.length
    applyTheme(options[nextIndex])
  }

  function toggleLightDark() {
    if (theme.value === 'auto') {
      applyTheme(preferredDark.value ? 'light' : 'dark')
      return
    }
    toggleDark()
    theme.value = isDark.value ? 'dark' : 'light'
  }

  applyTheme(theme.value)

  return {
    theme,
    isDark,
    resolvedTheme,
    applyTheme,
    cycleTheme,
    toggleLightDark,
  }
}
