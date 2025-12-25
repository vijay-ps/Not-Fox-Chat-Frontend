import { motion } from 'framer-motion';
import { Hash, Volume2, Video, Megaphone, ChevronDown, Settings, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Server, Channel } from '@/types';
import { Button } from '@/components/ui/button';

interface ChannelSidebarProps {
  server: Server;
  activeChannelId: string;
  onChannelSelect: (channelId: string) => void;
}

const channelIcons = {
  text: Hash,
  voice: Volume2,
  video: Video,
  announcement: Megaphone,
};

const ChannelSidebar = ({ server, activeChannelId, onChannelSelect }: ChannelSidebarProps) => {
  return (
    <div className="flex flex-col w-60 bg-card/50 backdrop-blur-sm border-r border-border">
      {/* Server Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-12 px-4 flex items-center justify-between border-b border-border cursor-pointer hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-foreground truncate">{server.name}</h2>
          {server.isVerified && (
            <span className="text-primary text-xs">✓</span>
          )}
        </div>
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </motion.div>

      {/* Channels List */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="mb-2">
          <div className="flex items-center justify-between px-2 py-1 group">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Text Channels
            </span>
            <button className="opacity-0 group-hover:opacity-100 transition-opacity">
              <UserPlus className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </button>
          </div>

          {server.channels
            .filter(c => c.type === 'text' || c.type === 'announcement')
            .map((channel, index) => (
              <ChannelItem
                key={channel.id}
                channel={channel}
                isActive={activeChannelId === channel.id}
                onClick={() => onChannelSelect(channel.id)}
                index={index}
              />
            ))}
        </div>

        <div className="mb-2">
          <div className="flex items-center justify-between px-2 py-1 group">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Voice Channels
            </span>
            <button className="opacity-0 group-hover:opacity-100 transition-opacity">
              <UserPlus className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </button>
          </div>

          {server.channels
            .filter(c => c.type === 'voice' || c.type === 'video')
            .map((channel, index) => (
              <ChannelItem
                key={channel.id}
                channel={channel}
                isActive={activeChannelId === channel.id}
                onClick={() => onChannelSelect(channel.id)}
                index={index}
              />
            ))}
        </div>
      </div>

      {/* User Panel */}
      <div className="h-14 px-2 flex items-center gap-2 bg-notfox-darker/50 border-t border-border">
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"
            alt="User"
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-notfox-darker" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">Isagi Yoichi</p>
          <p className="text-xs text-muted-foreground truncate">Online</p>
        </div>
        <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

interface ChannelItemProps {
  channel: Channel;
  isActive: boolean;
  onClick: () => void;
  index: number;
}

const ChannelItem = ({ channel, isActive, onClick, index }: ChannelItemProps) => {
  const Icon = channelIcons[channel.type];

  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-all duration-150 group",
        isActive
          ? "bg-secondary text-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
      )}
    >
      <Icon className={cn(
        "w-4 h-4 flex-shrink-0",
        channel.type === 'announcement' && "text-warning"
      )} />
      <span className="text-sm truncate flex-1">{channel.name}</span>
      
      {channel.unreadCount && channel.unreadCount > 0 && (
        <span className="px-1.5 py-0.5 text-xs font-bold bg-destructive text-destructive-foreground rounded-full">
          {channel.unreadCount}
        </span>
      )}

      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5">
        <button className="p-1 hover:text-foreground">
          <UserPlus className="w-3.5 h-3.5" />
        </button>
        <button className="p-1 hover:text-foreground">
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.button>
  );
};

export default ChannelSidebar;
