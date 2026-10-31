// Central user repository for FindMate
// Real platform users: Abu Nasim (Main Admin), Rimon Chandra Bhowmik, Al Imtiaz

export const initialUsers = [
  {
    id: 'u1',
    name: 'Abu Nasim',
    handle: 'Error-nasim',
    avatar: 'AN',
    role: 'admin',
    bio: 'Founder & Lead Developer of FindMate.',
    tags: ['#gaming', '#valorant', '#coding', '#ranked', '#competitive', '#fps'],
    memberSince: 'Jan 2026',
    roomsJoined: 0,
    roomsCompleted: 0,
    reliability: 100,
    linkedAccounts: [
      { id: 'google', label: 'Google', connected: true },
      { id: 'discord', label: 'Discord', connected: true },
      { id: 'github', label: 'GitHub', connected: true },
    ],
    ratings: [],
  },
  {
    id: 'u2',
    name: 'Rimon Chandra Bhowmik',
    handle: 'rimon21',
    avatar: 'RB',
    role: 'member',
    bio: 'Software Engineer & FAANG Prep Coordinator.',
    tags: ['#coding', '#leetcode', '#algorithms', '#study'],
    memberSince: 'Feb 2026',
    roomsJoined: 0,
    roomsCompleted: 0,
    reliability: 100,
    linkedAccounts: [
      { id: 'google', label: 'Google', connected: true },
      { id: 'discord', label: 'Discord', connected: true },
      { id: 'github', label: 'GitHub', connected: true },
    ],
    ratings: [],
  },
  {
    id: 'u3',
    name: 'Al Imtiaz',
    handle: 'imtiaz11',
    avatar: 'AI',
    role: 'member',
    bio: 'Community Member & Sports / Fitness Organizer.',
    tags: ['#sports', '#basketball', '#fitness', '#nyc', '#active'],
    memberSince: 'Jan 2026',
    roomsJoined: 0,
    roomsCompleted: 0,
    reliability: 100,
    linkedAccounts: [
      { id: 'google', label: 'Google', connected: true },
      { id: 'discord', label: 'Discord', connected: false },
      { id: 'github', label: 'GitHub', connected: false },
    ],
    ratings: [],
  },
];

// Helper to compute average rating and star breakdown
export function calculateUserRating(ratings = []) {
  if (!ratings || ratings.length === 0) {
    return {
      average: 5.0,
      count: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  }

  const sum = ratings.reduce((acc, r) => acc + Number(r.score || 5), 0);
  const average = Number((sum / ratings.length).toFixed(1));

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  ratings.forEach((r) => {
    const s = Math.round(Number(r.score || 5));
    if (distribution[s] !== undefined) {
      distribution[s]++;
    }
  });

  return {
    average,
    count: ratings.length,
    distribution,
  };
}

// Find user by handle or name or id
export function findUserByQuery(users, query) {
  if (!query) return null;
  const clean = String(query).replace(/^@/, '').toLowerCase().trim();
  return (
    users.find(
      (u) =>
        u.handle.toLowerCase() === clean ||
        u.id.toLowerCase() === clean ||
        u.name.toLowerCase() === clean
    ) || null
  );
}
