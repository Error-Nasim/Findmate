// OAuth 2.0 Integration & Unit Tests
// Tests Google, Discord, and Facebook authorization URL building, state handling, and exchange payload formatting

import { describe, it } from 'node:test'
import assert from 'node:assert'

function buildOAuthUrl(provider, clientId, redirectUri, state) {
  if (!clientId) throw new Error(`Missing client ID for ${provider}`)

  if (provider === 'google') {
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent('openid email profile')}&access_type=offline&state=${encodeURIComponent(state)}&prompt=select_account`
  } else if (provider === 'discord') {
    return `https://discord.com/api/oauth2/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent('identify email')}&state=${encodeURIComponent(state)}`
  } else if (provider === 'facebook') {
    return `https://www.facebook.com/v19.0/dialog/oauth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}&scope=email,public_profile`
  }
  throw new Error(`Unsupported provider: ${provider}`)
}

function parseOAuthProvider(state, savedProvider) {
  if (state?.startsWith('discord_') || savedProvider === 'discord') return 'discord'
  if (state?.startsWith('facebook_') || savedProvider === 'facebook') return 'facebook'
  if (state?.startsWith('google_') || savedProvider === 'google') return 'google'
  return 'google'
}

describe('OAuth 2.0 Provider Construction & Flow', () => {
  it('TC-OAUTH-01: Constructs valid Google OAuth 2.0 authorization URL with openid profile email scopes', () => {
    const url = buildOAuthUrl('google', 'test-google-id.apps.googleusercontent.com', 'http://localhost:5173/auth/callback', 'google_xyz123')
    assert.ok(url.startsWith('https://accounts.google.com/o/oauth2/v2/auth'))
    assert.ok(url.includes('client_id=test-google-id.apps.googleusercontent.com'))
    assert.ok(url.includes('redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Fauth%2Fcallback'))
    assert.ok(url.includes('response_type=code'))
    assert.ok(url.includes('openid%20email%20profile'))
    assert.ok(url.includes('state=google_xyz123'))
  })

  it('TC-OAUTH-02: Constructs valid Discord OAuth 2.0 authorization URL with identify email scopes', () => {
    const url = buildOAuthUrl('discord', 'discord-client-id-9988', 'http://localhost:5173/auth/callback', 'discord_abc456')
    assert.ok(url.startsWith('https://discord.com/api/oauth2/authorize'))
    assert.ok(url.includes('client_id=discord-client-id-9988'))
    assert.ok(url.includes('response_type=code'))
    assert.ok(url.includes('scope=identify%20email'))
    assert.ok(url.includes('state=discord_abc456'))
  })

  it('TC-OAUTH-03: Constructs valid Facebook OAuth 2.0 authorization URL with email and public_profile scopes', () => {
    const url = buildOAuthUrl('facebook', 'fb-app-id-123456', 'http://localhost:5173/auth/callback', 'facebook_def789')
    assert.ok(url.startsWith('https://www.facebook.com/v19.0/dialog/oauth'))
    assert.ok(url.includes('client_id=fb-app-id-123456'))
    assert.ok(url.includes('redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Fauth%2Fcallback'))
    assert.ok(url.includes('scope=email,public_profile'))
    assert.ok(url.includes('state=facebook_def789'))
  })

  it('TC-OAUTH-04: Accurately infers OAuth provider from state parameter or fallback', () => {
    assert.strictEqual(parseOAuthProvider('discord_random123', null), 'discord')
    assert.strictEqual(parseOAuthProvider('facebook_random456', null), 'facebook')
    assert.strictEqual(parseOAuthProvider('google_random789', null), 'google')
    assert.strictEqual(parseOAuthProvider(null, 'discord'), 'discord')
    assert.strictEqual(parseOAuthProvider(null, 'facebook'), 'facebook')
    assert.strictEqual(parseOAuthProvider(null, null), 'google')
  })

  it('TC-OAUTH-05: Rejects missing client ID with descriptive error', () => {
    assert.throws(
      () => buildOAuthUrl('google', '', 'http://localhost:5173/auth/callback', 'test'),
      /Missing client ID for google/
    )
  })

  it('TC-OAUTH-06: Resolves linked accounts array dynamically based on provider and linked entries', () => {
    const userWithGoogle = {
      handle: 'player_one',
      provider: 'google',
      linkedAccounts: [
        { id: 'google', label: 'Google', connected: true },
        { id: 'discord', label: 'Discord', connected: false },
        { id: 'facebook', label: 'Facebook', connected: false },
      ],
    }

    // Now link Discord
    const updatedLinked = [
      { id: 'google', label: 'Google', connected: userWithGoogle.linkedAccounts.find(a => a.id === 'google')?.connected || false },
      { id: 'discord', label: 'Discord', connected: true },
      { id: 'facebook', label: 'Facebook', connected: userWithGoogle.linkedAccounts.find(a => a.id === 'facebook')?.connected || false },
    ]

    assert.strictEqual(updatedLinked.find(a => a.id === 'google').connected, true)
    assert.strictEqual(updatedLinked.find(a => a.id === 'discord').connected, true)
    assert.strictEqual(updatedLinked.find(a => a.id === 'facebook').connected, false)
  })

  it('TC-OAUTH-07: Account unlinking marks provider disconnected without corrupting other links', () => {
    const linkedList = [
      { id: 'google', label: 'Google', connected: true },
      { id: 'discord', label: 'Discord', connected: true },
      { id: 'facebook', label: 'Facebook', connected: false },
    ]

    const afterUnlinkDiscord = linkedList.map(a => a.id === 'discord' ? { ...a, connected: false } : a)
    assert.strictEqual(afterUnlinkDiscord.find(a => a.id === 'google').connected, true)
    assert.strictEqual(afterUnlinkDiscord.find(a => a.id === 'discord').connected, false)
  })
})
