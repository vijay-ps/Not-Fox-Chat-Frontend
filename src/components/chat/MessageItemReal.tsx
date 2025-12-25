import { useState } from "react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { motion } from "framer-motion";
import {
  MoreHorizontal,
  Smile,
  Reply,
  Pencil,
  Trash2,
  Check,
  X,
  Pin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Message } from "@/hooks/useMessages";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

interface MessageItemRealProps {
  message: Message;
  index: number;
  showAvatar: boolean;
  onEdit: (messageId: string, content: string) => void;
  onDelete: (messageId: string) => void;
  onReact: (messageId: string, emoji: string) => void;
  onPin: (messageId: string, isPinned: boolean) => void;
  onReply: (message: Message) => void;
}

const EMOJI_OPTIONS = ["👍", "❤️", "🔥", "😂", "😮", "🎉", "🤔", "👀"];

const MessageItemReal = ({
  message,
  index,
  showAvatar,
  onEdit,
  onDelete,
  onReact,
  onPin,
  onReply,
}: MessageItemRealProps) => {
  const { profile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const isOwnMessage = profile?.id === message.author_id;

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) {
      return `Today at ${format(date, "h:mm a")}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${format(date, "h:mm a")}`;
    }
    return format(date, "MM/dd/yyyy h:mm a");
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit(message.id, editContent);
    }
    setIsEditing(false);
  };

  const author = message.author;
  const isAIMessage =
    message.content.startsWith("🤖") || author?.username === "NotFoxAI";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      className={cn(
        "group relative flex gap-4 py-0.5 px-2 -mx-2 rounded hover:bg-secondary/30 transition-colors",
        showAvatar ? "mt-4" : "mt-0",
        isAIMessage && "bg-primary/5",
        message.is_pinned && "bg-accent/5"
      )}
    >
      <div className="w-10 flex-shrink-0">
        {showAvatar ? (
          author?.avatar_url ? (
            <img
              src={author.avatar_url}
              alt={author.display_name || author.username}
              className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
              {(author?.display_name || author?.username || "?")
                .charAt(0)
                .toUpperCase()}
            </div>
          )
        ) : (
          <span className="invisible group-hover:visible text-[10px] text-muted-foreground leading-[22px]">
            {format(new Date(message.created_at), "h:mm a")}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        {showAvatar && (
          <div className="flex items-baseline gap-2 mb-0.5">
            <span
              className={cn(
                "font-medium hover:underline cursor-pointer",
                isAIMessage ? "text-primary" : "text-foreground",
                author?.subscription_tier === "nitro" && "gradient-text"
              )}
            >
              {author?.display_name || author?.username || "Unknown"}
            </span>
            {author?.subscription_tier === "nitro" && (
              <span className="text-xs bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text font-semibold">
                NITRO
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {formatTime(message.created_at)}
            </span>
            {message.is_edited && (
              <span className="text-xs text-muted-foreground">(edited)</span>
            )}
            {message.is_pinned && (
              <Pin className="w-3 h-3 text-accent rotate-45" />
            )}
          </div>
        )}

        {message.reply_to_id && (
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
            <div className="w-6 border-t-2 border-l-2 border-muted-foreground/30 h-2 rounded-tl-md" />
            <span className="opacity-70">Replying to message...</span>
          </div>
        )}

        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveEdit();
                if (e.key === "Escape") setIsEditing(false);
              }}
              className="flex-1 bg-secondary px-3 py-1 rounded text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
            />
            <button
              onClick={handleSaveEdit}
              className="text-success hover:text-success/80"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="text-destructive hover:text-destructive/80"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="text-foreground leading-relaxed whitespace-pre-wrap break-words">
            {message.content.split("\n").map((line, i) => (
              <p
                key={i}
                className={cn(
                  line.startsWith("```") &&
                    "font-mono text-sm bg-secondary/50 p-2 rounded my-1"
                )}
              >
                {line}
              </p>
            ))}
          </div>
        )}

        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.attachments.map((att: any, i) => (
              <div key={i}>
                {att.type === "image" ? (
                  <img
                    src={att.url}
                    alt={att.name}
                    className="max-w-sm rounded-lg border border-border"
                  />
                ) : (
                  <a
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 bg-secondary rounded-lg border border-border text-foreground hover:bg-secondary/80"
                  >
                    <span className="text-sm font-medium">{att.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({Math.round(att.size / 1024)} KB)
                    </span>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {message.reactions && message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {message.reactions.map((reaction, i) => (
              <button
                key={i}
                onClick={() => onReact(message.id, reaction.emoji)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/60 hover:bg-secondary text-sm transition-colors border border-transparent hover:border-primary/30"
              >
                <span>{reaction.emoji}</span>
                <span className="text-xs text-muted-foreground">
                  {reaction.count}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="absolute right-2 -top-4 opacity-0 group-hover:opacity-100 transition-opacity z-10 w-fit">
        <div className="flex items-center bg-card border border-border rounded-md shadow-lg overflow-hidden">
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1.5 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              title="React"
            >
              <Smile className="w-4 h-4" />
            </button>

            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-1 z-50 shadow-xl rounded-lg overflow-hidden">
                <EmojiPicker
                  onEmojiClick={(emojiData) => {
                    onReact(message.id, emojiData.emoji);
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

          <button
            onClick={() => onReply(message)}
            className="p-1.5 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            title="Reply"
          >
            <Reply className="w-4 h-4" />
          </button>

          <button
            onClick={() => onPin(message.id, !message.is_pinned)}
            className={cn(
              "p-1.5 hover:bg-secondary transition-colors",
              message.is_pinned
                ? "text-accent"
                : "text-muted-foreground hover:text-foreground"
            )}
            title={message.is_pinned ? "Unpin Message" : "Pin Message"}
          >
            <Pin className="w-4 h-4" />
          </button>

          {isOwnMessage && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                title="Edit"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(message.id)}
                className="p-1.5 hover:bg-secondary text-muted-foreground hover:text-destructive transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MessageItemReal;
