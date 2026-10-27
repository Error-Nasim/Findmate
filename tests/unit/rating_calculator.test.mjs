// tests/unit/rating_calculator.test.mjs
// Unit tests for dynamic user rating calculation using EP and BVA
// Course: CSE0613316 — Software Project Design and Development (Lab)

import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateUserRating, findUserByQuery } from '../../FindMate_Frontend/src/data/users.js';

test('TC-RATE-01: calculateUserRating with empty ratings array returns default 5.0 and zero distribution', () => {
  const result = calculateUserRating([]);
  assert.strictEqual(result.average, 5.0);
  assert.strictEqual(result.count, 0);
  assert.deepStrictEqual(result.distribution, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
});

test('TC-RATE-02: calculateUserRating with null or undefined returns default 5.0', () => {
  assert.strictEqual(calculateUserRating(null).average, 5.0);
  assert.strictEqual(calculateUserRating(undefined).count, 0);
});

test('TC-RATE-03: calculateUserRating calculates exact average and distribution for single review (EP valid)', () => {
  const ratings = [{ score: 4, comment: 'Great teammate' }];
  const result = calculateUserRating(ratings);
  assert.strictEqual(result.average, 4.0);
  assert.strictEqual(result.count, 1);
  assert.strictEqual(result.distribution[4], 1);
  assert.strictEqual(result.distribution[5], 0);
});

test('TC-RATE-04: calculateUserRating accurately computes weighted average across diverse star scores (BVA 1-5)', () => {
  const ratings = [
    { score: 5 },
    { score: 5 },
    { score: 4 },
    { score: 3 },
    { score: 1 },
  ];
  // Sum = 5+5+4+3+1 = 18. Count = 5. Average = 18/5 = 3.6
  const result = calculateUserRating(ratings);
  assert.strictEqual(result.average, 3.6);
  assert.strictEqual(result.count, 5);
  assert.strictEqual(result.distribution[5], 2);
  assert.strictEqual(result.distribution[4], 1);
  assert.strictEqual(result.distribution[3], 1);
  assert.strictEqual(result.distribution[2], 0);
  assert.strictEqual(result.distribution[1], 1);
});

test('TC-RATE-05: calculateUserRating rounds average to one decimal place', () => {
  const ratings = [
    { score: 5 },
    { score: 4 },
    { score: 4 },
  ];
  // 13 / 3 = 4.33333... -> 4.3
  const result = calculateUserRating(ratings);
  assert.strictEqual(result.average, 4.3);
});

test('TC-USER-01: findUserByQuery correctly resolves user by exact handle or with @ prefix', () => {
  const mockUsers = [
    { id: 'u1', name: 'Abu Nasim', handle: 'Error-nasim' },
    { id: 'u2', name: 'Rimon Chandra', handle: 'rimon21' },
  ];

  const found1 = findUserByQuery(mockUsers, 'Error-nasim');
  assert.ok(found1);
  assert.strictEqual(found1.name, 'Abu Nasim');

  const foundWithAt = findUserByQuery(mockUsers, '@Error-nasim');
  assert.ok(foundWithAt);
  assert.strictEqual(foundWithAt.handle, 'Error-nasim');

  const foundCaseInsensitive = findUserByQuery(mockUsers, 'error-nasim');
  assert.ok(foundCaseInsensitive);

  const notFound = findUserByQuery(mockUsers, '@unknown_user_999');
  assert.strictEqual(notFound, null);
});
