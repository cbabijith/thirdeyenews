import assert from 'node:assert/strict'
import { test } from 'node:test'
import { assignableRoles, canManageMember, generatePassword, isTeamManager, validateMember, validatePassword } from '../src/features/team/policy'

const admin = { id: 'admin', role: 'admin' as const }
const superadmin = { id: 'owner', role: 'superadmin' as const }

test('only admins and superadmins manage members', () => {
  for (const role of ['staff', 'user', null, 'ADMIN']) assert.equal(isTeamManager(role), false)
  assert.equal(isTeamManager('admin'), true)
  assert.equal(isTeamManager('superadmin'), true)
})

test('admins cannot take over admins or superadmins, or assign higher roles', () => {
  assert.deepEqual(assignableRoles('admin'), ['staff', 'user'])
  assert.equal(canManageMember(admin, { id: 'staff', role: 'staff' }), true)
  assert.equal(canManageMember(admin, { id: 'other-admin', role: 'admin' }), false)
  assert.equal(canManageMember(admin, superadmin), false)
  assert.throws(() => validateMember({ full_name: 'Name', email: 'n@example.com', role: 'admin' }, 'admin'))
})

test('self deletion and all superadmin changes are blocked', () => {
  assert.equal(canManageMember(admin, admin), false)
  assert.equal(canManageMember(superadmin, superadmin), false)
  assert.equal(canManageMember(superadmin, { id: 'other-owner', role: 'superadmin' }), false)
  assert.equal(canManageMember(superadmin, admin), true)
})

test('validates and normalizes names, emails, roles and passwords', () => {
  assert.deepEqual(validateMember({ full_name: '  News Desk  ', email: ' NEW@Example.com ', role: 'staff' }, 'admin'), { full_name: 'News Desk', email: 'new@example.com', role: 'staff' })
  for (const input of [{ full_name: '', email: 'a@b.com', role: 'staff' }, { full_name: 'Name', email: 'broken', role: 'staff' }, { full_name: 'Name', email: 'a@b.com', role: 'superadmin' }]) assert.throws(() => validateMember(input, 'superadmin'))
  for (const password of ['short', 'lowercaseonly123!', 'NoSymbols123456', 'NoNumbersHere!', 'A'.repeat(73)]) assert.throws(() => validatePassword(password, password))
  assert.throws(() => validatePassword('StrongPassword123!', 'different'))
  assert.equal(validatePassword('StrongPassword123!', 'StrongPassword123!'), 'StrongPassword123!')
})

test('generated passwords meet policy and are randomized', () => {
  const passwords = new Set<string>()
  for (let index = 0; index < 100; index++) {
    const password = generatePassword()
    assert.equal(password.length, 20)
    assert.equal(validatePassword(password, password), password)
    passwords.add(password)
  }
  assert.equal(passwords.size, 100)
})
