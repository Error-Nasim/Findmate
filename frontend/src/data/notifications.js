// Notifications data matching Figma data

export const notifications = [
  {
    id: '1',
    icon: '✋',
    text: 'Jordan Reeve applied to your Valorant Ranked lobby',
    time: '2 min ago',
    unread: true,
    type: 'apply',
    applicantId: 'a1',
  },
  {
    id: '2',
    icon: '✋',
    text: 'Sana Okafor applied to your Valorant Ranked lobby',
    time: '9 min ago',
    unread: true,
    type: 'apply',
    applicantId: 'a2',
  },
  {
    id: '3',
    icon: '💬',
    text: 'Nadia Voss sent you a message',
    time: '20 min ago',
    unread: true,
    type: 'dm',
    dmThreadId: 'dm-nv',
  },
  {
    id: '4',
    icon: '✅',
    text: "You were accepted into Marcus's Basketball session",
    time: '1 hr ago',
    unread: false,
    type: 'accepted',
  },
  {
    id: '5',
    icon: '🔔',
    text: 'Your Valorant lobby has 3 pending applicants',
    time: '2 hr ago',
    unread: false,
    type: 'reminder',
  },
]
