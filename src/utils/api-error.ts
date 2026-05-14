/**
 * Витягує зрозуміле повідомлення про помилку з API відповіді.
 *
 * Axios response interceptor (client.ts) вже обгортає серверне message
 * в new Error(message), тому в більшості випадків err.message містить
 * локалізоване повідомлення від бекенду.
 *
 * @param error — будь-який об'єкт з catch-блоку
 * @param fallback — запасний текст, якщо з помилки нічого не витягнути
 */
export function getApiErrorMessage(error: unknown, fallback?: string): string {
  // Error object (from interceptor or native)
  if (error instanceof Error && error.message) {
    return error.message
  }

  // Unexpected shape — maybe a string was thrown
  if (typeof error === 'string' && error.length > 0) {
    return error
  }

  return fallback ?? 'Unknown error'
}
