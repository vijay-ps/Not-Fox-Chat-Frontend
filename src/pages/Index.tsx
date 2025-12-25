import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ServerSidebar from "@/components/layout/ServerSidebar";
import ChannelSidebarReal from "@/components/layout/ChannelSidebarReal";
import ChatAreaReal from "@/components/chat/ChatAreaReal";
import MemberSidebarReal from "@/components/layout/MemberSidebarReal";
import LandingPage from "@/components/landing/LandingPage";
import CreateServerModal from "@/components/modals/CreateServerModal";
import JoinServerModal from "@/components/modals/JoinServerModal";
import NitroModal from "@/components/modals/NitroModal";
import UserSettingsModal from "@/components/modals/UserSettingsModal";
import { useAuth } from "@/hooks/useAuth";
import { useServers, Server, Channel } from "@/hooks/useServers";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { fetchHealth } from "@/services/api";
import DMList from "@/components/layout/DMList";
import DMArea from "@/components/chat/DMArea";
import FriendList from "@/components/Home/FriendList";
import { CallModal } from "@/components/modals/CallModal";

const Index = () => {
  const navigate = useNavigate();
  const {
    user,
    profile,
    loading: authLoading,
    signOut,
    updateStatus,
  } = useAuth();
  const {
    servers,
    channels,
    loading: serversLoading,
    fetchChannels,
    createServer,
    joinServer,
    createChannel,
  } = useServers();
  const { toast } = useToast();

  const [activeServerId, setActiveServerId] = useState<string | null>(null);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"server" | "dm">("server");
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);

  const [showCreateServer, setShowCreateServer] = useState(false);
  const [showJoinServer, setShowJoinServer] = useState(false);
  const [showNitro, setShowNitro] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeVoiceChannel, setActiveVoiceChannel] = useState<Channel | null>(
    null
  );
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    if (profile) {
      updateStatus("online");

      const handleUnload = () => {
        updateStatus("offline");
      };

      window.addEventListener("beforeunload", handleUnload);
      return () => window.removeEventListener("beforeunload", handleUnload);
    }
  }, [profile]);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const data = await fetchHealth();

        toast({
          title: "Backend Connected",
          description: data.message,
        });
      } catch (error) {
        console.error("Backend connection failed:", error);
        toast({
          variant: "destructive",
          title: "Backend Error",
          description: "Could not connect to backend server",
        });
      }
    };
    checkHealth();
  }, []);

  useEffect(() => {
    if (servers.length > 0 && !activeServerId && viewMode === "server") {
      setActiveServerId(servers[0].id);
    }
  }, [servers, activeServerId, viewMode]);

  useEffect(() => {
    if (activeServerId) {
      fetchChannels(activeServerId);
    }
  }, [activeServerId]);

  useEffect(() => {
    if (channels.length > 0 && activeServerId) {
      const textChannel = channels.find((c) => c.type === "text");
      if (textChannel) {
        setActiveChannelId(textChannel.id);
      }
    }
  }, [channels, activeServerId]);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!activeServerId) return;

      const { data } = await supabase
        .from("server_members")
        .select(
          `
          id,
          nickname,
          profile:profiles(*)
        `
        )
        .eq("server_id", activeServerId);

      setMembers(
        data?.map((m) => ({ ...m.profile, nickname: m.nickname })) || []
      );
    };

    fetchMembers();
  }, [activeServerId]);

  const handleServerSelect = (serverId: string) => {
    if (serverId === "home") {
      setViewMode("dm");
      setActiveServerId(null);
      return;
    }
    setViewMode("server");
    setActiveServerId(serverId);
    setActiveChannelId(null);
  };

  const handleCreateServer = async (name: string, description?: string) => {
    const server = await createServer(name, description);
    if (server) {
      setActiveServerId(server.id);
      setShowCreateServer(false);
      toast({
        title: "Server created!",
        description: `${name} is ready to go.`,
      });
    }
  };

  const handleJoinServer = async (inviteCode: string) => {
    const server = await joinServer(inviteCode);
    if (server) {
      setActiveServerId(server.id);
      setShowJoinServer(false);
    }
  };

  // Show landing page if not logged in
  if (!authLoading && !user) {
    return (
      <LandingPage
        onEnterApp={() => navigate("/auth")}
        onOpenNitro={() => setShowNitro(true)}
      />
    );
  }

  // Loading state
  if (authLoading || serversLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary glow flex items-center justify-center text-3xl animate-pulse">
            🦊
          </div>
          <p className="text-muted-foreground">Loading NotFox...</p>
        </motion.div>
      </div>
    );
  }

  const activeServer = servers.find((s) => s.id === activeServerId);
  const activeChannel = channels.find((c) => c.id === activeChannelId);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex h-screen bg-background overflow-hidden"
      >
        {/* Server Sidebar */}
        <ServerSidebar
          servers={servers}
          activeServerId={activeServerId || ""}
          onServerSelect={handleServerSelect}
          onAddServer={() => setShowCreateServer(true)}
          onJoinServer={() => setShowJoinServer(true)}
        />

        {/* Channel Sidebar */}
        {viewMode === "server" && activeServer && (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeServerId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0 z-10" // Ensure it doesn't shrink and stays on top if needed
            >
              <ChannelSidebarReal
                server={activeServer}
                channels={channels}
                activeChannelId={activeChannelId || ""}
                onChannelSelect={setActiveChannelId}
                onCreateChannel={(name, type) =>
                  createChannel(activeServerId!, name, type)
                }
                onOpenSettings={() => setShowSettings(true)}
                profile={profile!}
                onJoinVoice={setActiveVoiceChannel}
              />
            </motion.div>
          </AnimatePresence>
        )}

        {/* DM List Sidebar */}
        {viewMode === "dm" && (
          <DMList
            activeConversationId={activeConversationId}
            onSelectConversation={setActiveConversationId}
          />
        )}

        {/* Chat Area */}
        {viewMode === "server" ? (
          activeChannel ? (
            <ChatAreaReal channel={activeChannel} />
          ) : activeServer ? (
            <div className="flex-1 flex items-center justify-center bg-background">
              <div className="text-center">
                <div className="text-6xl mb-4">🦊</div>
                <h2 className="text-2xl font-display text-foreground mb-2">
                  Select a Channel
                </h2>
                <p className="text-muted-foreground max-w-md">
                  Choose a channel from the sidebar to start chatting.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-background">
              <div className="text-center">
                <div className="text-6xl mb-4">🦊</div>
                <h2 className="text-2xl font-display text-foreground mb-2">
                  Create Your First Server
                </h2>
                <p className="text-muted-foreground max-w-md">
                  Start by creating a server or joining one.
                </p>
                <div className="flex gap-3 justify-center mt-6">
                  <button
                    onClick={() => setShowCreateServer(true)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Create Server
                  </button>
                  <button
                    onClick={() => setShowJoinServer(true)}
                    className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                  >
                    Join Server
                  </button>
                </div>
              </div>
            </div>
          )
        ) : activeConversationId === "friends" ? (
          <FriendList />
        ) : activeConversationId ? (
          <DMArea conversationId={activeConversationId} />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-background">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h2 className="text-2xl font-display text-foreground mb-2">
                Your Messages
              </h2>
              <p className="text-muted-foreground max-w-md">
                Select a conversation or start a new one.
              </p>
            </div>
          </div>
        )}

        {viewMode === "server" && activeChannel && members.length > 0 && (
          <MemberSidebarReal members={members} serverId={activeServerId!} />
        )}
      </motion.div>

      <CreateServerModal
        isOpen={showCreateServer}
        onClose={() => setShowCreateServer(false)}
        onCreate={handleCreateServer}
      />

      <JoinServerModal
        isOpen={showJoinServer}
        onClose={() => setShowJoinServer(false)}
        onJoin={handleJoinServer}
      />

      <NitroModal isOpen={showNitro} onClose={() => setShowNitro(false)} />

      <UserSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSignOut={signOut}
      />

      {activeVoiceChannel && (
        <CallModal
          isOpen={!!activeVoiceChannel}
          onClose={() => setActiveVoiceChannel(null)}
          participant={{
            username: activeVoiceChannel.name,
            display_name: activeVoiceChannel.name,
            avatar_url: null,
          }}
          conversationId={activeVoiceChannel.id}
          isVideo={activeVoiceChannel.type === "video"}
        />
      )}
    </>
  );
};

export default Index;
