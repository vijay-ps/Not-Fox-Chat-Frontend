import { useEffect, useRef, useState } from "react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { Hash, Phone, Video, MoreVertical, Send, Loader2 } from "lucide-react";
import { useDM } from "@/hooks/useDM";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { CallModal } from "@/components/modals/CallModal";

interface DMAreaProps {
  conversationId: string;
}

const DMArea = ({ conversationId }: DMAreaProps) => {
  const { messages, loadingMessages, sendMessage, conversations } =
    useDM(conversationId);
  const { profile } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Find other participant details for header
  const currentConversation = conversations.find(
    (c) => c.id === conversationId
  );
  const otherParticipant = currentConversation?.participants.find(
    (p) => p.profile_id !== profile?.id
  )?.profile;
  const displayName =
    otherParticipant?.display_name || otherParticipant?.username || "Unknown";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim()) return;

    await sendMessage(newMessage);
    setNewMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const [isCalling, setIsCalling] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);

  // ... (existing effects)

  const handleStartCall = (video: boolean) => {
    setIsVideoCall(video);
    setIsCalling(true);
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-background overflow-hidden relative">
      {/* Call Modal */}
      {otherParticipant && (
        <CallModal
          isOpen={isCalling}
          onClose={() => setIsCalling(false)}
          participant={otherParticipant}
          isVideo={isVideoCall}
          conversationId={conversationId}
        />
      )}

      {/* Header */}
      <div className="h-12 border-b border-border flex items-center px-4 justify-between shadow-sm bg-notfox-dark z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
            {otherParticipant?.avatar_url ? (
              <img src={otherParticipant.avatar_url} alt={displayName} />
            ) : (
              <span>@</span>
            )}
          </div>
          <div>
            <h3 className="font-bold text-foreground flex items-center gap-2">
              {displayName}
            </h3>
            {otherParticipant?.status === "online" && (
              <span className="text-[10px] text-success">Online</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-muted-foreground">
          <button
            onClick={() => handleStartCall(false)}
            className="hover:text-foreground transition-colors"
            title="Start Voice Call"
          >
            <Phone className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleStartCall(true)}
            className="hover:text-foreground transition-colors"
            title="Start Video Call"
          >
            <Video className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-border mx-2" />
          <button className="hover:text-foreground transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4"
        ref={scrollRef}
      >
        {loadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-muted-foreground p-8">
            <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center text-4xl">
              👋
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">
                Usage history with {displayName}
              </h3>
              <p>
                Check out the beginning of your direct message history with{" "}
                {displayName}.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.author_id === profile?.id;
            const showHeader =
              index === 0 ||
              messages[index - 1].author_id !== msg.author_id ||
              new Date(msg.created_at).getTime() -
                new Date(messages[index - 1].created_at).getTime() >
                60000 * 5; // 5 mins

            return (
              <div
                key={msg.id}
                className={`group flex ${
                  showHeader ? "mt-4" : "mt-0.5"
                } hover:bg-black/5 -mx-4 px-4 py-0.5`}
              >
                {showHeader ? (
                  <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity mt-0.5">
                    {msg.author?.avatar_url ? (
                      <img
                        src={msg.author.avatar_url}
                        alt={msg.author.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs">
                        {msg.author?.username?.[0] || "?"}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-10 flex-shrink-0 text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 text-right pr-3 select-none">
                    {format(new Date(msg.created_at), "h:mm a")}
                  </div>
                )}

                <div
                  className={`flex-1 min-w-0 ${showHeader ? "ml-3" : "ml-3"}`}
                >
                  {showHeader && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground hover:underline cursor-pointer">
                        {msg.author?.display_name || msg.author?.username}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">
                        {format(new Date(msg.created_at), "MM/dd/yyyy h:mm a")}
                      </span>
                    </div>
                  )}
                  <p
                    className={`text-notfox-text whitespace-pre-wrap leading-relaxed ${
                      !showHeader ? "-mt-1" : ""
                    }`}
                  >
                    {msg.content}
                    {msg.is_edited && (
                      <span className="text-[10px] text-muted-foreground ml-1">
                        (edited)
                      </span>
                    )}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-background">
        <div className="bg-notfox-input rounded-lg flex items-center p-2 gap-2 border border-transparent focus-within:border-primary/50 transition-colors">
          <button className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-background/50">
            <Plus className="w-5 h-5 rounded-full bg-muted-foreground/20 p-0.5" />
            {/* This requires Plus imported from lucide-react? Reusing specific icon look */}
          </button>

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message @${displayName}`}
            className="flex-1 bg-transparent border-none focus:outline-none text-foreground placeholder:text-muted-foreground/70"
          />

          <div className="flex items-center gap-2 pr-2 relative">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              <div className="w-6 h-6 grayscale hover:grayscale-0 transition-all">
                😊
              </div>
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-2 z-50 shadow-xl rounded-lg overflow-hidden">
                <EmojiPicker
                  onEmojiClick={(emojiData) => {
                    setNewMessage((prev) => prev + emojiData.emoji);
                    setShowEmojiPicker(false);
                  }}
                  lazyLoadEmojis={true}
                  theme={Theme.DARK}
                  width={300}
                  height={400}
                />
              </div>
            )}
          </div>
        </div>
        <div className="text-[10px] text-center text-muted-foreground mt-1">
          {/* Typing indicators could go here */}
        </div>
      </div>
    </div>
  );
};

// Simple Plus icon helper needed if not imported.
// Actually I imported Plus in DMList but not DMArea check imports
import { Plus } from "lucide-react";

export default DMArea;
