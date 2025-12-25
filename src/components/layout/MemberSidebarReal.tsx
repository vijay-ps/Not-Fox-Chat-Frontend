import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuCheckboxItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { UserMinus, Ban, Shield } from "lucide-react";
import { useMemberManagement } from "@/hooks/useMemberManagement";

interface MemberSidebarRealProps {
  serverId: string;
  members: Array<{
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    status: "online" | "idle" | "dnd" | "offline";
    subscription_tier: "free" | "nitro" | "nitro_boost";
    bio: string | null;
    nickname?: string;
  }>;
}

const statusColors = {
  online: "bg-success",
  idle: "bg-warning",
  dnd: "bg-destructive",
  offline: "bg-muted-foreground",
};

const statusLabels = {
  online: "Online",
  idle: "Idle",
  dnd: "Do Not Disturb",
  offline: "Offline",
};

const MemberSidebarReal = ({ members, serverId }: MemberSidebarRealProps) => {
  const onlineMembers = members.filter((m) => m.status !== "offline");
  const offlineMembers = members.filter((m) => m.status === "offline");
  const { kickMember, banMember, loading } = useMemberManagement(serverId);

  return (
    <div className="w-60 bg-card/30 backdrop-blur-sm border-l border-border overflow-y-auto">
      <div className="p-3">
        {onlineMembers.length > 0 && (
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-2">
              Online — {onlineMembers.length}
            </h3>
            {onlineMembers.map((member, index) => (
              <MemberItem
                key={member.id}
                member={member}
                index={index}
                onKick={() =>
                  kickMember(
                    member.id,
                    member.nickname || member.display_name || member.username
                  )
                }
                onBan={() =>
                  banMember(
                    member.id,
                    member.nickname || member.display_name || member.username
                  )
                }
              />
            ))}
          </div>
        )}

        {offlineMembers.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-2">
              Offline — {offlineMembers.length}
            </h3>
            {offlineMembers.map((member, index) => (
              <MemberItem
                key={member.id}
                member={member}
                index={index + onlineMembers.length}
                onKick={() =>
                  kickMember(
                    member.id,
                    member.nickname || member.display_name || member.username
                  )
                }
                onBan={() =>
                  banMember(
                    member.id,
                    member.nickname || member.display_name || member.username
                  )
                }
              />
            ))}
          </div>
        )}

        {members.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No members yet
          </p>
        )}
      </div>
    </div>
  );
};

interface MemberItemProps {
  member: MemberSidebarRealProps["members"][0];
  index: number;
  onKick: () => void;
  onBan: () => void;
}

const MemberItem = ({ member, index, onKick, onBan }: MemberItemProps) => {
  const displayName = member.nickname || member.display_name || member.username;

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className={cn(
                "w-full flex items-center gap-3 px-2 py-1.5 rounded-md transition-colors group select-none", // Added select-none
                "hover:bg-secondary/50",
                member.status === "offline" && "opacity-50"
              )}
            >
              <div className="relative">
                {member.avatar_url ? (
                  <img
                    src={member.avatar_url}
                    alt={displayName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div
                  className={cn(
                    "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card",
                    statusColors[member.status]
                  )}
                />
              </div>

              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-1">
                  <span
                    className={cn(
                      "text-sm font-medium truncate",
                      member.status === "offline"
                        ? "text-muted-foreground"
                        : "text-foreground",
                      member.subscription_tier === "nitro" && "gradient-text"
                    )}
                  >
                    {displayName}
                  </span>
                  {member.subscription_tier === "nitro" && (
                    <span className="text-[10px] bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text font-bold">
                      ✦
                    </span>
                  )}
                </div>
              </div>
            </motion.button>
          </TooltipTrigger>
          <TooltipContent side="left" className="glass p-3">
            <div className="flex items-center gap-3">
              {member.avatar_url ? (
                <img
                  src={member.avatar_url}
                  alt={displayName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-semibold">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-semibold text-foreground">{displayName}</p>
                <p className="text-sm text-muted-foreground">
                  @{member.username}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      statusColors[member.status]
                    )}
                  />
                  <span className="text-xs text-muted-foreground">
                    {statusLabels[member.status]}
                  </span>
                </div>
              </div>
            </div>
            {member.bio && (
              <p className="text-sm text-muted-foreground mt-2 border-t border-border pt-2">
                {member.bio}
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem className="gap-2">
          <UserMinus className="w-4 h-4" />
          Profile
        </ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger className="gap-2">
            <Shield className="w-4 h-4" />
            Roles
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuCheckboxItem checked>
              Member (Default)
            </ContextMenuCheckboxItem>
            <ContextMenuSeparator />
            <ContextMenuItem disabled className="text-xs text-muted-foreground">
              Manage roles in Server Settings
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem
          className="text-destructive focus:text-destructive gap-2"
          onClick={onKick}
        >
          <UserMinus className="w-4 h-4" />
          Kick {displayName}
        </ContextMenuItem>
        <ContextMenuItem
          className="text-destructive focus:text-destructive gap-2"
          onClick={onBan}
        >
          <Ban className="w-4 h-4" />
          Ban {displayName}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default MemberSidebarReal;
