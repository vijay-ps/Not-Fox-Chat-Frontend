import { useState, useRef, useEffect } from "react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { api } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Hash,
  Bell,
  Pin,
  Users,
  Search,
  PlusCircle,
  Smile,
  Send,
  Bot,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Channel } from "@/types";
import { useMessages, Message } from "@/hooks/useMessages";
import { Button } from "@/components/ui/button";
import MessageItemReal from "./MessageItemReal";
import { format } from "date-fns";
import PinnedMessagesList from "./PinnedMessagesList";

interface ChatAreaRealProps {
  channel: Channel;
}

const ChatAreaReal = ({ channel }: ChatAreaRealProps) => {
  const {
    messages,
    loading,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    pinMessage,
  } = useMessages(channel.id);
  const [inputValue, setInputValue] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAIHint, setShowAIHint] = useState(false);
  const [showPinned, setShowPinned] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [attachments, setAttachments] = useState<any[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setShowAIHint(inputValue.toLowerCase().startsWith("@ai"));
  }, [inputValue]);

  useEffect(() => {
    if (replyTo && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() || attachments.length > 0) {
      await sendMessage(
        inputValue,
        replyTo?.id,
        attachments.length > 0 ? attachments : undefined
      );
      setInputValue("");
      setReplyTo(null);
      setAttachments([]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const tempId = Date.now().toString();

      const tempAttachment = {
        name: file.name,
        size: file.size,
        type: file.type || "application/octet-stream",
        url: URL.createObjectURL(file),
        isUploading: true,
        id: tempId,
      };

      setAttachments((prev) => [...prev, tempAttachment]);
      setIsUploading(true);

      try {
        const result = await api.storage.upload(file);

        setAttachments((prev) =>
          prev.map((a) =>
            a.id === tempId ? { ...result, isUploading: false } : a
          )
        );
      } catch (error) {
        console.error("Upload error", error);
        setAttachments((prev) => prev.filter((a) => a.id !== tempId));
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleReply = (message: Message) => {
    setReplyTo(message);
  };

  const [searchQuery, setSearchQuery] = useState("");

  const filteredMessages = messages.filter((msg) => {
    if (!searchQuery.trim()) return true;
    const contentMatch = msg.content
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const authorMatch = (msg.author?.display_name || msg.author?.username || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return contentMatch || authorMatch;
  });

  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = "";

    msgs.forEach((msg) => {
      const msgDate = format(new Date(msg.created_at), "MMMM d, yyyy");
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: msgDate, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });

    return groups;
  };

  const messageGroups = groupMessagesByDate(filteredMessages);

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const isSendDisabled =
    isUploading || (!inputValue.trim() && attachments.length === 0);

  return (
    <div className="flex-1 flex bg-background overflow-hidden relative">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-12 px-4 flex items-center justify-between border-b border-border bg-card/30 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-muted-foreground" />
            <span className="font-semibold text-foreground">
              {channel.name}
            </span>
            {channel.topic && (
              <>
                <span className="text-muted-foreground">|</span>
                <span className="text-sm text-muted-foreground truncate max-w-md">
                  {channel.topic}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <Bell className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className={`text-muted-foreground hover:text-foreground ${
                showPinned ? "bg-secondary text-foreground" : ""
              }`}
              onClick={() => setShowPinned(!showPinned)}
            >
              <Pin className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <Users className="w-5 h-5" />
            </Button>

            <div className="relative ml-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-36 h-7 pl-8 pr-2 text-sm bg-secondary rounded-md border-none focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Hash className="w-8 h-8 text-foreground" />
              </div>
              <h1 className="text-3xl font-display font-bold text-foreground mb-2">
                Welcome to #{channel.name}!
              </h1>
              <p className="text-muted-foreground">
                This is the start of the #{channel.name} channel. Send a message
                to begin the conversation.
              </p>
              <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20 max-w-md">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <Bot className="w-5 h-5" />
                  <span className="font-medium">NotFox AI</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Type{" "}
                  <span className="font-mono bg-secondary px-1 rounded">
                    @AI
                  </span>{" "}
                  followed by your question to get help from NotFox AI!
                </p>
              </div>
            </motion.div>
          ) : (
            <>
              {messageGroups.map((group) => (
                <div key={group.date}>
                  <div className="flex items-center gap-4 my-4">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground font-medium">
                      {group.date}
                    </span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  <AnimatePresence>
                    {group.messages.map((message, index) => (
                      <MessageItemReal
                        key={message.id}
                        message={message}
                        index={index}
                        showAvatar={
                          index === 0 ||
                          group.messages[index - 1].author_id !==
                            message.author_id
                        }
                        onEdit={editMessage}
                        onDelete={deleteMessage}
                        onReact={addReaction}
                        onPin={pinMessage}
                        onReply={handleReply}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              ))}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="px-4 pb-4">
          <AnimatePresence>
            {showAIHint && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mb-2 p-2 rounded-lg bg-primary/10 border border-primary/20 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary">
                  NotFox AI will respond to your message
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {replyTo && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mb-2 flex items-center justify-between bg-secondary/80 p-2 rounded-t-lg border-l-4 border-primary ml-1"
              >
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <span className="text-muted-foreground">Replying to</span>
                  <span className="font-semibold">
                    {replyTo.author?.display_name || replyTo.author?.username}
                  </span>
                </div>
                <button
                  onClick={() => setReplyTo(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {attachments.length > 0 && (
            <div className="flex gap-4 p-4 overflow-x-auto bg-secondary/50 rounded-t-lg border-x border-t border-border mx-1 mb-0 custom-scrollbar">
              {attachments.map((att, i) => (
                <div
                  key={i}
                  className="relative group w-48 h-48 flex-shrink-0 bg-background rounded-xl border border-border overflow-hidden flex items-center justify-center p-2 shadow-sm"
                >
                  {att.type?.startsWith("image") ? (
                    <img
                      src={att.url}
                      alt={att.name}
                      className={`max-w-full max-h-full object-contain rounded ${
                        att.isUploading ? "opacity-50" : ""
                      }`}
                    />
                  ) : (
                    <div
                      className={`flex flex-col items-center p-2 text-center overflow-hidden ${
                        att.isUploading ? "opacity-50" : ""
                      }`}
                    >
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                        <span className="text-xs font-bold text-primary">
                          FILE
                        </span>
                      </div>
                      <span className="text-xs truncate w-full font-medium text-foreground">
                        {att.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {(att.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  )}

                  {att.isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}

                  {!att.isUploading && (
                    <button
                      onClick={() => removeAttachment(i)}
                      className="absolute top-2 right-2 bg-destructive/90 hover:bg-destructive text-white p-1.5 rounded-full shadow-lg transition-transform hover:scale-110"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="relative">
            <div
              className={`flex items-center gap-2 bg-secondary/80 px-4 py-2 border border-border focus-within:border-primary/50 transition-colors ${
                replyTo || attachments.length > 0
                  ? "rounded-b-lg border-t-0"
                  : "rounded-lg"
              }`}
            >
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-muted-foreground hover:text-foreground transition-colors"
                disabled={isUploading}
              >
                <PlusCircle className="w-5 h-5" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileUpload}
              />

              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Message #${channel.name} • Type @AI for AI help`}
                className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
              />

              <div className="flex items-center gap-1 relative">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  <Smile className="w-5 h-5" />
                </button>
                {showEmojiPicker && (
                  <div className="absolute bottom-full right-0 mb-2 z-50 shadow-xl rounded-lg overflow-hidden">
                    <EmojiPicker
                      onEmojiClick={(emojiData) => {
                        setInputValue((prev) => prev + emojiData.emoji);
                        setShowEmojiPicker(false);
                      }}
                      lazyLoadEmojis={true}
                      theme={Theme.DARK}
                      width={300}
                      height={400}
                    />
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isSendDisabled}
                  className={cn(
                    "p-1 transition-all",
                    !isSendDisabled
                      ? "text-primary hover:text-primary/80"
                      : "text-muted-foreground cursor-not-allowed"
                  )}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {showPinned && (
        <PinnedMessagesList
          channelId={channel.id}
          onClose={() => setShowPinned(false)}
        />
      )}
    </div>
  );
};

export default ChatAreaReal;
