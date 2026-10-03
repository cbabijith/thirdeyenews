// Isolated Auth/PostgREST fixture for browser and route tests. Never uses a live project.
import http from 'node:http'
import { randomUUID } from 'node:crypto'

const ids = { owner: '00000000-0000-4000-8000-000000000001', admin: '00000000-0000-4000-8000-000000000002', staff: '00000000-0000-4000-8000-000000000003' }
let members
let migrationReady = true
function reset() {
  members = new Map(Object.entries(ids).map(([name, id]) => [id, { id, email: `${name}@example.com`, full_name: `${name[0].toUpperCase()}${name.slice(1)} Member`, role: name === 'owner' ? 'superadmin' : name, password: 'OriginalPassword123!', created_at: '2026-10-01T10:00:00Z' }]))
  migrationReady = true
}
reset()
const token = member => `${Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')}.${Buffer.from(JSON.stringify({ sub: member.id, email: member.email, role: 'authenticated', aud: 'authenticated', exp: Math.floor(Date.now() / 1000) + 3600, iat: Math.floor(Date.now() / 1000) })).toString('base64url')}.test-signature`
const authUser = member => ({ id: member.id, email: member.email, aud: 'authenticated', role: 'authenticated', created_at: member.created_at, app_metadata: { provider: 'email', providers: ['email'] }, user_metadata: { full_name: member.full_name }, identities: [] })
const session = member => ({ access_token: token(member), refresh_token: `refresh-${member.id}`, expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, token_type: 'bearer', user: authUser(member) })
const publicProfile = ({ password, ...member }) => member

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1:54329')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  res.setHeader('Content-Type', 'application/json')
  if (req.method === 'OPTIONS') { res.end(); return }
  let raw = ''
  for await (const chunk of req) raw += chunk
  const body = raw ? JSON.parse(raw) : {}
  const send = (data, status = 200) => { res.statusCode = status; res.end(JSON.stringify(data)) }
  const fail = (message, code = 'invalid_credentials', status = 400) => send({ message, msg: message, error_code: code, code }, status)
  let actor
  try { actor = members.get(JSON.parse(Buffer.from((req.headers.authorization || '').split('.')[1], 'base64url')).sub) } catch {}
  if (url.pathname === '/__test/reset') { reset(); return send({ ok: true }) }
  if (url.pathname === '/__test/migration') { migrationReady = body.ready; return send({ ok: true }) }
  if (url.pathname === '/__test/session') return send(session(members.get(ids[url.searchParams.get('role') || 'owner'])))
  if (url.pathname === '/auth/v1/user') {
    if (!actor) return fail('Invalid token', 'bad_jwt', 401)
    if (req.method === 'PUT') { actor.password = body.password; return send(authUser(actor)) }
    return send(authUser(actor))
  }
  if (url.pathname === '/auth/v1/token') {
    const member = [...members.values()].find(value => value.email === body.email && value.password === body.password)
    return member ? send(session(member)) : fail('Invalid login credentials')
  }
  if (url.pathname === '/auth/v1/logout') return send({})
  if (url.pathname === '/rest/v1/rpc/team_management_version') return migrationReady ? send(1) : fail('Missing function', 'PGRST202', 404)
  if (url.pathname === '/rest/v1/profiles') {
    let list = [...members.values()]
    const id = url.searchParams.get('id')?.replace('eq.', '')
    if (id) list = list.filter(value => value.id === id)
    const role = url.searchParams.get('role')
    if (role?.startsWith('in.')) list = list.filter(value => role.includes(value.role) && value.role !== 'user')
    else if (role?.startsWith('eq.')) list = list.filter(value => value.role === role.slice(3))
    const search = url.searchParams.get('or')?.match(/ilike\.%([^%]*)%/)?.[1]
    if (search) list = list.filter(value => `${value.full_name} ${value.email}`.toLowerCase().includes(search.toLowerCase()))
    const total = list.length
    const start = Number(url.searchParams.get('offset') || 0)
    list = list.slice(start, start + Number(url.searchParams.get('limit') || 1000)).map(publicProfile)
    res.setHeader('Content-Range', `${start}-${start + list.length - 1}/${total}`)
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range')
    return send(req.headers.accept?.includes('vnd.pgrst.object') ? list[0] || null : list)
  }
  if (url.pathname.startsWith('/auth/v1/admin/users')) {
    const id = url.pathname.split('/')[5]
    if (req.method === 'POST') {
      if ([...members.values()].some(value => value.email === body.email)) return fail('Email exists', 'email_exists', 422)
      const member = { id: randomUUID(), email: body.email, password: body.password, full_name: body.user_metadata.full_name, role: body.app_metadata.team_role, created_at: new Date().toISOString() }
      members.set(member.id, member)
      return send(authUser(member))
    }
    const member = members.get(id)
    if (!member) return fail('Not found', 'user_not_found', 404)
    if (req.method === 'DELETE') { members.delete(id); return send(authUser(member)) }
    if (body.email && [...members.values()].some(value => value.email === body.email && value.id !== id)) return fail('Email exists', 'email_exists', 422)
    if (body.password) member.password = body.password
    if (body.email) member.email = body.email
    if (body.user_metadata) member.full_name = body.user_metadata.full_name
    if (body.app_metadata) member.role = body.app_metadata.team_role
    return send(authUser(member))
  }
  fail(`Fixture route missing: ${req.method} ${url.pathname}`, 'not_found', 404)
}).listen(54329, '127.0.0.1', () => console.log('Isolated Supabase fixture listening on 54329'))
