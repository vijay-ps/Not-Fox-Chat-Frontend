import { motion } from "framer-motion";
import { Plus, Compass, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Server } from "@/hooks/useServers";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ServerSidebarProps {
  servers: Server[];
  activeServerId: string;
  onServerSelect: (serverId: string) => void;
  onAddServer: () => void;
  onJoinServer: () => void;
}

const ServerSidebar = ({
  servers,
  activeServerId,
  onServerSelect,
  onAddServer,
  onJoinServer,
}: ServerSidebarProps) => {
  return (
    <div className="flex flex-col items-center w-[72px] bg-notfox-darker py-3 gap-2 overflow-y-auto">
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all duration-200",
              "bg-secondary hover:bg-primary hover:rounded-xl",
              activeServerId === "home" && "bg-primary rounded-xl"
            )}
            onClick={() => onServerSelect("home")}
          >
            🦊
          </motion.button>
        </TooltipTrigger>
        <TooltipContent side="right" className="glass">
          <p className="font-medium">Direct Messages</p>
        </TooltipContent>
      </Tooltip>

      <div className="w-8 h-0.5 bg-border rounded-full my-1" />

      {servers.map((server, index) => (
        <Tooltip key={server.id}>
          <TooltipTrigger asChild>
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "relative w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all duration-200 overflow-hidden",
                "bg-secondary hover:bg-primary hover:rounded-xl group",
                activeServerId === server.id && "bg-primary rounded-xl"
              )}
              onClick={() => onServerSelect(server.id)}
            >
              <motion.div
                initial={false}
                animate={{
                  height: activeServerId === server.id ? 40 : 0,
                  opacity: activeServerId === server.id ? 1 : 0,
                }}
                className="absolute left-0 w-1 bg-foreground rounded-r-full -translate-x-4"
              />

              <div
                className={cn(
                  "absolute left-0 w-1 h-5 bg-foreground rounded-r-full -translate-x-4 opacity-0 transition-opacity",
                  "group-hover:opacity-100",
                  activeServerId === server.id &&
                    "opacity-0 group-hover:opacity-0"
                )}
              />

              {server.icon_url ? (
                <img
                  src={server.icon_url}
                  alt={server.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-foreground font-semibold text-sm">
                  {server.name.substring(0, 2).toUpperCase()}
                </span>
              )}

              {server.is_verified && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-[10px]">✓</span>
                </div>
              )}

              {server.boost_level > 0 && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                  <Crown className="w-3 h-3 text-accent-foreground" />
                </div>
              )}
            </motion.button>
          </TooltipTrigger>
          <TooltipContent side="right" className="glass">
            <p className="font-medium">{server.name}</p>
            <p className="text-xs text-muted-foreground">
              {server.member_count} members
            </p>
          </TooltipContent>
        </Tooltip>
      ))}

      <div className="w-8 h-0.5 bg-border rounded-full my-1" />

      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAddServer}
            className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 bg-secondary hover:bg-success hover:rounded-xl text-success hover:text-success-foreground"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </TooltipTrigger>
        <TooltipContent side="right" className="glass">
          <p className="font-medium">Create a Server</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onJoinServer}
            className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 bg-secondary hover:bg-primary hover:rounded-xl text-muted-foreground hover:text-primary-foreground"
          >
            <Compass className="w-5 h-5" />
          </motion.button>
        </TooltipTrigger>
        <TooltipContent side="right" className="glass">
          <p className="font-medium">Join a Server</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default ServerSidebar;
