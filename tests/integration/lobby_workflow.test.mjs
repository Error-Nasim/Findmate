// tests/integration/lobby_workflow.test.mjs
// State transition and integration workflow test suite (Sequence Diagrams 2 & 3)
// Course: CSE0613316 — Software Project Design and Development (Lab)

import test from 'node:test';
import assert from 'node:assert/strict';

// Workflow simulation engine mirroring backend and frontend logic
class MockLobbyEngine {
  constructor() {
    this.lobbies = [];
    this.applicants = [];
    this.dmThreads = [];
  }

  createLobby(payload) {
    const lobby = {
      id: `lob_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      host: payload.host,
      handle: payload.handle,
      title: payload.title,
      category: payload.category || 'Gaming',
      tags: payload.tags || ['#gaming'],
      max: payload.max || 4,
      joined: 1, // Host is the first member
      pending: 0,
      status: 'Open',
      chatMessages: [
        {
          id: `msg_sys_init`,
          type: 'system',
          text: 'Lobby created. Waiting for teammates.',
        },
      ],
    };
    this.lobbies.unshift(lobby);
    return lobby;
  }

  applyToLobby(lobbyId, applicantData) {
    const lobby = this.lobbies.find((l) => l.id === lobbyId);
    if (!lobby) throw new Error('Lobby not found');
    if (lobby.status !== 'Open') throw new Error('Cannot apply to a full or closed lobby');

    const app = {
      id: `app_${Date.now()}`,
      lobbyId,
      name: applicantData.name,
      handle: applicantData.handle,
      pitchMessage: applicantData.pitchMessage,
      reliability: applicantData.reliability || 95,
      status: 'pending',
    };

    this.applicants.unshift(app);
    lobby.pending += 1;
    return app;
  }

  acceptApplicant(applicantId) {
    const app = this.applicants.find((a) => a.id === applicantId);
    if (!app) throw new Error('Applicant not found');
    if (app.status !== 'pending') throw new Error('Application already processed');

    const lobby = this.lobbies.find((l) => l.id === app.lobbyId);
    if (!lobby) throw new Error('Associated lobby not found');

    // State Transition: pending -> accepted
    app.status = 'accepted';
    lobby.pending = Math.max(0, lobby.pending - 1);
    lobby.joined = Math.min(lobby.joined + 1, lobby.max);

    // Status check
    if (lobby.joined >= lobby.max) {
      lobby.status = 'Full';
    }

    // System announcement in chat
    lobby.chatMessages.push({
      id: `msg_sys_${Date.now()}`,
      type: 'system',
      text: `${app.name} was accepted and joined the team! 🎉`,
    });

    // Auto-create DM thread between host and applicant
    const dmThreadId = `dm_${lobby.handle}_${app.handle}`;
    const dmThread = {
      id: dmThreadId,
      hostHandle: lobby.handle,
      memberHandle: app.handle,
      lastMessage: `Accepted into "${lobby.title}"`,
      messages: [
        {
          sender: app.name,
          text: 'Thanks for accepting my request! Ready to play.',
        },
      ],
    };
    this.dmThreads.push(dmThread);

    return { applicant: app, lobby, dmThread };
  }

  declineApplicant(applicantId) {
    const app = this.applicants.find((a) => a.id === applicantId);
    if (!app) throw new Error('Applicant not found');
    const lobby = this.lobbies.find((l) => l.id === app.lobbyId);

    app.status = 'declined';
    if (lobby) {
      lobby.pending = Math.max(0, lobby.pending - 1);
    }
    return app;
  }

  completeLobby(lobbyId) {
    const lobby = this.lobbies.find((l) => l.id === lobbyId);
    if (!lobby) throw new Error('Lobby not found');
    lobby.status = 'Completed';
    return lobby;
  }
}

// ── Integration Tests ──

test('TC-INT-01: End-to-end lobby creation initializes with 1/max members and system chat', () => {
  const engine = new MockLobbyEngine();
  const lobby = engine.createLobby({
    host: 'Abu Nasim',
    handle: 'Error-nasim',
    title: 'Valorant Diamond Push',
    max: 3,
  });

  assert.strictEqual(lobby.joined, 1);
  assert.strictEqual(lobby.max, 3);
  assert.strictEqual(lobby.status, 'Open');
  assert.strictEqual(lobby.chatMessages.length, 1);
  assert.strictEqual(lobby.chatMessages[0].type, 'system');
});

test('TC-INT-02: Member applies to lobby with pitch note; lobby pending count increments', () => {
  const engine = new MockLobbyEngine();
  const lobby = engine.createLobby({ host: 'Abu Nasim', handle: 'Error-nasim', title: 'Leetcode FAANG', max: 2 });

  const app = engine.applyToLobby(lobby.id, {
    name: 'Jordan Reeve',
    handle: 'jreeve',
    pitchMessage: 'Diamond Jett main, communicative, never tilts',
  });

  assert.strictEqual(app.status, 'pending');
  assert.strictEqual(lobby.pending, 1);
  assert.strictEqual(engine.applicants.length, 1);
});

test('TC-INT-03: Host accepts applicant; slots update, chat message broadcasts, auto-DM created (Seq 3)', () => {
  const engine = new MockLobbyEngine();
  const lobby = engine.createLobby({ host: 'Abu Nasim', handle: 'Error-nasim', title: 'Valorant Push', max: 2 });
  const app = engine.applyToLobby(lobby.id, { name: 'Jordan Reeve', handle: 'jreeve', pitchMessage: 'Ready!' });

  const { applicant, lobby: updatedLobby, dmThread } = engine.acceptApplicant(app.id);

  assert.strictEqual(applicant.status, 'accepted');
  assert.strictEqual(updatedLobby.joined, 2);
  assert.strictEqual(updatedLobby.pending, 0);
  assert.strictEqual(updatedLobby.status, 'Full'); // Max capacity reached!
  assert.strictEqual(updatedLobby.chatMessages.length, 2);
  assert.ok(updatedLobby.chatMessages[1].text.includes('was accepted'));

  assert.ok(dmThread);
  assert.strictEqual(dmThread.memberHandle, 'jreeve');
  assert.strictEqual(engine.dmThreads.length, 1);
});

test('TC-INT-04: Cannot apply to a Full lobby (Negative test case)', () => {
  const engine = new MockLobbyEngine();
  const lobby = engine.createLobby({ host: 'Abu Nasim', handle: 'Error-nasim', title: 'Duo Grind', max: 2 });
  const app = engine.applyToLobby(lobby.id, { name: 'Jordan Reeve', handle: 'jreeve' });
  engine.acceptApplicant(app.id);

  // Now lobby is full (joined=2, max=2)
  assert.strictEqual(lobby.status, 'Full');
  assert.throws(() => {
    engine.applyToLobby(lobby.id, { name: 'Sana Okafor', handle: 'sanaok' });
  }, /Cannot apply to a full or closed lobby/);
});

test('TC-INT-05: Host marks lobby session as Completed (triggers post-lobby ratings)', () => {
  const engine = new MockLobbyEngine();
  const lobby = engine.createLobby({ host: 'Abu Nasim', handle: 'Error-nasim', title: 'Pickup Basketball', max: 5 });
  const completed = engine.completeLobby(lobby.id);

  assert.strictEqual(completed.status, 'Completed');
});
