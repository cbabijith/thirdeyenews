import 'server-only'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/server'
import type { UserRole } from '@/types'
import { canManageMember, isTeamManager, PAGE_SIZE, TeamError, validateId, validateMember, validatePassword } from './policy'

const columns = 'id,full_name,email,role,created_at,updated_at'

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new TeamError('Team management is not configured yet. Contact the site maintainer to finish setup.', 503)
  return createSupabaseClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
}

// Always verify the session with Auth and read the current role from the database.
// Client metadata, cached permissions and incoming role fields are never authority.
export async function requireTeamManager() {
  const sessionClient = await createClient()
  const { data: { user }, error } = await sessionClient.auth.getUser()
  if (error || !user) throw new TeamError('Please sign in again.', 401)
  const { data: actor, error: profileError } = await sessionClient.from('profiles').select(columns).eq('id', user.id).single()
  if (profileError || !actor || !isTeamManager(actor.role)) throw new TeamError('Only admins can manage the team.', 403)
  return { actor: actor as { id: string; email: string; role: UserRole }, sessionClient }
}

async function teamContext() {
  const context = await requireTeamManager()
  const admin = adminClient()
  // Fail closed until the role protections and atomic Auth/profile sync are installed.
  const { data, error } = await admin.rpc('team_management_version')
  if (error || data !== 1) throw new TeamError('Team management is not configured yet. Contact the site maintainer to finish setup.', 503)
  return { ...context, admin }
}

function providerError(error: { code?: string; message: string }) {
  if (['email_exists', 'user_already_exists'].includes(error.code || '')) return new TeamError('An account with this email already exists.', 409)
  if (error.code === 'weak_password') return new TeamError('This password does not meet the authentication provider’s requirements. Choose a stronger password.')
  if (error.code === 'same_password') return new TeamError('Choose a different password from the current one.')
  if (error.code === 'user_not_found') return new TeamError('This account no longer exists. Refresh the list.', 404)
  if (error.code === 'over_request_rate_limit' || error.code === 'over_email_send_rate_limit') return new TeamError('Too many attempts. Please try again shortly.', 429)
  return new TeamError('The account could not be updated. Please try again or contact the site maintainer.', 502)
}

function checkOrigin(request: NextRequest) {
  // These cookie-authenticated mutations are only called by this app.
  const origin = request.headers.get('origin')
  if (!origin || origin !== request.nextUrl.origin) throw new TeamError('Request origin is not allowed.', 403)
  if (!request.headers.get('content-type')?.startsWith('application/json')) throw new TeamError('Expected a JSON request.', 415)
}

async function readBody(request: NextRequest): Promise<Record<string, unknown>> {
  if (Number(request.headers.get('content-length') || 0) > 8192) throw new TeamError('Request is too large.', 413)
  let body: unknown
  try { body = await request.json() } catch { throw new TeamError('Invalid request body.') }
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new TeamError('Invalid request body.')
  return body as Record<string, unknown>
}

export async function teamResponse(work: () => Promise<unknown>) {
  try {
    return NextResponse.json(await work(), { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    const known = error instanceof TeamError
    return NextResponse.json({ error: known ? error.message : 'Team management is temporarily unavailable. Please try again.' }, {
      status: known ? error.status : 500, headers: { 'Cache-Control': 'no-store' },
    })
  }
}

export async function listMembers(request: NextRequest) {
  const { admin, actor } = await teamContext()
  const search = (request.nextUrl.searchParams.get('search') || '').trim().slice(0, 100)
  const role = request.nextUrl.searchParams.get('role') || 'team'
  const page = Number(request.nextUrl.searchParams.get('page') || 1)
  if (!Number.isSafeInteger(page) || page < 1 || page > 100000) throw new TeamError('Invalid page.')
  if (!['all', 'team', 'admin', 'staff', 'user', 'superadmin'].includes(role)) throw new TeamError('Invalid role filter.')
  let query = admin.from('profiles').select(columns, { count: 'exact' })
  if (role === 'team') query = query.in('role', ['superadmin', 'admin', 'staff'])
  else if (role !== 'all') query = query.eq('role', role)
  // Escape PostgREST filter syntax and LIKE wildcards; do not interpolate raw filters.
  const term = search.replace(/[^\p{L}\p{N}@.\s_+\-]/gu, '').replace(/_/g, '\\_')
  if (term) query = query.or(`full_name.ilike.%${term}%,email.ilike.%${term}%`)
  const { data, count, error } = await query.order('created_at', { ascending: false }).order('id').range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
  if (error) throw new TeamError('Could not load members. Please try again.', 502)
  return { data, count: count || 0, actor, pageSize: PAGE_SIZE }
}

export async function createMember(request: NextRequest) {
  checkOrigin(request)
  const { admin, actor } = await teamContext()
  const body = await readBody(request)
  const member = validateMember(body, actor.role)
  const password = validatePassword(body.password, body.confirmPassword)
  const { data, error } = await admin.auth.admin.createUser({
    email: member.email, password, email_confirm: true,
    user_metadata: { full_name: member.full_name }, app_metadata: { team_role: member.role },
  })
  if (error) throw providerError(error)
  return { id: data.user.id }
}

export async function mutateMember(request: NextRequest, id: string) {
  checkOrigin(request)
  validateId(id)
  const { admin, actor } = await teamContext()
  const body = await readBody(request)
  const { data: target, error: targetError } = await admin.from('profiles').select(columns).eq('id', id).maybeSingle()
  if (targetError) throw new TeamError('Could not load this member. Please try again.', 502)
  if (!target) throw new TeamError('This member no longer exists.', 404)
  if (!canManageMember(actor, target)) throw new TeamError('This account is protected. You can only manage accounts below your role, and cannot remove or edit your own account.', 403)

  if (request.method === 'DELETE') {
    if (body.confirmEmail !== target.email) throw new TeamError('Type the member’s email address to confirm deletion.')
    const { error } = await admin.auth.admin.deleteUser(id)
    if (error) throw providerError(error)
    return { success: true }
  }
  if (body.action === 'password') {
    const password = validatePassword(body.password, body.confirmPassword)
    const { error } = await admin.auth.admin.updateUserById(id, { password })
    if (error) throw providerError(error)
  } else if (body.action === 'profile') {
    const member = validateMember(body, actor.role)
    const { error } = await admin.auth.admin.updateUserById(id, {
      email: member.email, email_confirm: true,
      user_metadata: { full_name: member.full_name }, app_metadata: { team_role: member.role },
    })
    if (error) throw providerError(error)
  } else throw new TeamError('Unknown member action.')
  return { success: true }
}

export async function changeOwnPassword(request: NextRequest) {
  checkOrigin(request)
  const { actor } = await teamContext()
  const body = await readBody(request)
  const password = validatePassword(body.password, body.confirmPassword)
  if (typeof body.currentPassword !== 'string' || !body.currentPassword || body.currentPassword.length > 1024) throw new TeamError('Enter your current password.')
  // Use an isolated client so reauthentication cannot replace the browser session.
  const verifier = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
  const { data, error } = await verifier.auth.signInWithPassword({ email: actor.email, password: body.currentPassword })
  if (error || data.user?.id !== actor.id) throw new TeamError('The current password is incorrect.', 400)
  try {
    const { error: updateError } = await verifier.auth.updateUser({ password, current_password: body.currentPassword })
    if (updateError) throw providerError(updateError)
  } finally {
    await verifier.auth.signOut({ scope: 'local' })
  }
  return { success: true }
}
