import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/hooks/useMessages";

interface PinnedMessagesListProps {
  channelId: string;
  onClose: () => void;
}

const PinnedMessagesList = ({
  channelId,
  onClose,
}: PinnedMessagesListProps) => {
  const [pinnedMessages, setPinnedMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPinnedMessages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("messages")
        .select(
          `
          *,
          author:profiles(*)
        `
        )
        .eq("channel_id", channelId)
        .eq("is_pinned", true)
        .order("created_at", { ascending: false }); // Newest pins first usually? Or oldest? Discord shows newest at bottom usually, but list might be different. Let's do desc.

      if (!error && data) {
        setPinnedMessages(data as any);
      }
      setLoading(false);
    };

    fetchPinnedMessages();
  }, [channelId]);

  return (
    <div className="w-80 bg-notfox-dark border-l border-border flex flex-col h-full shadow-xl z-20">
      <div className="h-12 flex items-center justify-between px-4 border-b border-border bg-notfox-darker">
        <h3 className="font-bold text-foreground">Pinned Messages</h3>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : pinnedMessages.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-8">
            No pinned messages in this channel.
          </div>
        ) : (
          pinnedMessages.map((msg) => (
            <div
              key={msg.id}
              className="bg-notfox-darker p-3 rounded-lg border border-border group relative"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-secondary overflow-hidden">
                  {msg.author?.avatar_url ? (
                    <img
                      src={msg.author.avatar_url}
                      alt={msg.author.username}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs">
                      {msg.author?.username?.[0]}
                    </div>
                  )}
                </div>
                <span className="font-bold text-sm text-foreground">
                  {msg.author?.display_name || msg.author?.username}
                </span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(msg.created_at), "MM/dd/yy")}
                </span>
              </div>
              <div className="text-sm text-notfox-text whitespace-pre-wrap pl-8">
                {msg.content}
              </div>
              <button
                title="Jump to message (not implemented)"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-xs bg-black/50 px-2 py-1 rounded text-white"
              >
                Jump
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PinnedMessagesList;
