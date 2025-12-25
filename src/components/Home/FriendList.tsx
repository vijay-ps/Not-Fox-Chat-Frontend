import { useEffect, useState } from "react";
import { User, Check, X, MessageSquare, Search, UserPlus } from "lucide-react";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const FriendList = () => {
  const [activeTab, setActiveTab] = useState<
    "online" | "all" | "pending" | "add"
  >("all");
  const [friends, setFriends] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [addUsername, setAddUsername] = useState("");
  const { toast } = useToast();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!addUsername.trim()) return;
    setIsSearching(true);
    try {
      const results = await api.users.search(addUsername);
      setSearchResults(Array.isArray(results) ? results : []);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === "all" || activeTab === "online") {
        const data = await api.friends.list();
        setFriends(Array.isArray(data) ? data : []);
      }
      if (activeTab === "pending") {
        const data = await api.friends.pending();
        setPending(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  const handleSendRequest = async (targetUserId: string) => {
    try {
      await api.friends.request(targetUserId);
      toast({
        title: "Friend request sent",
        description: "They will see it in their pending tab.",
      });
      setAddUsername("");
      setSearchResults([]);
    } catch (error: any) {
      toast({
        title: "Error sending request",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      await api.friends.accept(requestId);
      toast({ title: "Friend request accepted" });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error accepting request",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex-1 bg-notfox-light h-full flex flex-col">
      {/* Header */}
      <div className="h-12 border-b border-border flex items-center px-4 gap-4 bg-notfox-dark">
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <User className="w-5 h-5" />
          Friends
        </div>
        <div className="h-6 w-px bg-border mx-2" />
        <div className="flex gap-4 text-sm">
          <button
            onClick={() => setActiveTab("online")}
            className={`${
              activeTab === "online"
                ? "text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Online
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`${
              activeTab === "all"
                ? "text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`${
              activeTab === "pending"
                ? "text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Pending
            {pending.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-destructive text-[10px] text-white">
                {pending.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("add")}
            className={`${
              activeTab === "add"
                ? "text-success font-medium"
                : "text-success/70 hover:text-success"
            }`}
          >
            Add Friend
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 overflow-y-auto">
        {activeTab === "pending" && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-muted-foreground uppercase mb-4">
              Pending Requests — {pending.length}
            </h3>
            {pending.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-notfox-darker/50 group border border-transparent hover:border-border/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                    {req.sender?.avatar_url ? (
                      <img src={req.sender.avatar_url} />
                    ) : (
                      req.sender?.username?.[0]
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-foreground">
                      {req.sender?.display_name || req.sender?.username}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Incoming Friend Request
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(req.id)}
                    className="w-8 h-8 rounded-full bg-notfox-dark flex items-center justify-center hover:text-success hover:bg-notfox-black transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 rounded-full bg-notfox-dark flex items-center justify-center hover:text-destructive hover:bg-notfox-black transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {pending.length === 0 && (
              <div className="text-center text-muted-foreground py-10">
                No pending requests
              </div>
            )}
          </div>
        )}

        {/* All / Online */}
        {(activeTab === "all" || activeTab === "online") && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-muted-foreground uppercase mb-4">
              {activeTab.toUpperCase()} FRIENDS — {friends.length}
            </h3>
            {friends.map((friend) => (
              <div
                key={friend.friendship_id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-notfox-darker/50 group border border-transparent hover:border-border/50 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden relative">
                    {friend.avatar_url ? (
                      <img
                        src={friend.avatar_url}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      friend.username?.[0]
                    )}
                    <div
                      className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-notfox-light rounded-full ${
                        friend.status === "online"
                          ? "bg-success"
                          : "bg-muted-foreground"
                      }`}
                    ></div>
                  </div>
                  <div>
                    <div className="font-bold text-foreground">
                      {friend.display_name || friend.username}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {friend.status}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="w-8 h-8 rounded-full bg-notfox-dark flex items-center justify-center hover:bg-notfox-black transition-colors"
                    title="Message"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {friends.length === 0 && (
              <div className="text-center text-muted-foreground py-10">
                Wumpus is waiting on friends.
              </div>
            )}
          </div>
        )}

        {/* Add Friend */}
        {activeTab === "add" && (
          <div className="max-w-lg mx-auto mt-10">
            <h2 className="text-lg font-bold text-foreground mb-2">
              ADD FRIEND
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              You can add friends with their username.
            </p>
            <div className="flex gap-2">
              <div className="flex-1 bg-notfox-darker rounded-lg border border-border px-4 py-2 flex items-center focus-within:border-primary">
                <input
                  type="text"
                  className="bg-transparent border-none outline-none flex-1 text-foreground"
                  placeholder="Enter username to search..."
                  value={addUsername}
                  onChange={(e) => setAddUsername(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  className="ml-2 text-muted-foreground hover:text-foreground"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search Results */}
            <div className="mt-8 space-y-2">
              {addUsername && searchResults.length > 0 && (
                <h3 className="text-xs font-bold text-muted-foreground uppercase mb-2">
                  Search Results
                </h3>
              )}
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-notfox-darker/50 border border-transparent hover:border-border/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        user.username?.[0].toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-foreground">
                        {user.display_name || user.username}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        @{user.username}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSendRequest(user.id)}
                    className="p-2 rounded-full bg-primary hover:bg-primary/90 text-white transition-colors"
                    title="Send Friend Request"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {isSearching && (
                <div className="text-center text-muted-foreground py-4">
                  Searching...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendList;
