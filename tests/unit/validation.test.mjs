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
