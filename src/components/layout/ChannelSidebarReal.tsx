import { useState } from "react";
import { motion } from "framer-motion";
import {
  Hash,
  Volume2,
  Video,
  Megaphone,
  ChevronDown,
  Settings,
  Plus,
  Copy,
  Check,
  Lock,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Server, Channel } from "@/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RolesModal } from "@/components/modals/RolesModal";

interface ChannelSidebarRealProps {
  server: Server;
  channels: Channel[];
  activeChannelId: string;
  onChannelSelect: (channelId: string) => void;
  onCreateChannel: (name: string, type: Channel["type"]) => void;
  onOpenSettings: () => void;
  profile: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    status: string;
  };
  onJoinVoice: (channel: Channel) => void;
}

const channelIcons = {
  text: Hash,
  voice: Volume2,
  video: Video,
  announcement: Megaphone,
};

const ChannelSidebarReal = ({
  server,
  channels,
  activeChannelId,
  onChannelSelect,
  onCreateChannel,
  onOpenSettings,
  profile,
  onJoinVoice,
}: ChannelSidebarRealProps) => {
  const { toast } = useToast();
  const [showNewChannel, setShowNewChannel] = useState(false);
  const [showRolesModal, setShowRolesModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [copiedInvite, setCopiedInvite] = useState(false);

  const textChannels = channels.filter(
    (c) => c.type === "text" || c.type === "announcement"
  );
  const voiceChannels = channels.filter(
    (c) => c.type === "voice" || c.type === "video"
  );

  const handleCreateChannel = () => {
    if (newChannelName.trim()) {
      onCreateChannel(
        newChannelName.trim().toLowerCase().replace(/\s+/g, "-"),
        "text"
      );
      setNewChannelName("");
      setShowNewChannel(false);
    }
  };

  const copyInvite = () => {
    navigator.clipboard.writeText(server.invite_code);
    setCopiedInvite(true);
    toast({
      title: "Invite code copied!",
      description: `Share "${server.invite_code}" to invite others.`,
    });
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  return (
    <div className="flex flex-col w-60 bg-card/50 backdrop-blur-sm border-r border-border">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-12 px-4 flex items-center justify-between border-b border-border cursor-pointer hover:bg-secondary/50 transition-colors group"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h2 className="font-semibold text-foreground truncate">
                {server.name}
              </h2>
              {server.is_verified && (
                <span className="text-primary text-xs flex-shrink-0">✓</span>
              )}
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </motion.div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuLabel>Server Settings</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={copyInvite}>
            <Copy className="w-4 h-4 mr-2" />
            Invite People
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowRolesModal(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Roles & Permissions
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => onCreateChannel("new-channel", "text")}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Channel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RolesModal
        isOpen={showRolesModal}
        onClose={() => setShowRolesModal(false)}
        serverId={server.id}
      />

      <div className="p-2 border-b border-border">
        <button
          onClick={copyInvite}
          className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-secondary/50 hover:bg-secondary transition-colors group"
        >
          <span className="text-sm text-muted-foreground group-hover:text-foreground">
            Invite:{" "}
            <span className="font-mono text-foreground">
              {server.invite_code}
            </span>
          </span>
          {copiedInvite ? (
            <Check className="w-4 h-4 text-success" />
          ) : (
            <Copy className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="mb-4">
          <div className="flex items-center justify-between px-2 py-1 group">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Text Channels
            </span>
            <button
              onClick={() => setShowNewChannel(true)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Plus className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </button>
          </div>

          {showNewChannel && (
            <div className="px-2 py-1">
              <input
                type="text"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateChannel()}
                onBlur={() => {
                  if (!newChannelName.trim()) setShowNewChannel(false);
                }}
                placeholder="new-channel"
                className="w-full px-2 py-1 text-sm bg-secondary rounded border border-border focus:border-primary focus:outline-none"
                autoFocus
              />
            </div>
          )}

          {textChannels.map((channel, index) => (
            <ChannelItem
              key={channel.id}
              channel={channel}
              isActive={activeChannelId === channel.id}
              onClick={() => onChannelSelect(channel.id)}
              index={index}
            />
          ))}
        </div>

        {voiceChannels.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between px-2 py-1 group">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Voice Channels
              </span>
            </div>

            {voiceChannels.map((channel, index) => (
              <ChannelItem
                key={channel.id}
                channel={channel}
                isActive={activeChannelId === channel.id}
                onClick={() => {
                  onChannelSelect(channel.id);
                  onJoinVoice(channel);
                }}
                index={index}
              />
            ))}
          </div>
        )}
      </div>

      <div className="h-14 px-2 flex items-center gap-2 bg-notfox-darker/50 border-t border-border">
        <div className="relative">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.display_name || profile.username}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
              {(profile.display_name || profile.username)
                .charAt(0)
                .toUpperCase()}
            </div>
          )}
          <div
            className={cn(
              "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-notfox-darker",
              profile.status === "online" && "bg-success",
              profile.status === "idle" && "bg-warning",
              profile.status === "dnd" && "bg-destructive",
              profile.status === "offline" && "bg-muted-foreground"
            )}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {profile.display_name || profile.username}
          </p>
          <p className="text-xs text-muted-foreground truncate capitalize">
            {profile.status}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground"
          onClick={onOpenSettings}
        >
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

const ChannelItem = ({
  channel,
  isActive,
  onClick,
  index,
}: ChannelItemProps) => {
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
      <Icon
        className={cn(
          "w-4 h-4 flex-shrink-0",
          channel.type === "announcement" && "text-warning"
        )}
      />
      <span className="text-sm truncate flex-1">{channel.name}</span>
      {channel.isPrivate && (
        <Lock className="w-3 h-3 text-muted-foreground ml-1" />
      )}
    </motion.button>
  );
};

export default ChannelSidebarReal;
