export function resolveMediaUrl(url?: string | null): string | null {
  if (!url) return null
  if (/^https?:\/\//i.test(url)) return url

  const apiBase = import.meta.env.VITE_API_BASE_URL as string | undefined
  if (!apiBase) return url

  try {
    const apiOrigin = new URL(apiBase).origin
    if (url.startsWith('/')) {
      return `${apiOrigin}${url}`
    }
    return `${apiOrigin}/${url}`
  } catch {
    return url
  }
}
