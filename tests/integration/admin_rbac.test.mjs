// tests/integration/admin_rbac.test.mjs
// Role-Based Access Control (RBAC) and Security test suite (Sequence Diagram 5 & OWASP ASVS)
// Course: CSE0613316 — Software Project Design and Development (Lab)

import test from 'node:test';
import assert from 'node:assert/strict';

class MockAdminService {
  constructor() {
    this.users = [
      { id: 'u1', name: 'Abu Nasim', handle: 'Error-nasim', role: 'admin', isBanned: false },
      { id: 'u2', name: 'Jordan Reeve', handle: 'jreeve', role: 'member', isBanned: false },
      { id: 'u3', name: 'Toxic Troll', handle: 'spambot99', role: 'member', isBanned: false },
    ];
    this.lobbies = [
      { id: 'lob_1', title: 'Phishing Scam Lobby', host: 'spambot99' },
      { id: 'lob_2', title: 'Legit Valorant Lobby', host: 'Error-nasim' },
    ];
    this.reports = [
      { id: 101, targetId: 'lob_1', targetType: 'lobby', status: 'pending', reason: 'Phishing' },
      { id: 102, targetId: 'spambot99', targetType: 'user', status: 'pending', reason: 'Harassment' },
    ];
    this.auditLogs = [];
  }

  // Admin middleware check
  _requireAdmin(requester) {
    if (!requester || requester.role !== 'admin') {
      const err = new Error('403 Forbidden: Administrative privileges required');
      err.statusCode = 403;
      throw err;
    }
  }

  deleteLobby(requester, lobbyId, reason) {
    this._requireAdmin(requester);
    const initialLen = this.lobbies.length;
    this.lobbies = this.lobbies.filter((l) => l.id !== lobbyId);
    if (this.lobbies.length === initialLen) throw new Error('Lobby not found');

    this.auditLogs.push({
      action: 'DELETE_LOBBY',
      target: lobbyId,
      admin: requester.handle,
      reason,
      timestamp: new Date().toISOString(),
    });
    return { success: true };
  }

  banUser(requester, userHandle, reason) {
    this._requireAdmin(requester);
    const user = this.users.find((u) => u.handle === userHandle);
    if (!user) throw new Error('User not found');
    user.isBanned = true;

    this.auditLogs.push({
      action: 'BAN_USER',
      target: userHandle,
      admin: requester.handle,
      reason,
      timestamp: new Date().toISOString(),
    });
    return { success: true, user };
  }

  resolveReport(requester, reportId, actionTaken) {
    this._requireAdmin(requester);
    const report = this.reports.find((r) => r.id === reportId);
    if (!report) throw new Error('Report not found');
    report.status = 'resolved';
    report.actionTaken = actionTaken;
    report.resolvedBy = requester.handle;
    return report;
  }
}

// ── RBAC Security Tests ──

test('TC-SEC-01: Admin user successfully deletes infringing lobby and generates audit log', () => {
  const service = new MockAdminService();
  const adminUser = service.users.find((u) => u.handle === 'Error-nasim');

  const result = service.deleteLobby(adminUser, 'lob_1', 'Confirmed phishing links');
  assert.strictEqual(result.success, true);
  assert.strictEqual(service.lobbies.length, 1);
  assert.strictEqual(service.auditLogs.length, 1);
  assert.strictEqual(service.auditLogs[0].action, 'DELETE_LOBBY');
  assert.strictEqual(service.auditLogs[0].admin, 'Error-nasim');
});

test('TC-SEC-02: Non-admin member cannot delete lobby (403 Forbidden)', () => {
  const service = new MockAdminService();
  const regularMember = service.users.find((u) => u.handle === 'jreeve');

  assert.throws(
    () => {
      service.deleteLobby(regularMember, 'lob_1', 'Malicious attempt');
    },
    (err) => err.statusCode === 403 && err.message.includes('403 Forbidden')
  );
  // Lobby must NOT be deleted
  assert.strictEqual(service.lobbies.length, 2);
  assert.strictEqual(service.auditLogs.length, 0);
});

test('TC-SEC-03: Admin bans malicious user; user status toggles to isBanned=true', () => {
  const service = new MockAdminService();
  const adminUser = service.users.find((u) => u.handle === 'Error-nasim');

  const result = service.banUser(adminUser, 'spambot99', 'Repeated chat spam');
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.user.isBanned, true);
  assert.strictEqual(service.auditLogs.length, 1);
  assert.strictEqual(service.auditLogs[0].action, 'BAN_USER');
});

test('TC-SEC-04: Non-admin cannot ban another user (403 Forbidden)', () => {
  const service = new MockAdminService();
  const regularMember = service.users.find((u) => u.handle === 'jreeve');

  assert.throws(() => {
    service.banUser(regularMember, 'spambot99', 'Unauthorized ban');
  }, /403 Forbidden/);
});

test('TC-SEC-05: Admin resolves pending moderation report with action note', () => {
  const service = new MockAdminService();
  const adminUser = service.users.find((u) => u.handle === 'Error-nasim');

  const resolved = service.resolveReport(adminUser, 101, 'Deleted fraudulent lobby');
  assert.strictEqual(resolved.status, 'resolved');
  assert.strictEqual(resolved.actionTaken, 'Deleted fraudulent lobby');
  assert.strictEqual(resolved.resolvedBy, 'Error-nasim');
});
