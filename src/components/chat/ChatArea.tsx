import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hash, Bell, Pin, Users, Search, Inbox, HelpCircle, PlusCircle, Gift, Sticker, Smile, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Message, Channel } from '@/types';
import { Button } from '@/components/ui/button';
import MessageItem from './MessageItem';

interface ChatAreaProps {
  channel: Channel;
  messages: Message[];
  onSendMessage: (content: string) => void;
}

const ChatArea = ({ channel, messages, onSendMessage }: ChatAreaProps) => {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-border bg-card/30 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Hash className="w-5 h-5 text-muted-foreground" />
          <span className="font-semibold text-foreground">{channel.name}</span>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground">
            <Bell className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground">
            <Pin className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground">
            <Users className="w-5 h-5" />
          </Button>

          <div className="relative ml-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search"
              className="w-36 h-7 pl-8 pr-2 text-sm bg-secondary rounded-md border-none focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
            />
          </div>

          <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground">
            <Inbox className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground">
            <HelpCircle className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Channel Welcome */}
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
            This is the start of the #{channel.name} channel. Send a message to begin the conversation.
          </p>
        </motion.div>

        {/* Message List */}
        <AnimatePresence>
          {messages.map((message, index) => (
            <MessageItem
              key={message.id}
              message={message}
              index={index}
              showAvatar={index === 0 || messages[index - 1].author.id !== message.author.id}
            />
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <div className="flex gap-0.5">
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span>Several people are typing...</span>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-4 pb-4">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center gap-2 bg-secondary/80 rounded-lg px-4 py-2 border border-border focus-within:border-primary/50 transition-colors">
            <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
              <PlusCircle className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`Message #${channel.name}`}
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
            />

            <div className="flex items-center gap-1">
              <button type="button" className="text-muted-foreground hover:text-foreground transition-colors p-1">
                <Gift className="w-5 h-5" />
              </button>
              <button type="button" className="text-muted-foreground hover:text-foreground transition-colors p-1">
                <Sticker className="w-5 h-5" />
              </button>
              <button type="button" className="text-muted-foreground hover:text-foreground transition-colors p-1">
                <Smile className="w-5 h-5" />
              </button>
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className={cn(
                  "p-1 transition-all",
                  inputValue.trim()
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
  );
};

export default ChatArea;
