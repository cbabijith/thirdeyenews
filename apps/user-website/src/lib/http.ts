export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message)
    this.name = 'ApiError'
  }
}

/** A single budget includes the response body and one retry for transient GET failures. */
export async function fetchJson<T>(url: string | URL, init: RequestInit = {}, timeoutMs = 6000): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  const abort = () => controller.abort()
  init.signal?.addEventListener('abort', abort, { once: true })
  if (init.signal?.aborted) controller.abort()
  try {
    for (let attempt = 0; ; attempt++) {
      try {
        const res = await fetch(url, { ...init, signal: controller.signal })
        if (!res.ok) {
          await res.body?.cancel()
          throw new ApiError('Content service request failed', res.status)
        }
        return await res.json() as T
      } catch (error) {
        if (controller.signal.aborted) throw new ApiError('Content service timed out', 504)
        const transient = error instanceof ApiError ? error.status >= 500 || error.status === 429 : error instanceof TypeError
        if (attempt > 0 || !transient || (init.method && init.method !== 'GET')) throw error
      }
    }
  } finally {
    clearTimeout(timer)
    init.signal?.removeEventListener('abort', abort)
  }
}
