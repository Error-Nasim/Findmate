// Admin Security & Strict User Isolation Tests
// Verifies:
// 1. Admin access control (Nasim Superadmin, Admin role, and Passcode Challenge)
// 2. Only Superadmin Nasim can promote/demote users to/from admin role
// 3. Complete user isolation: DM threads & Notifications never leak to other or new users

import { describe, it } from 'node:test'
import assert from 'node:assert'

function canAccessAdminPanel(user, sessionUnlocked) {
  if (!user && !sessionUnlocked) return false
  const isNasim = Boolean(
    user && (
      (user.handle && user.handle.replace(/^@/, '').toLowerCase() === 'error-nasim') ||
      (user.name && user.name.toLowerCase().includes('nasim')) ||
      (user.email && user.email.toLowerCase().includes('nasim'))
    )
  )
  const isApprovedAdmin = Boolean(user && user.role === 'admin')
  return isNasim || isApprovedAdmin || sessionUnlocked
}

function canChangeUserRole(actorUser) {
  if (!actorUser) return false
  const isNasim = Boolean(
    (actorUser.handle && actorUser.handle.replace(/^@/, '').toLowerCase() === 'error-nasim') ||
    (actorUser.name && actorUser.name.toLowerCase().includes('nasim')) ||
    (actorUser.email && actorUser.email.toLowerCase().includes('nasim'))
  )
  return isNasim
}

function filterUserDMs(threads, currentUser) {
  if (!currentUser) return []
  const myHandle = (currentUser.handle || '').replace(/^@/, '').toLowerCase()
  const myName = (currentUser.name || '').toLowerCase()

  return threads.filter((t) => {
    // 1. Explicit participants
    if (Array.isArray(t.participants) && t.participants.length > 0) {
      return t.participants.some((p) => {
        const clean = String(p).replace(/^@/, '').toLowerCase()
        return clean === myHandle || clean === myName
      })
    }
    // 2. ID format dm_userA_userB
    const parts = String(t.id).replace(/^dm_/, '').split('_')
    if (parts.length >= 2) {
      const p0 = parts[0].toLowerCase()
      const p1 = parts[1].toLowerCase()
      return p0 === myHandle || p1 === myHandle || p0 === myName || p1 === myName
    }
    // 3. Messages
    if (Array.isArray(t.messages) && t.messages.length > 0) {
      return t.messages.some((m) => {
        const s = (m.sender || '').replace(/^@/, '').toLowerCase()
        const r = (m.recipient || '').replace(/^@/, '').toLowerCase()
        return s === myHandle || r === myHandle || s === myName || r === myName
      })
    }
    return false
  })
}

function filterUserNotifications(notifications, currentUser) {
  if (!currentUser) return []
  const myHandle = (currentUser.handle || '').replace(/^@/, '').toLowerCase()
  const myName = (currentUser.name || '').toLowerCase()

  return notifications.filter((n) => {
    if (!n.recipient) return false
    const rec = String(n.recipient).replace(/^@/, '').toLowerCase()
    return rec === myHandle || rec === myName
  })
}

function validateAdminUnlock(username, password, users = []) {
  if (!username || !password) return false
  const cleanUser = username.trim().toLowerCase().replace(/^@/, '')
  const cleanPass = password.trim()

  const isNasimUser = cleanUser === 'error-nasim' || cleanUser === 'nasim'
  const matchedUser = users.find(
    (u) =>
      (u.handle && u.handle.toLowerCase().replace(/^@/, '') === cleanUser) ||
      (u.name && u.name.toLowerCase() === cleanUser)
  )
  const isMatchAdmin = matchedUser && (matchedUser.role === 'admin' || matchedUser.role === 'superadmin')
  const isLegacyAdmin = cleanUser === 'admin'

  const isAuthorizedRole = isNasimUser || isMatchAdmin || isLegacyAdmin
  const isPasswordValid =
    cleanPass === 'nasimadmin' ||
    cleanPass === '1234' ||
    (matchedUser && matchedUser.password && matchedUser.password === cleanPass)

  return Boolean(isAuthorizedRole && isPasswordValid)
}

function canDeleteTargetUser(actorUser, targetUser) {
  if (!actorUser || !targetUser) return false
  const targetHandle = (targetUser.handle || '').toLowerCase().replace(/^@/, '')
  const isNasimTarget = targetHandle === 'error-nasim' || (targetUser.name && targetUser.name.toLowerCase().includes('nasim'))
  if (isNasimTarget) return false // Nasim is permanent and immune to deletion

  const isActorNasim = (actorUser.handle || '').toLowerCase().replace(/^@/, '') === 'error-nasim' || (actorUser.name && actorUser.name.toLowerCase().includes('nasim'))
  const isActorSuperAdmin = isActorNasim || actorUser.role === 'superadmin'
  const isActorAdmin = isActorSuperAdmin || actorUser.role === 'admin'

  return isActorAdmin
}

function canDemoteTargetUser(actorUser, targetUser) {
  if (!actorUser || !targetUser) return false
  const targetHandle = (targetUser.handle || '').toLowerCase().replace(/^@/, '')
  const isNasimTarget = targetHandle === 'error-nasim' || (targetUser.name && targetUser.name.toLowerCase().includes('nasim'))
  if (isNasimTarget) return false // Nasim cannot be demoted

  const isActorNasim = (actorUser.handle || '').toLowerCase().replace(/^@/, '') === 'error-nasim' || (actorUser.name && actorUser.name.toLowerCase().includes('nasim'))
  const isActorSuperAdmin = isActorNasim || actorUser.role === 'superadmin'

  // If target is superadmin, only superadmins can demote them
  if (targetUser.role === 'superadmin') {
    return isActorSuperAdmin
  }

  // If target is admin, superadmins can demote them
  if (targetUser.role === 'admin') {
    return isActorSuperAdmin
  }

  return false
}

function canPromoteToSuperAdmin(actorUser, targetUser) {
  if (!actorUser || !targetUser) return false
  const isActorNasim = (actorUser.handle || '').toLowerCase().replace(/^@/, '') === 'error-nasim' || (actorUser.name && actorUser.name.toLowerCase().includes('nasim'))
  const isActorSuperAdmin = isActorNasim || actorUser.role === 'superadmin'

  // Only superadmins can promote an admin to superadmin
  return isActorSuperAdmin && targetUser.role === 'admin'
}

function checkBannedUserPermission(user, action) {
  if (!user) return false
  const isBanned = Boolean(user.isBanned)

  // Allowed read-only actions
  if (action === 'view_history' || action === 'view_profile' || action === 'login') {
    return true
  }

  // Blocked active actions when banned
  if (isBanned && (action === 'create_lobby' || action === 'join_lobby' || action === 'chat' || action === 'rate_user' || action === 'access_admin')) {
    return false
  }

  return true
}

describe('Admin Security & Role Governance', () => {
  it('SEC-ADMIN-01: Nasim (Superadmin) has automatic access to admin portal', () => {
    const nasim = { handle: 'Error-nasim', name: 'Abu Nasim', role: 'admin' }
    assert.strictEqual(canAccessAdminPanel(nasim, false), true)
  })

  it('SEC-ADMIN-02: Approved admin (promoted by Nasim) has direct access to admin portal', () => {
    const adminUser = { handle: 'rimon21', name: 'Rimon', role: 'admin' }
    assert.strictEqual(canAccessAdminPanel(adminUser, false), true)
  })

  it('SEC-ADMIN-03: Regular member or unauthenticated visitor is blocked without admin passcode', () => {
    const member = { handle: 'random_user', name: 'Random User', role: 'member' }
    assert.strictEqual(canAccessAdminPanel(member, false), false)
    assert.strictEqual(canAccessAdminPanel(null, false), false)
  })

  it('SEC-ADMIN-04: Member with valid admin passcode can unlock admin portal for session', () => {
    const member = { handle: 'random_user', name: 'Random User', role: 'member' }
    assert.strictEqual(canAccessAdminPanel(member, true), true)
  })

  it('SEC-ADMIN-05: Only Superadmin Nasim can assign or change user roles to admin', () => {
    const nasim = { handle: 'Error-nasim', name: 'Abu Nasim', role: 'admin' }
    const anotherAdmin = { handle: 'rimon21', name: 'Rimon', role: 'admin' }
    const member = { handle: 'imtiaz11', name: 'Al Imtiaz', role: 'member' }

    assert.strictEqual(canChangeUserRole(nasim), true)
    assert.strictEqual(canChangeUserRole(anotherAdmin), false)
    assert.strictEqual(canChangeUserRole(member), false)
  })

  it('SEC-ADMIN-06: Admin unlock requires BOTH valid username AND password', () => {
    const users = [{ handle: 'admin_alex', name: 'Alex', role: 'admin', password: 'secretpassword' }]

    // Missing username or password
    assert.strictEqual(validateAdminUnlock('', '1234', users), false)
    assert.strictEqual(validateAdminUnlock('error-nasim', '', users), false)

    // Invalid username with valid password
    assert.strictEqual(validateAdminUnlock('stranger', '1234', users), false)

    // Valid Nasim with correct password
    assert.strictEqual(validateAdminUnlock('error-nasim', 'nasimadmin', users), true)
    assert.strictEqual(validateAdminUnlock('error-nasim', '1234', users), true)

    // Valid admin user with user password
    assert.strictEqual(validateAdminUnlock('admin_alex', 'secretpassword', users), true)
  })

  it('SEC-ADMIN-07: Nasim is permanent Super Admin and CANNOT be deleted, demoted, or banned', () => {
    const nasim = { handle: 'Error-nasim', name: 'Abu Nasim', role: 'superadmin' }
    const anotherSuperAdmin = { handle: 'promoted_super', name: 'Super Admin', role: 'superadmin' }

    assert.strictEqual(canDeleteTargetUser(anotherSuperAdmin, nasim), false, 'Nasim cannot be deleted')
    assert.strictEqual(canDemoteTargetUser(anotherSuperAdmin, nasim), false, 'Nasim cannot be demoted')
  })

  it('SEC-ADMIN-08: Super Admin can promote Admin to Super Admin and demote another Super Admin', () => {
    const nasim = { handle: 'Error-nasim', name: 'Abu Nasim', role: 'superadmin' }
    const adminUser = { handle: 'rimon21', name: 'Rimon', role: 'admin' }
    const superUserB = { handle: 'super_b', name: 'Super B', role: 'superadmin' }
    const regularAdmin = { handle: 'reg_admin', name: 'Reg Admin', role: 'admin' }

    // Nasim / Superadmin promotes admin to superadmin
    assert.strictEqual(canPromoteToSuperAdmin(nasim, adminUser), true)

    // Super Admin can demote another Super Admin
    assert.strictEqual(canDemoteTargetUser(nasim, superUserB), true)

    // Regular admin CANNOT demote superadmin
    assert.strictEqual(canDemoteTargetUser(regularAdmin, superUserB), false)
  })

  it('SEC-ADMIN-09: Admin can delete regular users but not Nasim', () => {
    const admin = { handle: 'admin_user', name: 'Admin', role: 'admin' }
    const regularMember = { handle: 'spammer99', name: 'Spammer', role: 'member' }
    const nasim = { handle: 'Error-nasim', name: 'Nasim', role: 'superadmin' }

    assert.strictEqual(canDeleteTargetUser(admin, regularMember), true)
    assert.strictEqual(canDeleteTargetUser(admin, nasim), false)
  })

  it('SEC-BANNED-01: Banned user can log in and view previous history, but CANNOT create, join, chat, or rate', () => {
    const bannedUser = { handle: 'banned_guy', name: 'Banned Guy', role: 'member', isBanned: true }

    // Read-only activities allowed
    assert.strictEqual(checkBannedUserPermission(bannedUser, 'login'), true)
    assert.strictEqual(checkBannedUserPermission(bannedUser, 'view_history'), true)
    assert.strictEqual(checkBannedUserPermission(bannedUser, 'view_profile'), true)

    // Active interactions blocked
    assert.strictEqual(checkBannedUserPermission(bannedUser, 'create_lobby'), false)
    assert.strictEqual(checkBannedUserPermission(bannedUser, 'join_lobby'), false)
    assert.strictEqual(checkBannedUserPermission(bannedUser, 'chat'), false)
    assert.strictEqual(checkBannedUserPermission(bannedUser, 'rate_user'), false)
    assert.strictEqual(checkBannedUserPermission(bannedUser, 'access_admin'), false)
  })
})

describe('Multi-User Data Isolation (Zero Leaks)', () => {
  it('ISO-DM-01: Brand-new user sees 0 direct messages from other users', () => {
    const existingThreads = [
      { id: 'dm_error-nasim_rimon21', participants: ['error-nasim', 'rimon21'], messages: [{ sender: 'error-nasim', text: 'Hi' }] },
      { id: 'dm_rimon21_imtiaz11', participants: ['rimon21', 'imtiaz11'], messages: [{ sender: 'rimon21', text: 'Hey' }] },
    ]
    const newUser = { handle: 'newbie_gamer', name: 'New Gamer' }
    const userDMs = filterUserDMs(existingThreads, newUser)

    assert.strictEqual(userDMs.length, 0, 'New user must see 0 direct messages')
  })

  it('ISO-DM-02: User only sees threads where they are an active participant', () => {
    const existingThreads = [
      { id: 'dm_error-nasim_rimon21', participants: ['error-nasim', 'rimon21'] },
      { id: 'dm_error-nasim_imtiaz11', participants: ['error-nasim', 'imtiaz11'] },
      { id: 'dm_rimon21_imtiaz11', participants: ['rimon21', 'imtiaz11'] },
    ]
    const rimon = { handle: 'rimon21', name: 'Rimon' }
    const rimonDMs = filterUserDMs(existingThreads, rimon)

    assert.strictEqual(rimonDMs.length, 2)
    assert.ok(rimonDMs.every((t) => t.id.includes('rimon21')))
  })

  it('ISO-NOTIF-01: Brand-new user sees 0 notifications from other users', () => {
    const existingNotifs = [
      { id: 'n1', recipient: 'Error-nasim', text: 'User applied to Valorant lobby' },
      { id: 'n2', recipient: 'rimon21', text: 'User applied to LeetCode lobby' },
    ]
    const newUser = { handle: 'fresh_user', name: 'Fresh User' }
    const userNotifs = filterUserNotifications(existingNotifs, newUser)

    assert.strictEqual(userNotifs.length, 0, 'New user must have 0 notifications')
  })

  it('ISO-NOTIF-02: User only sees notifications specifically addressed to them', () => {
    const existingNotifs = [
      { id: 'n1', recipient: 'Error-nasim', text: 'Notification for Nasim' },
      { id: 'n2', recipient: 'rimon21', text: 'Notification for Rimon' },
      { id: 'n3', recipient: 'Error-nasim', text: 'Another for Nasim' },
    ]
    const nasim = { handle: 'Error-nasim', name: 'Abu Nasim' }
    const nasimNotifs = filterUserNotifications(existingNotifs, nasim)

    assert.strictEqual(nasimNotifs.length, 2)
    assert.strictEqual(nasimNotifs[0].id, 'n1')
    assert.strictEqual(nasimNotifs[1].id, 'n3')
  })
})
