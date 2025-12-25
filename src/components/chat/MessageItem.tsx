import { motion } from 'framer-motion';
import { MoreHorizontal, Smile, Reply, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Message } from '@/types';
import { format } from 'date-fns';

interface MessageItemProps {
  message: Message;
  index: number;
  showAvatar: boolean;
}

const MessageItem = ({ message, index, showAvatar }: MessageItemProps) => {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today at ${format(date, 'h:mm a')}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${format(date, 'h:mm a')}`;
    }
    return format(date, 'MM/dd/yyyy h:mm a');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      className={cn(
        "group relative flex gap-4 py-0.5 px-2 -mx-2 rounded hover:bg-secondary/30 transition-colors",
        showAvatar ? "mt-4" : "mt-0"
      )}
    >
      {/* Avatar or Time Gutter */}
      <div className="w-10 flex-shrink-0">
        {showAvatar ? (
          <img
            src={message.author.avatar}
            alt={message.author.displayName}
            className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
          />
        ) : (
          <span className="invisible group-hover:visible text-[10px] text-muted-foreground leading-[22px]">
            {format(message.timestamp, 'h:mm a')}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {showAvatar && (
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className="font-medium text-foreground hover:underline cursor-pointer">
              {message.author.displayName}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatTime(message.timestamp)}
            </span>
            {message.isEdited && (
              <span className="text-xs text-muted-foreground">(edited)</span>
            )}
          </div>
        )}

        <div className="text-foreground leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </div>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {message.reactions.map((reaction, i) => (
              <button
                key={i}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/60 hover:bg-secondary text-sm transition-colors border border-transparent hover:border-primary/30"
              >
                <span>{reaction.emoji}</span>
                <span className="text-xs text-muted-foreground">{reaction.count}</span>
              </button>
            ))}
            <button className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary/40 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
              <Smile className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="absolute right-2 -top-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center bg-card border border-border rounded-md shadow-lg overflow-hidden">
          <button className="p-1.5 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <Smile className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <Reply className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <Pencil className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-secondary text-muted-foreground hover:text-destructive transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default MessageItem;
