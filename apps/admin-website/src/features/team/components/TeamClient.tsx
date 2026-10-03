'use client'

import { useEffect, useRef, useState } from 'react'
import { Dialog } from 'radix-ui'
import { AlertCircle, Check, ChevronLeft, ChevronRight, Copy, KeyRound, Loader2, Pencil, Plus, RefreshCw, Search, ShieldCheck, Trash2, Users, X } from 'lucide-react'
import { PasswordInput } from '@/features/auth/PasswordInput'
import { createClient } from '@/lib/client'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types'
import { assignableRoles, canManageMember, generatePassword, PAGE_SIZE, PASSWORD_HELP, ROLE_LABELS, validateMember, validatePassword } from '../policy'

type Actor = { id: string; email: string; role: UserRole }
type Member = Actor & { full_name: string | null; created_at: string }
type Editor = { mode: 'create' } | { mode: 'edit' | 'password' | 'delete'; member: Member } | { mode: 'own-password' }
const fieldClass = 'min-h-11 w-full min-w-0 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-base text-gray-900 outline-none focus:ring-2 focus:ring-gray-400 sm:text-sm'
const buttonClass = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 disabled:cursor-not-allowed disabled:opacity-50'
const primaryClass = cn(buttonClass, 'border-transparent bg-gray-900 text-white hover:bg-gray-800')

async function request(url: string, method: string, body: Record<string, unknown>) {
  const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || 'The request failed. Please try again.')
  return result
}

export function TeamClient({ actor }: { actor: Actor }) {
  const [members, setMembers] = useState<Member[]>([])
  const [count, setCount] = useState(0)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('team')
  const [page, setPage] = useState(1)
  const [refresh, setRefresh] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [editor, setEditor] = useState<Editor | null>(null)
  const editorTrigger = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => { setQuery(search.trim()); setPage(1) }, 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    const params = new URLSearchParams({ search: query, role, page: String(page) })
    fetch(`/api/team?${params}`, { signal: controller.signal, cache: 'no-store' })
      .then(async response => {
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Could not load members.')
        if (result.count > 0 && page > Math.ceil(result.count / PAGE_SIZE)) {
          setPage(Math.ceil(result.count / PAGE_SIZE))
          return
        }
        if (result.count === 0 && page > 1) { setPage(1); return }
        setMembers(result.data)
        setCount(result.count)
      })
      .catch(err => { if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'Could not load members.') })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [query, role, page, refresh])

  const openEditor = (next: Editor) => {
    editorTrigger.current = document.activeElement as HTMLElement | null
    setNotice(''); setEditor(next)
  }
  const finish = (message: string) => {
    setEditor(null)
    setNotice(message)
    setRefresh(value => value + 1)
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 text-gray-900">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gray-500"><Users size={16} /> People & access</div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Team</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">Manage your newsroom’s people, access and passwords.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button className={buttonClass} onClick={() => openEditor({ mode: 'own-password' })}><KeyRound size={16} /> Change my password</button>
          <button className={primaryClass} onClick={() => openEditor({ mode: 'create' })}><Plus size={18} /> Add member</button>
        </div>
      </div>

      {notice && <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><Check size={18} className="shrink-0" />{notice}</div>}
      <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
        <ShieldCheck size={19} className="mt-0.5 shrink-0 text-gray-400" />
        <p>{actor.role === 'superadmin' ? 'You can manage admins, staff and readers. Superadmin accounts are protected.' : 'You can manage staff and readers. Admin and superadmin accounts are protected.'} Use “Change my password” for your own account.</p>
      </div>

      <section aria-label="Members" className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <label htmlFor="team-search" className="mb-1.5 block text-xs font-medium text-gray-500">Search members</label>
            <div className="relative"><Search size={17} className="pointer-events-none absolute left-3 top-3.5 text-gray-400" />
              <input id="team-search" type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Name or email address" className={`${fieldClass} pl-10`} />
            </div>
          </div>
          <div className="sm:w-44"><label htmlFor="team-role" className="mb-1.5 block text-xs font-medium text-gray-500">Show</label>
            <select id="team-role" value={role} onChange={event => { setRole(event.target.value); setPage(1) }} className={fieldClass}>
              <option value="team">Team members</option><option value="all">All accounts</option><option value="admin">Admins</option><option value="staff">Staff</option><option value="user">Readers</option><option value="superadmin">Superadmins</option>
            </select>
          </div>
          <button className={buttonClass} onClick={() => setRefresh(value => value + 1)} aria-label="Refresh members" disabled={loading}><RefreshCw size={17} /></button>
        </div>

        {loading ? <div role="status" className="flex min-h-64 items-center justify-center gap-2 text-sm text-gray-500"><Loader2 size={20} className="animate-spin" /> Loading members…</div>
          : error ? <div role="alert" className="flex min-h-64 flex-col items-center justify-center gap-3 p-6 text-center"><AlertCircle size={24} className="text-red-500" /><p className="max-w-md text-sm text-red-700">{error}</p><button className={buttonClass} onClick={() => setRefresh(value => value + 1)}>Try again</button></div>
          : members.length === 0 ? <div className="flex min-h-64 flex-col items-center justify-center gap-2 p-6 text-center"><Users size={30} className="mb-2 text-gray-300" /><h2 className="font-semibold">No members found</h2><p className="text-sm text-gray-500">{query ? 'Try a different name, email or role filter.' : 'Add a member or choose another role filter.'}</p></div>
          : <>
            <div className="hidden grid-cols-[minmax(0,1fr)_110px_120px_270px] gap-4 border-b border-gray-100 bg-gray-50 px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 lg:grid"><span>Member</span><span>Role</span><span>Added</span><span className="text-right">Manage access</span></div>
            <ul className="divide-y divide-gray-100">
              {members.map(member => {
                const manageable = canManageMember(actor, member)
                const date = new Date(member.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })
                return <li key={member.id} className="grid gap-3 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_110px_120px_270px] lg:items-center lg:gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600" aria-hidden="true">{(member.full_name || member.email || '?').trim().slice(0, 2).toUpperCase()}</div>
                    <div className="min-w-0"><p className="break-words text-sm font-semibold">{member.full_name || 'Unnamed member'} {member.id === actor.id && <span className="font-normal text-gray-400">(you)</span>}</p><p className="mt-0.5 break-all text-sm text-gray-500">{member.email || 'No email address'}</p></div>
                  </div>
                  <div><span className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${member.role === 'superadmin' || member.role === 'admin' ? 'bg-violet-50 text-violet-700' : 'bg-gray-100 text-gray-600'}`}>{ROLE_LABELS[member.role] || member.role}</span></div>
                  <p className="text-xs text-gray-500"><span className="lg:hidden">Added </span>{date}</p>
                  {manageable ? <div className="flex flex-wrap gap-2 lg:justify-end">
                    <button className={buttonClass} onClick={() => openEditor({ mode: 'edit', member })} aria-label={`Edit ${member.full_name || member.email}`}><Pencil size={15} /><span>Edit</span></button>
                    <button className={buttonClass} onClick={() => openEditor({ mode: 'password', member })} aria-label={`Reset password for ${member.full_name || member.email}`}><KeyRound size={15} /><span>Password</span></button>
                    <button className={`${buttonClass} text-red-600 hover:bg-red-50`} onClick={() => openEditor({ mode: 'delete', member })} aria-label={`Delete ${member.full_name || member.email}`}><Trash2 size={16} /><span className="sm:hidden">Delete</span></button>
                  </div> : <p className="flex items-center gap-1.5 text-xs text-gray-400 lg:justify-end"><ShieldCheck size={14} />{member.id === actor.id ? 'Your account' : 'Protected account'}</p>}
                </li>
              })}
            </ul>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-3">
              <p className="text-xs text-gray-500">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, count)} of {count} members</p>
              <div className="flex items-center gap-2"><button className={buttonClass} disabled={page === 1} onClick={() => setPage(value => value - 1)} aria-label="Previous page"><ChevronLeft size={16} /></button><span className="text-xs text-gray-500">Page {page} of {Math.max(1, Math.ceil(count / PAGE_SIZE))}</span><button className={buttonClass} disabled={page * PAGE_SIZE >= count} onClick={() => setPage(value => value + 1)} aria-label="Next page"><ChevronRight size={16} /></button></div>
            </div>
          </>}
      </section>
      {editor && <MemberDialog editor={editor} actor={actor} onClose={() => setEditor(null)} onSuccess={finish} onReturnFocus={() => editorTrigger.current?.focus()} />}
    </main>
  )
}

function MemberDialog({ editor, actor, onClose, onSuccess, onReturnFocus }: { editor: Editor; actor: Actor; onClose: () => void; onSuccess: (message: string) => void; onReturnFocus: () => void }) {
  const member = 'member' in editor ? editor.member : undefined
  const [name, setName] = useState(member?.full_name || '')
  const [email, setEmail] = useState(member?.email || '')
  const [role, setRole] = useState<UserRole>(member?.role || 'staff')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [confirmEmail, setConfirmEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const isProfile = editor.mode === 'create' || editor.mode === 'edit'
  const isPassword = editor.mode === 'create' || editor.mode === 'password' || editor.mode === 'own-password'
  const title = { create: 'Add team member', edit: 'Edit member', password: 'Reset password', delete: 'Delete member', 'own-password': 'Change my password' }[editor.mode]
  const description = editor.mode === 'delete' ? `Permanently delete ${member?.full_name || member?.email} and their sign-in account. Their news articles will remain; their comments and likes will be removed. This cannot be undone.`
    : editor.mode === 'password' ? `Set a new password for ${member?.email}. Enter your own or generate one, then share it securely. No email is sent.`
    : editor.mode === 'own-password' ? 'Enter your current password and choose a new one. You will return to sign in after saving.'
    : editor.mode === 'edit' ? 'Update their name, sign-in email and role. Email changes take effect immediately.'
    : 'Create a sign-in account for a new member. Share the email and password with them securely. No invitation email is sent.'

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (isProfile) validateMember({ full_name: name, email, role }, actor.role)
      if (isPassword) validatePassword(password, confirmation)
      const body = { full_name: name, email, role, password, confirmPassword: confirmation, currentPassword, confirmEmail }
      if (editor.mode === 'create') {
        await request('/api/team', 'POST', body)
        onSuccess('Member added. They can now sign in with the email and password you set.')
      } else if (editor.mode === 'own-password') {
        await request('/api/team/password', 'POST', body)
        setPassword(''); setConfirmation(''); setCurrentPassword('')
        await createClient().auth.signOut({ scope: 'local' })
        window.location.assign('/login?password=changed')
      } else {
        await request(`/api/team/${member!.id}`, editor.mode === 'delete' ? 'DELETE' : 'PATCH', { ...body, action: editor.mode === 'edit' ? 'profile' : 'password' })
        onSuccess(editor.mode === 'delete' ? 'Member deleted. Their news articles have been kept.' : editor.mode === 'password' ? 'Password reset. Share the new password securely with the member.' : 'Member updated.')
      }
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not save changes.') }
    finally { setBusy(false) }
  }

  return <Dialog.Root open onOpenChange={open => { if (!open && !busy) onClose() }}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm" />
      <Dialog.Content onCloseAutoFocus={event => { event.preventDefault(); onReturnFocus() }} onInteractOutside={event => { if (busy) event.preventDefault() }} onEscapeKeyDown={event => { if (busy) event.preventDefault() }} className="fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-5 text-gray-900 shadow-xl focus:outline-none sm:p-6">
        <div className="flex items-start justify-between gap-3"><Dialog.Title className="pt-2 text-xl font-semibold tracking-tight">{title}</Dialog.Title><Dialog.Close className={buttonClass} aria-label="Close dialog" disabled={busy}><X size={18} /></Dialog.Close></div>
        <Dialog.Description className="mt-2 text-sm leading-6 text-gray-500">{description}</Dialog.Description>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <fieldset disabled={busy} className="min-w-0 space-y-4">
            {isProfile && <>
              <div><label htmlFor="member-name" className="mb-1.5 block text-sm font-medium">Full name</label><input id="member-name" required maxLength={100} autoComplete="off" value={name} onChange={event => setName(event.target.value)} className={fieldClass} /></div>
              <div><label htmlFor="member-email" className="mb-1.5 block text-sm font-medium">Email address</label><input id="member-email" required type="email" maxLength={254} autoComplete="off" value={email} onChange={event => setEmail(event.target.value)} className={fieldClass} /></div>
              <div><label htmlFor="member-role" className="mb-1.5 block text-sm font-medium">Role</label><select id="member-role" value={role} onChange={event => setRole(event.target.value as UserRole)} className={fieldClass}>{assignableRoles(actor.role).map(value => <option value={value} key={value}>{ROLE_LABELS[value]}</option>)}</select><p className="mt-1.5 text-xs leading-5 text-gray-500">{role === 'staff' ? 'Staff can create and edit newsroom content.' : role === 'admin' ? 'Admins can manage content, staff and reader accounts.' : 'Readers do not receive team management access.'}</p></div>
            </>}
            {editor.mode === 'own-password' && <div><label htmlFor="current-password" className="mb-1.5 block text-sm font-medium">Current password</label><PasswordInput id="current-password" value={currentPassword} onChange={setCurrentPassword} disabled={busy} /></div>}
            {isPassword && <>
              <div><label htmlFor="new-password" className="mb-1.5 block text-sm font-medium">{editor.mode === 'create' ? 'Password' : 'New password'}</label><PasswordInput id="new-password" value={password} onChange={value => { setPassword(value); setCopied(false) }} autoComplete="new-password" minLength={12} maxLength={72} describedBy="password-help" disabled={busy} /><p id="password-help" className="mt-1.5 text-xs leading-5 text-gray-500">{PASSWORD_HELP}</p></div>
              <div><label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium">Confirm password</label><PasswordInput id="confirm-password" value={confirmation} onChange={setConfirmation} autoComplete="new-password" minLength={12} maxLength={72} placeholder="Enter the password again" disabled={busy} /></div>
              <div className="flex flex-wrap gap-2"><button type="button" className={buttonClass} onClick={() => { const value = generatePassword(); setPassword(value); setConfirmation(value); setCopied(false) }}><RefreshCw size={15} /> Generate password</button><button type="button" className={buttonClass} disabled={!password} onClick={async () => { try { await navigator.clipboard.writeText(password); setCopied(true) } catch { setError('Could not copy. Use the eye button to view and copy the password.') } }}><Copy size={15} />{copied ? 'Copied' : 'Copy password'}</button></div>
            </>}
            {editor.mode === 'delete' && <div><label htmlFor="confirm-email" className="mb-2 block break-all text-sm font-medium">Type {member?.email} to confirm</label><input id="confirm-email" value={confirmEmail} onChange={event => setConfirmEmail(event.target.value)} required autoComplete="off" className={fieldClass} /></div>}
          </fieldset>
          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} disabled={busy} className={buttonClass}>Cancel</button>
            <button type="submit" disabled={busy || (editor.mode === 'delete' && confirmEmail !== member?.email)} className={editor.mode === 'delete' ? cn(primaryClass, 'bg-red-600 hover:bg-red-700') : primaryClass}>{busy && <Loader2 size={16} className="animate-spin" />}{busy ? 'Saving…' : editor.mode === 'create' ? 'Add member' : editor.mode === 'delete' ? 'Delete member' : editor.mode === 'password' ? 'Reset password' : 'Save changes'}</button>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
}
