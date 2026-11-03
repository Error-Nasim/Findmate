// tests/unit/validation.test.mjs
// Input validation test suite applying Equivalence Partitioning (EP) and Boundary Value Analysis (BVA)
// Course: CSE0613316 — Software Project Design and Development (Lab)

import test from 'node:test';
import assert from 'node:assert/strict';

// Business logic validation helper mimicking frontend/backend validation rules
function validateLobbyCapacity(max) {
  const num = Number(max);
  if (isNaN(num)) return { valid: false, error: 'Capacity must be a number' };
  if (num < 2) return { valid: false, error: 'Minimum lobby capacity is 2' };
  if (num > 10) return { valid: false, error: 'Maximum lobby capacity is 10' };
  return { valid: true, value: num };
}

function validatePitchNote(note) {
  if (!note || typeof note !== 'string') return { valid: false, error: 'Pitch note is required' };
  const trimmed = note.trim();
  if (trimmed.length < 5) return { valid: false, error: 'Pitch note must be at least 5 characters' };
  if (trimmed.length > 300) return { valid: false, error: 'Pitch note must not exceed 300 characters' };
  return { valid: true, value: trimmed };
}

function formatTaxonomyTag(tag) {
  if (!tag || typeof tag !== 'string') return null;
  const clean = tag.trim().replace(/^#+/, '').toLowerCase();
  if (!clean || clean.length < 2) return null;
  return `#${clean}`;
}

// ── BVA & EP Test Cases for Lobby Capacity [2, 10] ──
test('TC-VAL-01: BVA on min capacity boundary (1=invalid, 2=valid, 3=valid)', () => {
  assert.strictEqual(validateLobbyCapacity(1).valid, false, '1 should be rejected (below min)');
  assert.strictEqual(validateLobbyCapacity(2).valid, true, '2 should be accepted (min boundary)');
  assert.strictEqual(validateLobbyCapacity(3).valid, true, '3 should be accepted (just above min)');
});

test('TC-VAL-02: BVA on max capacity boundary (9=valid, 10=valid, 11=invalid)', () => {
  assert.strictEqual(validateLobbyCapacity(9).valid, true, '9 should be accepted (just below max)');
  assert.strictEqual(validateLobbyCapacity(10).valid, true, '10 should be accepted (max boundary)');
  assert.strictEqual(validateLobbyCapacity(11).valid, false, '11 should be rejected (above max)');
});

test('TC-VAL-03: EP invalid non-numeric capacity partition', () => {
  assert.strictEqual(validateLobbyCapacity('invalid_number').valid, false);
  assert.strictEqual(validateLobbyCapacity(null).valid, false);
});

// ── BVA & EP Test Cases for Pitch Note Length [5, 300] ──
test('TC-PITCH-01: BVA on min pitch note length (4=invalid, 5=valid)', () => {
  assert.strictEqual(validatePitchNote('Hi').valid, false);
  assert.strictEqual(validatePitchNote('1234').valid, false);
  assert.strictEqual(validatePitchNote('12345').valid, true);
});

test('TC-PITCH-02: BVA on max pitch note length (300=valid, 301=invalid)', () => {
  const str300 = 'a'.repeat(300);
  const str301 = 'a'.repeat(301);
  assert.strictEqual(validatePitchNote(str300).valid, true);
  assert.strictEqual(validatePitchNote(str301).valid, false);
});

test('TC-PITCH-03: EP whitespace-only pitch note is rejected', () => {
  assert.strictEqual(validatePitchNote('      ').valid, false);
});

// ── Tag Taxonomy Formatting & Duplicate Prevention ──
test('TC-TAG-01: formatTaxonomyTag formats bare string into lowercased hashtag', () => {
  assert.strictEqual(formatTaxonomyTag('Valorant'), '#valorant');
  assert.strictEqual(formatTaxonomyTag('#Coding'), '#coding');
  assert.strictEqual(formatTaxonomyTag('  #LeetCode  '), '#leetcode');
});

test('TC-TAG-02: formatTaxonomyTag rejects empty or single-character tags', () => {
  assert.strictEqual(formatTaxonomyTag(''), null);
  assert.strictEqual(formatTaxonomyTag('#'), null);
  assert.strictEqual(formatTaxonomyTag('a'), null);
});

// ── Registration Email Structure Validation ──
function validateEmailStructure(email) {
  if (!email || typeof email !== 'string') return { valid: false, error: 'Email is required' };
  const trimmed = email.trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Invalid email address structure' };
  }
  return { valid: true, value: trimmed };
}

test('TC-EMAIL-01: Valid RFC email structure conforms to format', () => {
  assert.strictEqual(validateEmailStructure('nasim@findmate.local').valid, true);
  assert.strictEqual(validateEmailStructure('user.name+test@example.com').valid, true);
  assert.strictEqual(validateEmailStructure('student@uits.edu.bd').valid, true);
});

test('TC-EMAIL-02: Invalid email structures are strictly rejected', () => {
  assert.strictEqual(validateEmailStructure('plainaddress').valid, false);
  assert.strictEqual(validateEmailStructure('missingatsign.com').valid, false);
  assert.strictEqual(validateEmailStructure('@missingusername.com').valid, false);
  assert.strictEqual(validateEmailStructure('username@.com').valid, false);
  assert.strictEqual(validateEmailStructure('username@domain').valid, false);
});

// ── Sign Up & Profile Password / Confirm Password Validation ──
function validatePasswordPair(password, confirmPassword, isOptional = false) {
  if (isOptional && !password && !confirmPassword) {
    return { valid: true, updated: false };
  }
  if (!password) return { valid: false, error: 'Password is required' };
  if (password.length < 4) return { valid: false, error: 'Password must be at least 4 characters long' };
  if (password !== confirmPassword) return { valid: false, error: 'Passwords do not match' };
  return { valid: true, updated: true, value: password };
}

test('TC-PWD-01: Sign up password matching passes when identical', () => {
  const res = validatePasswordPair('Secret123', 'Secret123');
  assert.strictEqual(res.valid, true);
  assert.strictEqual(res.value, 'Secret123');
});

test('TC-PWD-02: Sign up password mismatch is rejected', () => {
  const res = validatePasswordPair('Secret123', 'Secret456');
  assert.strictEqual(res.valid, false);
  assert.strictEqual(res.error, 'Passwords do not match');
});

test('TC-PWD-03: Password below 4 characters is rejected', () => {
  const res = validatePasswordPair('123', '123');
  assert.strictEqual(res.valid, false);
  assert.strictEqual(res.error, 'Password must be at least 4 characters long');
});

// ── Username Uniqueness & Availability ──
function checkUsernameAvailability(requestedHandle, currentHandle, existingUsers = []) {
  const clean = String(requestedHandle || '').trim().replace(/^@/, '').toLowerCase();
  const current = String(currentHandle || '').trim().replace(/^@/, '').toLowerCase();
  if (!clean) return { available: false, error: 'Username cannot be empty' };
  if (clean.length < 3) return { available: false, error: 'Username must be at least 3 characters' };
  if (clean === current) return { available: true, isCurrent: true };

  const taken = existingUsers.some(
    (u) =>
      u.handle.replace(/^@/, '').toLowerCase() === clean &&
      u.handle.replace(/^@/, '').toLowerCase() !== current
  );
  if (taken) {
    return { available: false, error: 'Username is already taken' };
  }
  return { available: true, isCurrent: false };
}

test('TC-USER-AVAIL-01: Existing user handle is identified as taken', () => {
  const existingUsers = [
    { id: 'u1', handle: 'Error-nasim' },
    { id: 'u2', handle: 'rimon21' },
    { id: 'u3', handle: 'imtiaz11' },
  ];
  const res = checkUsernameAvailability('rimon21', 'Error-nasim', existingUsers);
  assert.strictEqual(res.available, false);
  assert.strictEqual(res.error, 'Username is already taken');
});

test('TC-USER-AVAIL-02: Case-insensitive handle match correctly detected as taken', () => {
  const existingUsers = [{ id: 'u1', handle: 'Error-nasim' }];
  const res = checkUsernameAvailability('error-NASIM', 'rimon21', existingUsers);
  assert.strictEqual(res.available, false);
});

test('TC-USER-AVAIL-03: Keeping own current username is valid', () => {
  const existingUsers = [{ id: 'u1', handle: 'Error-nasim' }];
  const res = checkUsernameAvailability('Error-nasim', 'Error-nasim', existingUsers);
  assert.strictEqual(res.available, true);
  assert.strictEqual(res.isCurrent, true);
});

test('TC-USER-AVAIL-04: Fresh unique username is available', () => {
  const existingUsers = [{ id: 'u1', handle: 'Error-nasim' }];
  const res = checkUsernameAvailability('new_champion_2026', 'Error-nasim', existingUsers);
  assert.strictEqual(res.available, true);
});

// ── Profile Password Update (Two Password Fields) ──
test('TC-PROF-PWD-01: Leaving both password fields blank preserves existing password', () => {
  const res = validatePasswordPair('', '', true);
  assert.strictEqual(res.valid, true);
  assert.strictEqual(res.updated, false);
});

test('TC-PROF-PWD-02: Providing matching new passwords enables password update', () => {
  const res = validatePasswordPair('NewSecurePass2026', 'NewSecurePass2026', true);
  assert.strictEqual(res.valid, true);
  assert.strictEqual(res.updated, true);
  assert.strictEqual(res.value, 'NewSecurePass2026');
});

test('TC-PROF-PWD-03: Mismatched new passwords in edit profile are blocked', () => {
  const res = validatePasswordPair('NewPass1', 'NewPass2', true);
  assert.strictEqual(res.valid, false);
  assert.strictEqual(res.error, 'Passwords do not match');
});
