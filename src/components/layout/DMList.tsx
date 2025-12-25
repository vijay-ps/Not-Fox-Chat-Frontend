import { useState } from "react";
import { Plus, Search, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { useDM } from "@/hooks/useDM";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth"; // Assuming we might need this or it's covered in useDM
import { supabase } from "@/integrations/supabase/client";

interface DMListProps {
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
}

const DMList = ({
  activeConversationId,
  onSelectConversation,
}: DMListProps) => {
  const { conversations, loading, startConversation, currentUser } =
    useDM(null);
  const { toast } = useToast();
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Search for users to start DM with
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .ilike("username", `%${query}%`)
        .limit(5);

      if (error) throw error;

      // Filter out self
      const filtered = data?.filter((u) => u.id !== currentUser?.id) || [];
      setSearchResults(filtered);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const handleStartDM = async (userId: string) => {
    const conversationId = await startConversation(userId);
    if (conversationId) {
      onSelectConversation(conversationId);
      setIsSearching(false);
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  if (loading) {
    return (
      <div className="w-60 bg-notfox-dark h-full border-r border-border p-4">
        <div className="h-8 w-3/4 bg-border/20 animate-pulse rounded mb-4" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-10 w-full bg-border/10 animate-pulse rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-60 bg-notfox-dark h-full border-r border-border flex flex-col">
      <div className="p-4 border-b border-border shadow-sm">
        <button
          onClick={() => setIsSearching(!isSearching)}
          className="w-full bg-notfox-darker text-left px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-notfox-light transition-colors flex items-center justify-between group"
        >
          <span>Find or start a conversation</span>
          {isSearching ? (
            <Plus className="w-4 h-4 rotate-45 transition-transform" />
          ) : (
            <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </button>
      </div>

      {isSearching && (
        <div className="p-2 border-b border-border bg-notfox-darker/50">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Where would you like to go?"
              className="w-full bg-notfox-dark border-none rounded-md pl-8 py-2 text-sm focus:ring-1 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              autoFocus
            />
          </div>
          {searchResults.length > 0 && (
            <div className="mt-2 space-y-1">
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleStartDM(user.id)}
                  className="w-full flex items-center gap-2 p-2 hover:bg-primary/20 rounded-md transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-secondary overflow-hidden">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.username} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs">
                        {(user.display_name || user.username)[0]}
                      </div>
                    )}
                  </div>
                  <span className="text-sm truncate">
                    {user.display_name || user.username}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {/* Friends Button */}
        <button
          onClick={() => onSelectConversation("friends")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all group ${
            activeConversationId === "friends"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-notfox-light hover:text-foreground"
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <div className="w-5 h-5">👋</div>
          </div>
          <span className="font-medium">Friends</span>
        </button>

        <div className="px-2 pt-2 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Direct Messages
        </div>

        {conversations.length === 0 && !isSearching && (
          <div className="text-center py-8 text-muted-foreground text-sm px-4">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            No conversations yet
          </div>
        )}

        {conversations.map((conv) => {
          // Find other participant
          const otherParticipant = conv.participants.find(
            (p) => p.profile_id !== currentUser?.id
          )?.profile;
          const displayName =
            otherParticipant?.display_name ||
            otherParticipant?.username ||
            "Unknown User";
          const avatar = otherParticipant?.avatar_url;

          return (
            <button
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all group ${
                activeConversationId === conv.id
                  ? "bg-primary/10 text-primary-foreground"
                  : "text-muted-foreground hover:bg-notfox-light hover:text-foreground"
              }`}
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-secondary overflow-hidden flex items-center justify-center text-foreground font-medium">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{displayName[0].toUpperCase()}</span>
                  )}
                </div>
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-notfox-dark rounded-full ${
                    otherParticipant?.status === "online"
                      ? "bg-success"
                      : "bg-muted-foreground"
                  }`}
                ></span>
              </div>

              <div className="flex-1 text-left overflow-hidden">
                <p
                  className={`text-sm font-medium truncate ${
                    activeConversationId === conv.id
                      ? "text-white"
                      : "text-foreground group-hover:text-white"
                  }`}
                >
                  {displayName}
                </p>
                <div className="flex items-center gap-1 text-xs opacity-70 truncate">
                  {/* Last message preview could go here if we fetched it */}
                  <span>Click to chat</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* User Mini Profile at bottom (optional, mimicking Discord) */}
      <div className="p-2 bg-notfox-darker border-t border-border flex items-center gap-2">
        {currentUser && (
          <>
            <div className="w-8 h-8 rounded-full bg-secondary overflow-hidden">
              {currentUser.avatar_url ? (
                <img src={currentUser.avatar_url} alt="Me" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {currentUser.username?.[0]}
                </div>
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-bold truncate">
                {currentUser.display_name || currentUser.username}
              </div>
              <div className="text-xs text-muted-foreground truncate line-through opacity-50">
                #{currentUser.id.slice(0, 4)}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DMList;
