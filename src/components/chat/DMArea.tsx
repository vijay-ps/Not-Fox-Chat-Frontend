import { useEffect, useRef, useState } from "react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import {
  Hash,
  Phone,
  Video,
  MoreVertical,
  Send,
  Loader2,
  Plus,
} from "lucide-react";
import { useDM } from "@/hooks/useDM";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { CallModal } from "@/components/modals/CallModal";
import MessageItemReal from "./MessageItemReal";
import { cn } from "@/lib/utils";

interface DMAreaProps {
  conversationId: string;
  renderMobileMenu?: React.ReactNode;
}

const DMArea = ({ conversationId, renderMobileMenu }: DMAreaProps) => {
  const {
    messages,
    loadingMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    conversations,
  } = useDM(conversationId);
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
          {renderMobileMenu}
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
              <p className="max-w-xs sm:max-w-md mx-auto text-sm sm:text-base">
                Check out the beginning of your direct message history with{" "}
                {displayName}.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {messages.map((msg, index) => {
              const showAvatar =
                index === 0 ||
                messages[index - 1].author_id !== msg.author_id ||
                new Date(msg.created_at).getTime() -
                  new Date(messages[index - 1].created_at).getTime() >
                  60000 * 5;

              return (
                <MessageItemReal
                  key={msg.id}
                  message={msg as any}
                  index={index}
                  showAvatar={showAvatar}
                  onEdit={editMessage}
                  onDelete={deleteMessage}
                  onReact={addReaction}
                  onReply={() => {}} // DM reply not implemented in schema yet
                  onPin={() => {}} // DM pin not implemented in schema yet
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-2 sm:px-4 pb-4 bg-background">
        <div className="bg-notfox-input rounded-lg flex items-center p-1.5 sm:p-2 gap-2 border border-transparent focus-within:border-primary/50 transition-all">
          <button className="p-1.5 sm:p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-white/5 active:scale-90">
            <Plus className="w-5 h-5 rounded-full bg-muted-foreground/20 p-0.5" />
          </button>

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              window.innerWidth < 640 ? "Message" : `Message @${displayName}`
            }
            className="flex-1 bg-transparent border-none focus:outline-none text-foreground placeholder:text-muted-foreground/60 text-sm sm:text-[15px] py-1"
          />

          <div className="flex items-center gap-1 sm:gap-2 pr-1 relative">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="hidden sm:flex p-1.5 rounded-full hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              <div className="w-5 h-5 grayscale hover:grayscale-0 transition-all">
                😊
              </div>
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-3 z-50 shadow-2xl rounded-xl overflow-hidden">
                <EmojiPicker
                  onEmojiClick={(emojiData) => {
                    setNewMessage((prev) => prev + emojiData.emoji);
                    setShowEmojiPicker(false);
                  }}
                  lazyLoadEmojis={true}
                  theme={Theme.DARK}
                  width={window.innerWidth < 400 ? 280 : 320}
                  height={400}
                />
              </div>
            )}
            <button
              onClick={() => handleSend()}
              className={cn(
                "p-1.5 sm:p-2 rounded-full transition-all active:scale-95",
                newMessage.trim()
                  ? "text-primary hover:text-primary/80 hover:bg-primary/10"
                  : "text-muted-foreground/40 cursor-not-allowed"
              )}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple Plus icon helper removed as it's now imported properly

export default DMArea;
