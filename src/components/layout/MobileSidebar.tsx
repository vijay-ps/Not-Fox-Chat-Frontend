import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Menu, ChevronLeft, X as CloseIcon } from "lucide-react";
import ServerSidebar from "./ServerSidebar";
import ChannelSidebarReal from "./ChannelSidebarReal";
import DMList from "./DMList";
import { Server, Channel } from "@/hooks/useServers";

interface MobileSidebarProps {
  servers: Server[];
  activeServerId: string | null;
  onServerSelect: (serverId: string) => void;
  onAddServer: () => void;
  onJoinServer: () => void;
  viewMode: "server" | "dm";
  activeServer: Server | undefined;
  channels: Channel[];
  activeChannelId: string | null;
  onChannelSelect: (channelId: string) => void;
  createChannel: (
    serverId: string,
    name: string,
    type: "text" | "voice" | "video" | "announcement"
  ) => void;
  setShowSettings: (show: boolean) => void;
  profile: any;
  setActiveVoiceChannel: (channel: Channel | null) => void;
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
}

const MobileSidebar = (props: MobileSidebarProps) => {
  const [open, setOpen] = useState(false);

  const handleServerSelect = (id: string) => {
    props.onServerSelect(id);
    if (id !== "home") {
      setOpen(false);
    }
  };

  const handleChannelSelect = (id: string) => {
    props.onChannelSelect(id);
    setOpen(false);
  };

  const handleConversationSelect = (id: string | null) => {
    props.setActiveConversationId(id);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="lg:hidden p-2 hover:bg-secondary/50 rounded-md transition-all active:scale-95 mr-1 sm:mr-2">
          <Menu className="w-5 h-5 sm:w-6 h-6 text-foreground" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="left"
        hideClose
        className="p-0 border-none bg-notfox-darker w-[85vw] max-w-[320px] flex gap-0 h-full overflow-hidden shadow-2xl shadow-black/50"
      >
        <div className="h-full flex-shrink-0 bg-notfox-dark">
          <ServerSidebar
            servers={props.servers}
            activeServerId={props.activeServerId || ""}
            onServerSelect={handleServerSelect}
            onAddServer={props.onAddServer}
            onJoinServer={props.onJoinServer}
          />
        </div>

        <div className="flex-1 h-full flex flex-col bg-notfox-darker border-l border-white/5 relative">
          {/* Custom Close Button for mobile context */}
          <div className="absolute right-2 top-2 z-20">
            <SheetClose asChild>
              <button className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
                <CloseIcon className="w-4 h-4 text-muted-foreground" />
              </button>
            </SheetClose>
          </div>

          {props.viewMode === "server" && props.activeServer ? (
            <div className="flex-1 h-full pt-2">
              <ChannelSidebarReal
                server={props.activeServer}
                channels={props.channels}
                activeChannelId={props.activeChannelId || ""}
                onChannelSelect={handleChannelSelect}
                onCreateChannel={(name, type) =>
                  props.createChannel(props.activeServerId!, name, type)
                }
                onOpenSettings={() => {
                  props.setShowSettings(true);
                  setOpen(false);
                }}
                profile={props.profile!}
                onJoinVoice={(channel) => {
                  props.setActiveVoiceChannel(channel);
                  setOpen(false);
                }}
              />
            </div>
          ) : props.viewMode === "dm" ? (
            <div className="flex-1 h-full pt-2">
              <DMList
                activeConversationId={props.activeConversationId}
                onSelectConversation={handleConversationSelect}
              />
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
