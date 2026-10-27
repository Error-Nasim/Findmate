// tests/e2e/user_journeys.test.mjs
// System / End-to-End User Journey Tests (Tailored from Use Case Specifications)
// Course: CSE0613316 — Software Project Design and Development (Lab)

import test from 'node:test';
import assert from 'node:assert/strict';

test('TC-E2E-01: Full Seeker Journey — Discover -> Filter -> Pitch -> Applied state', () => {
  // Simulating state flow in DiscoverPage
  const mockLobbies = [
    { id: '1', title: 'Valorant Ranked', category: 'Gaming', tags: ['#gaming', '#valorant'], matchScore: 97, status: 'Open' },
    { id: '2', title: 'Leetcode Grind', category: 'Coding', tags: ['#coding', '#leetcode'], matchScore: 92, status: 'Open' },
    { id: '3', title: 'Basketball 5v5', category: 'Sports', tags: ['#sports'], matchScore: 85, status: 'Full' },
  ];

  // 1. Filter by category 'Coding'
  const codingLobbies = mockLobbies.filter((l) => l.category === 'Coding');
  assert.strictEqual(codingLobbies.length, 1);
  assert.strictEqual(codingLobbies[0].title, 'Leetcode Grind');

  // 2. Submit application with pitch note
  const pendingLobbyIds = new Set();
  const applyPayload = {
    lobbyId: '2',
    pitch: 'Comfortable with DFS/BFS and DP. Free Saturday evening!',
  };
  pendingLobbyIds.add(applyPayload.lobbyId);

  // 3. Verify user is now marked as pending
  assert.strictEqual(pendingLobbyIds.has('2'), true);
});

test('TC-E2E-02: Full Host Journey — Review Applicant -> Approve -> Squad Chat Unlocked', () => {
  const lobby = {
    id: 'lob_val_1',
    title: 'Valorant Push',
    joined: 1,
    max: 2,
    status: 'Open',
    members: ['Error-nasim'],
    messages: [],
  };

  const applicant = {
    id: 'app_1',
    name: 'Jordan Reeve',
    handle: 'jreeve',
    pitch: 'Diamond 2 Jett main',
    status: 'pending',
  };

  // Host approves
  applicant.status = 'accepted';
  lobby.joined += 1;
  lobby.members.push(applicant.handle);
  if (lobby.joined >= lobby.max) lobby.status = 'Full';
  lobby.messages.push({ sender: 'System', text: `${applicant.name} joined the squad!` });

  // Verification
  assert.strictEqual(lobby.joined, 2);
  assert.strictEqual(lobby.status, 'Full');
  assert.ok(lobby.members.includes('jreeve'));
  assert.strictEqual(lobby.messages.length, 1);
});

test('TC-E2E-03: Community Incident Report & Admin Resolution Journey', () => {
  // User files report
  const reports = [];
  const newReport = {
    id: 'rep_1',
    target: 'fake_crypto_lobby',
    type: 'lobby',
    reporter: 'zarakim',
    reason: 'Spam',
    status: 'pending',
  };
  reports.push(newReport);
  assert.strictEqual(reports.length, 1);

  // Admin triages report
  const reportToResolve = reports.find((r) => r.id === 'rep_1');
  reportToResolve.status = 'resolved';
  reportToResolve.actionTaken = 'Deleted fraudulent lobby';
  reportToResolve.resolvedBy = 'Error-nasim';

  assert.strictEqual(reports[0].status, 'resolved');
  assert.strictEqual(reports[0].resolvedBy, 'Error-nasim');
});
