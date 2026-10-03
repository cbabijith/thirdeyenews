import { NextResponse } from 'next/server'
import { toAdminUrl } from './adminUrl'
import { ApiError, fetchJson } from './http'

export async function publicProxy(path: string, method = 'GET'): Promise<NextResponse> {
  try {
    const data = await fetchJson(toAdminUrl(`/api/public${path}`), {
      method,
      headers: { Authorization: `Bearer ${process.env.ADMIN_API_TOKEN || process.env.API_ACCESS_TOKEN || ''}` },
      // A single tagged Next cache is shared by SSR and browser proxy reads.
      ...(method === 'GET' ? { next: { revalidate: 60, tags: ['public-content'] } } : { cache: 'no-store' as const }),
    })
    return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 502
    console.error('Public API request failed', { path, status })
    return NextResponse.json({ error: status === 404 ? 'News not found' : 'Content is temporarily unavailable' }, {
      status,
      headers: { 'Cache-Control': 'no-store' },
    })
  }
}
