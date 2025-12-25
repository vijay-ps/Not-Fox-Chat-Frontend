import { User, Server, Channel, Message } from '@/types';

export const currentUser: User = {
  id: 'user-1',
  username: 'isagi_yoichi',
  displayName: 'Isagi Yoichi',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
  status: 'online',
  badges: ['developer', 'early-supporter'],
  bio: 'The protagonist who sees the field differently.',
};

export const mockUsers: User[] = [
  currentUser,
  {
    id: 'user-2',
    username: 'bachira',
    displayName: 'Bachira Meguru',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=100&h=100&fit=crop',
    status: 'online',
    badges: ['developer'],
  },
  {
    id: 'user-3',
    username: 'nagi_seishiro',
    displayName: 'Nagi Seishiro',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    status: 'idle',
  },
  {
    id: 'user-4',
    username: 'rin_itoshi',
    displayName: 'Rin Itoshi',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    status: 'dnd',
    badges: ['verified'],
  },
  {
    id: 'user-5',
    username: 'chigiri',
    displayName: 'Chigiri Hyoma',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    status: 'offline',
  },
  {
    id: 'user-6',
    username: 'kunigami',
    displayName: 'Kunigami Rensuke',
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop',
    status: 'online',
  },
];

export const mockServers: Server[] = [
  {
    id: 'server-1',
    name: 'NotFox Development',
    icon: '🦊',
    ownerId: 'user-1',
    memberCount: 12847,
    isVerified: true,
    accentColor: '#0ea5e9',
    channels: [
      { id: 'ch-1', name: 'welcome', type: 'text', serverId: 'server-1' },
      { id: 'ch-2', name: 'announcements', type: 'announcement', serverId: 'server-1' },
      { id: 'ch-3', name: 'general', type: 'text', serverId: 'server-1', unreadCount: 5 },
      { id: 'ch-4', name: 'development', type: 'text', serverId: 'server-1' },
      { id: 'ch-5', name: 'voice-chat', type: 'voice', serverId: 'server-1' },
    ],
  },
  {
    id: 'server-2',
    name: 'Blue Lock FC',
    icon: '⚽',
    ownerId: 'user-2',
    memberCount: 8234,
    accentColor: '#3b82f6',
    channels: [
      { id: 'ch-6', name: 'training', type: 'text', serverId: 'server-2', unreadCount: 12 },
      { id: 'ch-7', name: 'tactics', type: 'text', serverId: 'server-2' },
      { id: 'ch-8', name: 'match-voice', type: 'voice', serverId: 'server-2' },
    ],
  },
  {
    id: 'server-3',
    name: 'Anime Devs',
    icon: '🎌',
    ownerId: 'user-3',
    memberCount: 3421,
    accentColor: '#ec4899',
    channels: [
      { id: 'ch-9', name: 'general', type: 'text', serverId: 'server-3' },
      { id: 'ch-10', name: 'showcase', type: 'text', serverId: 'server-3' },
    ],
  },
  {
    id: 'server-4',
    name: 'TypeScript Masters',
    icon: '📘',
    ownerId: 'user-4',
    memberCount: 15632,
    isVerified: true,
    accentColor: '#3178c6',
    channels: [
      { id: 'ch-11', name: 'help', type: 'text', serverId: 'server-4', unreadCount: 3 },
      { id: 'ch-12', name: 'advanced', type: 'text', serverId: 'server-4' },
    ],
  },
  {
    id: 'server-5',
    name: 'React Universe',
    icon: '⚛️',
    ownerId: 'user-5',
    memberCount: 28943,
    isVerified: true,
    accentColor: '#61dafb',
    channels: [
      { id: 'ch-13', name: 'questions', type: 'text', serverId: 'server-5' },
      { id: 'ch-14', name: 'showcase', type: 'text', serverId: 'server-5' },
    ],
  },
];

export const mockMessages: Message[] = [
  {
    id: 'msg-1',
    content: 'Welcome to NotFox Development! 🦊 The future of developer communication starts here.',
    author: mockUsers[0],
    channelId: 'ch-3',
    timestamp: new Date(Date.now() - 3600000 * 2),
    reactions: [{ emoji: '🔥', count: 24, users: [] }, { emoji: '👋', count: 18, users: [] }],
  },
  {
    id: 'msg-2',
    content: 'Just shipped the new glassmorphism UI update! Check out those smooth animations.',
    author: mockUsers[1],
    channelId: 'ch-3',
    timestamp: new Date(Date.now() - 3600000),
    reactions: [{ emoji: '✨', count: 15, users: [] }],
  },
  {
    id: 'msg-3',
    content: 'The AI integration is looking incredible. @isagi_yoichi great work on the backend!',
    author: mockUsers[3],
    channelId: 'ch-3',
    timestamp: new Date(Date.now() - 1800000),
  },
  {
    id: 'msg-4',
    content: "Who's up for a code review session in voice chat?",
    author: mockUsers[2],
    channelId: 'ch-3',
    timestamp: new Date(Date.now() - 900000),
    reactions: [{ emoji: '👍', count: 7, users: [] }],
  },
  {
    id: 'msg-5',
    content: 'Just pushed a fix for the WebSocket reconnection issue. Should be much more stable now.',
    author: mockUsers[5],
    channelId: 'ch-3',
    timestamp: new Date(Date.now() - 300000),
  },
  {
    id: 'msg-6',
    content: "The Blue Lock theme is *chef's kiss* 🤌 Perfect for our dev community.",
    author: mockUsers[4],
    channelId: 'ch-3',
    timestamp: new Date(Date.now() - 60000),
    reactions: [{ emoji: '⚽', count: 12, users: [] }, { emoji: '💙', count: 8, users: [] }],
  },
];
