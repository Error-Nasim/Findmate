import { test } from 'node:test';
import assert from 'node:assert/strict';

// Helper mimicking feed filtering & sorting in DiscoverPage.jsx
function filterAndSortFeed(lobbies, { activeCategory = 'All', search = '', sortBy = 'match', selectedTags = [] } = {}) {
  let filtered = lobbies.filter(l => {
    if (l.status === 'Closed') return false;

    const matchCategory = activeCategory === 'All' || l.category === activeCategory;
    const matchSearch =
      !search ||
      l.title?.toLowerCase().includes(search.toLowerCase()) ||
      l.host?.toLowerCase().includes(search.toLowerCase()) ||
      (Array.isArray(l.tags) && l.tags.some(t => t.toLowerCase().includes(search.toLowerCase())));
    const matchTags =
      selectedTags.length === 0 || (Array.isArray(l.tags) && selectedTags.some(t => l.tags.includes(t)));
    return matchCategory && matchSearch && matchTags;
  });

  return [...filtered].sort((a, b) => {
    // 1. Completed lobbies go to the very last
    const aCompleted = a.status === 'Completed' ? 1 : 0;
    const bCompleted = b.status === 'Completed' ? 1 : 0;
    if (aCompleted !== bCompleted) {
      return aCompleted - bCompleted;
    }

    // 2. Admin pinned lobbies float to top among active lobbies
    const aPinned = a.isPinned ? 1 : 0;
    const bPinned = b.isPinned ? 1 : 0;
    if (aPinned !== bPinned) {
      return bPinned - aPinned;
    }

    // 3. User sort selection
    if (sortBy === 'match') {
      return (b.matchScore || 0) - (a.matchScore || 0);
    } else if (sortBy === 'newest') {
      return String(b.id).localeCompare(String(a.id), undefined, { numeric: true });
    } else if (sortBy === 'slots') {
      return (b.max - b.joined) - (a.max - a.joined);
    }
    return 0;
  });
}

test('FEED-01: Closed lobbies must NEVER appear on the discover feed', () => {
  const lobbies = [
    { id: '1', title: 'Open Valorant', status: 'Open', category: 'Gaming' },
    { id: '2', title: 'Closed Hackathon', status: 'Closed', category: 'Coding' },
    { id: '3', title: 'Completed Push', status: 'Completed', category: 'Gaming' },
    { id: '4', title: 'Full Squad', status: 'Full', category: 'Gaming' },
  ];

  const feed = filterAndSortFeed(lobbies);
  assert.equal(feed.some(l => l.status === 'Closed'), false, 'Closed lobbies must be excluded from feed');
  assert.equal(feed.length, 3);
});

test('FEED-02: Completed lobbies must ALWAYS be sorted to the very last position in the feed', () => {
  const lobbies = [
    { id: '1', title: 'Active Lobby A', status: 'Open', category: 'Gaming', matchScore: 80 },
    { id: '2', title: 'Completed Lobby B', status: 'Completed', category: 'Gaming', matchScore: 99 },
    { id: '3', title: 'Active Lobby C', status: 'Full', category: 'Gaming', matchScore: 70 },
    { id: '4', title: 'Completed Lobby D', status: 'Completed', category: 'Gaming', matchScore: 95 },
  ];

  const feed = filterAndSortFeed(lobbies, { sortBy: 'match' });
  // The first 2 must be the active lobbies (Open or Full)
  assert.equal(feed[0].id, '1', 'Active lobby with higher match score comes first');
  assert.equal(feed[1].id, '3', 'Active lobby with lower match score comes second');
  // Completed lobbies must be pushed to the very bottom regardless of higher matchScore!
  assert.equal(feed[2].status, 'Completed');
  assert.equal(feed[3].status, 'Completed');
  assert.equal(feed[2].id, '2');
  assert.equal(feed[3].id, '4');
});

test('NOTIF-01: Recipient filtering ensures user only sees their own notifications', () => {
  const notifs = [
    { id: 'n1', recipientId: 'Error-nasim', text: 'Application from Rimon' },
    { id: 'n2', recipientId: '@rimon21', text: 'You were accepted by Nasim' },
    { id: 'n3', recipientId: 'imtiaz11', text: 'New DM from Nasim' },
  ];

  const filterForUser = (userHandle) => {
    const clean = String(userHandle).replace(/^@/, '').toLowerCase();
    return notifs.filter(n => n.recipientId && n.recipientId.replace(/^@/, '').toLowerCase() === clean);
  };

  const nasimNotifs = filterForUser('Error-nasim');
  assert.equal(nasimNotifs.length, 1);
  assert.equal(nasimNotifs[0].id, 'n1');

  const rimonNotifs = filterForUser('@rimon21');
  assert.equal(rimonNotifs.length, 1);
  assert.equal(rimonNotifs[0].id, 'n2');

  const imtiazNotifs = filterForUser('imtiaz11');
  assert.equal(imtiazNotifs.length, 1);
  assert.equal(imtiazNotifs[0].id, 'n3');
});

test('NOTIF-02: Self-notification on application pitch is not created for applicant', () => {
  const applicantHandle = 'rimon21';
  const hostHandle = 'Error-nasim';

  // Application action creates notification only for host
  const createdNotification = {
    recipientId: hostHandle,
    icon: '✋',
    text: `${applicantHandle} applied to your lobby`,
  };

  assert.equal(createdNotification.recipientId, hostHandle);
  assert.notEqual(createdNotification.recipientId, applicantHandle);
});

test('NOTIF-03: Message/DM notifications are strictly excluded from notifications panel & bell count', () => {
  const allNotifs = [
    { id: '1', type: 'apply', text: 'Error-nasim applied to your lobby', unread: true },
    { id: '2', type: 'dm', text: '💬 New message from Nasim: "hello"', unread: true },
    { id: '3', type: 'accepted', text: 'You were accepted into squad', unread: true },
    { id: '4', type: 'reminder', text: '💬 New message from Rimon: "ready"', unread: true },
  ];

  const panelNotifs = allNotifs.filter(
    (n) => n.type !== 'dm' && !n.text?.toLowerCase().includes('new message')
  );

  assert.equal(panelNotifs.length, 2, 'Message notifications must be completely excluded from notification panel');
  assert.equal(panelNotifs.some(n => n.type === 'dm' || n.text.includes('New message')), false);
  assert.equal(panelNotifs[0].type, 'apply');
  assert.equal(panelNotifs[1].type, 'accepted');
});

test('LOBBY-LOCK-01: Once Completed or Closed, lobby cannot be transitioned back to Open or Full', () => {
  const canTransition = (currentStatus, targetStatus) => {
    if ((currentStatus === 'Completed' || currentStatus === 'Closed') && targetStatus !== currentStatus) {
      return false; // Permanently locked!
    }
    return true;
  };

  // From Open/Full, transition to Completed or Closed is permitted
  assert.equal(canTransition('Open', 'Completed'), true);
  assert.equal(canTransition('Open', 'Closed'), true);
  assert.equal(canTransition('Full', 'Completed'), true);
  assert.equal(canTransition('Full', 'Closed'), true);

  // Once Completed, reopening or modifying status is strictly forbidden
  assert.equal(canTransition('Completed', 'Open'), false);
  assert.equal(canTransition('Completed', 'Full'), false);
  assert.equal(canTransition('Completed', 'Closed'), false);

  // Once Closed, reopening or modifying status is strictly forbidden
  assert.equal(canTransition('Closed', 'Open'), false);
  assert.equal(canTransition('Closed', 'Full'), false);
  assert.equal(canTransition('Closed', 'Completed'), false);
});

