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
  renderMobileMenu?: React.ReactNode;
}

const ChatAreaReal = ({ channel, renderMobileMenu }: ChatAreaRealProps) => {
  const {
    messages,
    loading,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    pinMessage,
    typingUsers,
    sendTypingStatus,
  } = useMessages(channel.id);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (inputValue.trim()) {
      sendTypingStatus(true);
      const timeout = setTimeout(() => sendTypingStatus(false), 2000);
      return () => clearTimeout(timeout);
    } else {
      sendTypingStatus(false);
    }
  }, [inputValue, sendTypingStatus]);

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
        <div className="h-10 sm:h-12 px-2 sm:px-4 flex items-center justify-between border-b border-border bg-card/30 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-1 sm:gap-2 overflow-hidden">
            {renderMobileMenu}
            <Hash className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
            <span className="font-semibold text-foreground text-sm sm:text-base truncate">
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
          <div className="flex items-center gap-2 sm:gap-4 text-muted-foreground shrink-0 pl-2">
            <button className="hidden sm:block hover:text-foreground transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowPinned(!showPinned)}
              className={cn(
                "hover:text-foreground transition-colors p-1 rounded hover:bg-white/5",
                showPinned && "text-primary bg-primary/10"
              )}
            >
              <Pin className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button className="hidden sm:block hover:text-foreground transition-colors">
              <Users className="w-5 h-5" />
            </button>
            <div className="hidden md:flex items-center bg-secondary/50 rounded px-2 py-1">
              <input
                type="text"
                placeholder="Search"
                className="bg-transparent border-none text-xs focus:outline-none w-24"
              />
              <Search className="w-3 h-3" />
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

        <div className="px-4">
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
                className="mb-2 flex items-center justify-between bg-notfox-input/50 p-2 rounded-t-lg border-l-4 border-primary mx-1"
              >
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <span className="text-muted-foreground italic">
                    Replying to
                  </span>
                  <span className="font-semibold">
                    {replyTo.author?.display_name || replyTo.author?.username}
                  </span>
                </div>
                <button
                  onClick={() => setReplyTo(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {attachments.length > 0 && (
            <div className="flex gap-4 p-3 overflow-x-auto bg-notfox-input/30 rounded-t-lg border-x border-t border-border/50 mx-1 mb-0 custom-scrollbar">
              {attachments.map((att, i) => (
                <div
                  key={i}
                  className="relative group w-32 h-32 flex-shrink-0 bg-background rounded-lg border border-border/50 overflow-hidden flex items-center justify-center p-2 shadow-sm"
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
                    <div className="flex flex-col items-center p-2 text-center overflow-hidden">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-1">
                        <span className="text-[10px] font-bold text-primary">
                          FILE
                        </span>
                      </div>
                      <span className="text-[10px] truncate w-full text-foreground">
                        {att.name}
                      </span>
                    </div>
                  )}
                  {!att.isUploading && (
                    <button
                      onClick={() => removeAttachment(i)}
                      className="absolute top-1 right-1 bg-destructive hover:bg-destructive/80 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-2 sm:px-4 pb-4 bg-background">
          <AnimatePresence>
            {typingUsers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="text-xs text-muted-foreground mb-1 ml-2 flex items-center gap-2"
              >
                <div className="flex gap-0.5">
                  <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" />
                </div>
                <span>
                  {typingUsers.length === 1
                    ? `${typingUsers[0]} is typing...`
                    : typingUsers.length === 2
                    ? `${typingUsers[0]} and ${typingUsers[1]} are typing...`
                    : "Several people are typing..."}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          <form onSubmit={handleSubmit}>
            <div
              className={`bg-notfox-input flex items-center p-1.5 sm:p-2 gap-2 border border-transparent focus-within:border-primary/50 transition-all ${
                replyTo || attachments.length > 0
                  ? "rounded-b-lg border-t-0"
                  : "rounded-lg"
              }`}
            >
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 sm:p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-white/5 active:scale-90"
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
                placeholder={
                  window.innerWidth < 640
                    ? "Message"
                    : `Message #${channel.name} • Type @AI for help`
                }
                className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/60 focus:outline-none text-sm sm:text-[15px] py-1"
              />

              <div className="flex items-center gap-1 sm:gap-2 pr-1 relative">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="hidden sm:flex text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-full hover:bg-white/5"
                >
                  <Smile className="w-5 h-5" />
                </button>
                {showEmojiPicker && (
                  <div className="absolute bottom-full right-0 mb-3 z-50 shadow-2xl rounded-xl overflow-hidden">
                    <EmojiPicker
                      onEmojiClick={(emojiData) => {
                        setInputValue((prev) => prev + emojiData.emoji);
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
                  type="submit"
                  disabled={isSendDisabled}
                  className={cn(
                    "p-1.5 sm:p-2 transition-all rounded-full active:scale-95",
                    !isSendDisabled
                      ? "text-primary hover:text-primary/80 hover:bg-primary/10"
                      : "text-muted-foreground/40 cursor-not-allowed"
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
