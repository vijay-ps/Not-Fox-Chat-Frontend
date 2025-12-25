import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { User } from '@/types';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface MemberSidebarProps {
  members: User[];
}

const statusColors = {
  online: 'bg-success',
  idle: 'bg-warning',
  dnd: 'bg-destructive',
  offline: 'bg-muted-foreground',
};

const statusLabels = {
  online: 'Online',
  idle: 'Idle',
  dnd: 'Do Not Disturb',
  offline: 'Offline',
};

const MemberSidebar = ({ members }: MemberSidebarProps) => {
  const onlineMembers = members.filter(m => m.status !== 'offline');
  const offlineMembers = members.filter(m => m.status === 'offline');

  return (
    <div className="w-60 bg-card/30 backdrop-blur-sm border-l border-border overflow-y-auto">
      <div className="p-3">
        {/* Online Members */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-2">
            Online — {onlineMembers.length}
          </h3>
          {onlineMembers.map((member, index) => (
            <MemberItem key={member.id} member={member} index={index} />
          ))}
        </div>

        {/* Offline Members */}
        {offlineMembers.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-2">
              Offline — {offlineMembers.length}
            </h3>
            {offlineMembers.map((member, index) => (
              <MemberItem key={member.id} member={member} index={index + onlineMembers.length} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface MemberItemProps {
  member: User;
  index: number;
}

const MemberItem = ({ member, index }: MemberItemProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.button
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.03 }}
          className={cn(
            "w-full flex items-center gap-3 px-2 py-1.5 rounded-md transition-colors group",
            "hover:bg-secondary/50",
            member.status === 'offline' && "opacity-50"
          )}
        >
          {/* Avatar */}
          <div className="relative">
            <img
              src={member.avatar}
              alt={member.displayName}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className={cn(
              "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card",
              statusColors[member.status]
            )} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center gap-1">
              <span className={cn(
                "text-sm font-medium truncate",
                member.status === 'offline' ? "text-muted-foreground" : "text-foreground"
              )}>
                {member.displayName}
              </span>
              {member.badges?.map(badge => (
                <BadgeIcon key={badge} badge={badge} />
              ))}
            </div>
          </div>
        </motion.button>
      </TooltipTrigger>
      <TooltipContent side="left" className="glass p-3">
        <div className="flex items-center gap-3">
          <img
            src={member.avatar}
            alt={member.displayName}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold text-foreground">{member.displayName}</p>
            <p className="text-sm text-muted-foreground">@{member.username}</p>
            <div className="flex items-center gap-1 mt-1">
              <div className={cn("w-2 h-2 rounded-full", statusColors[member.status])} />
              <span className="text-xs text-muted-foreground">{statusLabels[member.status]}</span>
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
  );
};

const BadgeIcon = ({ badge }: { badge: string }) => {
  const badges: Record<string, { icon: string; color: string }> = {
    developer: { icon: '🛠️', color: 'text-primary' },
    verified: { icon: '✓', color: 'text-primary' },
    'early-supporter': { icon: '⭐', color: 'text-warning' },
  };

  const badgeInfo = badges[badge];
  if (!badgeInfo) return null;

  return (
    <span className={cn("text-xs", badgeInfo.color)}>
      {badgeInfo.icon}
    </span>
  );
};

export default MemberSidebar;
