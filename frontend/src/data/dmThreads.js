// DM threads matching Figma data

export const dmThreads = [
  {
    id: 'dm-nv',
    user: 'Nadia Voss',
    handle: 'nadiav',
    avatar: 'NV',
    lobbyContext: 'Leetcode Grind',
    unread: 1,
    lastMessage: "See you at 7 PM!",
    lastTime: '9:15 AM',
    messages: [
      { id: '1', sender: 'Nadia Voss', avatar: 'NV', text: 'Quick question — are you comfortable with graph problems?', time: '9:10 AM' },
      { id: '2', sender: 'You', avatar: 'ME', text: 'Yeah, BFS/DFS are solid for me. Struggling a bit with DP though.', time: '9:12 AM' },
      { id: '3', sender: 'Nadia Voss', avatar: 'NV', text: "Perfect — we'll hit a mix. See you at 7 PM!", time: '9:15 AM' },
    ],
  },
  {
    id: 'dm-mj',
    user: 'Marcus J.',
    handle: 'marcusj',
    avatar: 'MJ',
    lobbyContext: 'Pickup Basketball',
    unread: 0,
    lastMessage: 'Super hyped for Saturday!',
    lastTime: '11:32 AM',
    messages: [
      { id: '1', sender: 'Marcus J.', avatar: 'MJ', text: 'Welcome! You got a good handle?', time: '11:30 AM' },
      { id: '2', sender: 'You', avatar: 'ME', text: 'Yeah, I play point guard mostly. Super hyped for Saturday!', time: '11:32 AM' },
    ],
  },
]
