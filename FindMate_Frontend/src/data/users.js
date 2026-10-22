// Central user repository for FindMate
// Contains profiles, stats (rooms joined, completed, running), and reviews/ratings

export const initialUsers = [
  {
    id: 'u1',
    name: 'Abu Nasim',
    handle: 'Error-nasim',
    avatar: 'AN',
    bio: 'Student developer & competitive gamer. Building stuff by day, climbing ranks by night. CSE 416 @ Stony Brook.',
    tags: ['#gaming', '#valorant', '#coding', '#ranked', '#competitive', '#fps'],
    memberSince: 'Jan 2026',
    roomsJoined: 24,
    roomsCompleted: 22,
    reliability: 96,
    linkedAccounts: [
      { id: 'google', label: 'Google', connected: true },
      { id: 'discord', label: 'Discord', connected: true },
      { id: 'github', label: 'GitHub', connected: false },
    ],
    ratings: [
      {
        id: 'r1',
        rater: 'Marcus J.',
        raterHandle: 'marcusj',
        raterAvatar: 'MJ',
        score: 5,
        comment: 'Phenomenal teammate! On-point comms and great clutch plays.',
        date: '2 days ago',
      },
      {
        id: 'r2',
        rater: 'Zara Kim',
        raterHandle: 'zarakim',
        raterAvatar: 'ZK',
        score: 5,
        comment: 'Super chill, polite, and coordinated our session very smoothly.',
        date: '5 days ago',
      },
      {
        id: 'r3',
        rater: 'Rimon Chandra Bhowmik',
        raterHandle: 'rimon21',
        raterAvatar: 'RB',
        score: 5,
        comment: 'Always shows up prepared and shares great problem-solving insights.',
        date: '1 week ago',
      },
      {
        id: 'r4',
        rater: 'Jordan Reeve',
        raterHandle: 'jreeve',
        raterAvatar: 'JR',
        score: 4,
        comment: 'Solid Jett play, positive callouts, never tilts.',
        date: '2 weeks ago',
      },
    ],
  },
  {
    id: 'u2',
    name: 'Rimon Chandra Bhowmik',
    handle: 'rimon21',
    avatar: 'RB',
    bio: 'Software engineer & Leetcode enthusiast. Loves graph algorithms, distributed systems, and FAANG prep sessions.',
    tags: ['#coding', '#leetcode', '#algorithms', '#faang', '#study'],
    memberSince: 'Feb 2026',
    roomsJoined: 31,
    roomsCompleted: 29,
    reliability: 98,
    linkedAccounts: [
      { id: 'google', label: 'Google', connected: true },
      { id: 'discord', label: 'Discord', connected: true },
      { id: 'github', label: 'GitHub', connected: true },
    ],
    ratings: [
      {
        id: 'r1',
        rater: 'Abu Nasim',
        raterHandle: 'Error-nasim',
        raterAvatar: 'AN',
        score: 5,
        comment: 'Best Leetcode partner! Explained DP concepts with crystal clarity.',
        date: '3 days ago',
      },
      {
        id: 'r2',
        rater: 'Nadia Voss',
        raterHandle: 'nadiav',
        raterAvatar: 'NV',
        score: 5,
        comment: 'Very consistent, never cancels sessions, super structured approach.',
        date: '1 week ago',
      },
      {
        id: 'r3',
        rater: 'Eli Torres',
        raterHandle: 'elitorres',
        raterAvatar: 'ET',
        score: 5,
        comment: 'Great mentor for coding interviews and system design.',
        date: '2 weeks ago',
      },
    ],
  },
  {
    id: 'u3',
    name: 'Al Imtiaz',
    handle: 'imtiaz11',
    avatar: 'AI',
    bio: 'Weekend hooper & fitness enthusiast. Organizing pickup runs and staying active in NYC parks.',
    tags: ['#sports', '#basketball', '#fitness', '#nyc', '#active'],
    memberSince: 'Jan 2026',
    roomsJoined: 19,
    roomsCompleted: 18,
    reliability: 95,
    linkedAccounts: [
      { id: 'google', label: 'Google', connected: true },
      { id: 'discord', label: 'Discord', connected: false },
      { id: 'github', label: 'GitHub', connected: false },
    ],
    ratings: [
      {
        id: 'r1',
        rater: 'Marcus J.',
        raterHandle: 'marcusj',
        raterAvatar: 'MJ',
        score: 5,
        comment: 'Runs great 5v5 games. Fair calls, good competitive energy, positive vibes.',
        date: '1 week ago',
      },
      {
        id: 'r2',
        rater: 'Abu Nasim',
        raterHandle: 'Error-nasim',
        raterAvatar: 'AN',
        score: 4,
        comment: 'Awesome energy on the court, brought extra basketballs.',
        date: '2 weeks ago',
      },
    ],
  },
  {
    id: 'u4',
    name: 'Priya Rao',
    handle: 'priyarao',
    avatar: 'PR',
    bio: 'Soulsborne veteran & co-op enthusiast. Helping people clear impossible bosses one roll at a time.',
    tags: ['#gaming', '#eldenring', '#coop', '#soulsborne', '#rpg'],
    memberSince: 'Mar 2026',
    roomsJoined: 15,
    roomsCompleted: 14,
    reliability: 93,
    linkedAccounts: [
      { id: 'google', label: 'Google', connected: true },
      { id: 'discord', label: 'Discord', connected: true },
      { id: 'github', label: 'GitHub', connected: false },
    ],
    ratings: [
      {
        id: 'r1',
        rater: 'Jordan Reeve',
        raterHandle: 'jreeve',
        raterAvatar: 'JR',
        score: 5,
        comment: 'Carried us through Malenia on NG+2! Absolute legend.',
        date: '4 days ago',
      },
      {
        id: 'r2',
        rater: 'Remi Dubois',
        raterHandle: 'remid',
        raterAvatar: 'RD',
        score: 5,
        comment: 'Patient coach, dropped rune arcs, and fantastic build tips.',
        date: '1 week ago',
      },
    ],
  },
  {
    id: 'u5',
    name: 'Eli Torres',
    handle: 'elitorres',
    avatar: 'ET',
    bio: 'CS Senior @ SBU. Fullstack TypeScript, React, Go, and database systems nerd. Always down for hackathons.',
    tags: ['#coding', '#typescript', '#study', '#cse416', '#hackathon'],
    memberSince: 'Feb 2026',
    roomsJoined: 22,
    roomsCompleted: 20,
    reliability: 94,
    linkedAccounts: [
      { id: 'google', label: 'Google', connected: true },
      { id: 'discord', label: 'Discord', connected: true },
      { id: 'github', label: 'GitHub', connected: true },
    ],
    ratings: [
      {
        id: 'r1',
        rater: 'Abu Nasim',
        raterHandle: 'Error-nasim',
        raterAvatar: 'AN',
        score: 5,
        comment: 'Great hackathon partner, super clean architecture and commits.',
        date: '1 week ago',
      },
    ],
  },
  {
    id: 'u6',
    name: 'Zara Kim',
    handle: 'zarakim',
    avatar: 'ZK',
    bio: 'Mindfulness instructor & outdoor yogi. Creating welcoming spaces for morning movement and breathwork.',
    tags: ['#fitness', '#yoga', '#wellness', '#meditation', '#morning'],
    memberSince: 'Jan 2026',
    roomsJoined: 16,
    roomsCompleted: 16,
    reliability: 99,
    linkedAccounts: [
      { id: 'google', label: 'Google', connected: true },
      { id: 'discord', label: 'Discord', connected: false },
      { id: 'github', label: 'GitHub', connected: false },
    ],
    ratings: [
      {
        id: 'r1',
        rater: 'Sana Okafor',
        raterHandle: 'sanaok',
        raterAvatar: 'SO',
        score: 5,
        comment: 'The morning yoga flow was peaceful and completely beginner friendly!',
        date: '3 days ago',
      },
      {
        id: 'r2',
        rater: 'Nadia Voss',
        raterHandle: 'nadiav',
        raterAvatar: 'NV',
        score: 5,
        comment: 'Super welcoming to beginners. Loved the outdoor vibe on campus.',
        date: '1 week ago',
      },
    ],
  },
  {
    id: 'u7',
    name: 'Jordan Reeve',
    handle: 'jreeve',
    avatar: 'JR',
    bio: 'Diamond 2 Reyna/Jett main. 800+ hours in tactical shooters. Always communicative, never tilt.',
    tags: ['#gaming', '#valorant', '#ranked', '#fps'],
    memberSince: 'Feb 2026',
    roomsJoined: 27,
    roomsCompleted: 23,
    reliability: 94,
    linkedAccounts: [
      { id: 'google', label: 'Google', connected: false },
      { id: 'discord', label: 'Discord', connected: true },
      { id: 'github', label: 'GitHub', connected: false },
    ],
    ratings: [
      {
        id: 'r1',
        rater: 'Abu Nasim',
        raterHandle: 'Error-nasim',
        raterAvatar: 'AN',
        score: 5,
        comment: 'Clutched round 24! Great comms and attitude under pressure.',
        date: '2 days ago',
      },
    ],
  },
  {
    id: 'u8',
    name: 'Sana Okafor',
    handle: 'sanaok',
    avatar: 'SO',
    bio: 'Diamond 1 controller main. Focuses on smokes, rotations, and utility play for competitive stacks.',
    tags: ['#gaming', '#fps', '#competitive', '#valorant'],
    memberSince: 'Mar 2026',
    roomsJoined: 14,
    roomsCompleted: 13,
    reliability: 87,
    linkedAccounts: [
      { id: 'google', label: 'Google', connected: true },
      { id: 'discord', label: 'Discord', connected: true },
      { id: 'github', label: 'GitHub', connected: false },
    ],
    ratings: [
      {
        id: 'r1',
        rater: 'Jordan Reeve',
        raterHandle: 'jreeve',
        raterAvatar: 'JR',
        score: 4,
        comment: 'Reliable smokes and good positioning on site takes.',
        date: '5 days ago',
      },
    ],
  },
  {
    id: 'u9',
    name: 'Remi Dubois',
    handle: 'remid',
    avatar: 'RD',
    bio: 'Plat 3 support player. Positive KD in competitive games. Sage/Skye main with good healing timing.',
    tags: ['#gaming', '#valorant', '#chill', '#support'],
    memberSince: 'Mar 2026',
    roomsJoined: 19,
    roomsCompleted: 17,
    reliability: 91,
    linkedAccounts: [
      { id: 'google', label: 'Google', connected: false },
      { id: 'discord', label: 'Discord', connected: true },
      { id: 'github', label: 'GitHub', connected: false },
    ],
    ratings: [
      {
        id: 'r1',
        rater: 'Priya Rao',
        raterHandle: 'priyarao',
        raterAvatar: 'PR',
        score: 5,
        comment: 'Super supportive teammate and very friendly in voice chat.',
        date: '1 week ago',
      },
    ],
  },
  {
    id: 'u10',
    name: 'Nadia Voss',
    handle: 'nadiav',
    avatar: 'NV',
    bio: 'Algorithms nerd & CS student. Practicing dynamic programming, graph theory, and system design.',
    tags: ['#coding', '#leetcode', '#study', '#algorithms'],
    memberSince: 'Jan 2026',
    roomsJoined: 21,
    roomsCompleted: 20,
    reliability: 96,
    linkedAccounts: [
      { id: 'google', label: 'Google', connected: true },
      { id: 'discord', label: 'Discord', connected: true },
      { id: 'github', label: 'GitHub', connected: true },
    ],
    ratings: [
      {
        id: 'r1',
        rater: 'Rimon Chandra Bhowmik',
        raterHandle: 'rimon21',
        raterAvatar: 'RB',
        score: 5,
        comment: 'Brilliant problem solver. Always arrives on time with solved solutions.',
        date: '4 days ago',
      },
    ],
  },
  {
    id: 'u11',
    name: 'Marcus J.',
    handle: 'marcusj',
    avatar: 'MJ',
    bio: 'Point guard & gym enthusiast. Organizing friendly pickup runs and weekend community leagues.',
    tags: ['#sports', '#basketball', '#pickup', '#fitness'],
    memberSince: 'Jan 2026',
    roomsJoined: 25,
    roomsCompleted: 24,
    reliability: 97,
    linkedAccounts: [
      { id: 'google', label: 'Google', connected: true },
      { id: 'discord', label: 'Discord', connected: false },
      { id: 'github', label: 'GitHub', connected: false },
    ],
    ratings: [
      {
        id: 'r1',
        rater: 'Al Imtiaz',
        raterHandle: 'imtiaz11',
        raterAvatar: 'AI',
        score: 5,
        comment: 'Great court vision, passes first, and makes games super fun for everyone.',
        date: '1 week ago',
      },
    ],
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

