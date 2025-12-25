export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  status: 'online' | 'idle' | 'dnd' | 'offline';
  badges?: string[];
  bio?: string;
}

export interface Server {
  id: string;
  name: string;
  icon_url?: string;
  banner_url?: string;
  owner_id: string;
  member_count: number;
  channels: Channel[];
  is_verified?: boolean;
  accent_color?: string;
  invite_code: string;
  boost_level: number;
}

export interface Channel {
  id: string;
  server_id: string;
  name: string;
  topic?: string | null;
  type: 'text' | 'voice' | 'video' | 'announcement';
  category_id?: string;
  unread_count?: number;
  isPrivate?: boolean;
  allowed_roles?: string[];
}

export interface Message {
  id: string;
  content: string;
  author: User;
  channelId: string;
  timestamp: Date;
  reactions?: Reaction[];
  attachments?: Attachment[];
  isEdited?: boolean;
  replyTo?: string;
}

export interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface Attachment {
  id: string;
  type: 'image' | 'video' | 'file';
  url: string;
  name: string;
  size: number;
}

export interface Category {
  id: string;
  name: string;
  serverId: string;
  channels: Channel[];
}
