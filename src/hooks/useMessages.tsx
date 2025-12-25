import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "@/hooks/use-toast";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface Message {
  id: string;
  channel_id: string;
  author_id: string;
  content: string;
  reply_to_id: string | null;
  is_pinned: boolean;
  is_edited: boolean;
  is_deleted?: boolean;
  attachments: unknown[];
  embeds: any[];
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    status: string;
    subscription_tier: string;
  };
  reactions?: {
    emoji: string;
    count: number;
  }[];
}

export const useMessages = (channelId: string | null) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const fetchMessages = useCallback(async () => {
    if (!channelId) return;

    setLoading(true); // Reset loading state on fetch start
    try {
      const { api } = await import("@/services/api");
      const messages = await api.messages.list(channelId);

      if (messages.error) throw new Error(messages.error);

      const formattedMessages = (messages as any[]).map((msg: any) => ({
        ...msg,
        is_deleted:
          Array.isArray(msg.embeds) &&
          msg.embeds.some((e: any) => e.type === "deleted"),
      }));
      setMessages(formattedMessages as Message[]);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error loading messages",
        description: "Could not load channel history. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [channelId, toast]);

  const sendMessage = async (
    content: string,
    replyToId?: string,
    attachments?: any[]
  ) => {
    if (!profile || !channelId) return null;

    try {
      const { api } = await import("@/services/api");

      const message = await api.messages.send({
        channelId,
        content,
        replyToId,
        attachments,
      });

      if (message.error) throw new Error(message.error);

      return message as Message;
    } catch (error: any) {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const pinMessage = async (messageId: string, isPinned: boolean) => {
    const { error } = await supabase
      .from("messages")
      .update({ is_pinned: isPinned })
      .eq("id", messageId);

    if (error) {
      toast({
        title: "Error updating pin status",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: isPinned ? "Message Pinned" : "Message Unpinned",
        description: isPinned
          ? "Message added to pinned list"
          : "Message removed from pinned list",
      });
    }
  };

  const sendAIMessage = async (userMessage: string) => {
    return null;
  };

  // ... (keep sendAIMessage logic or refactor later if requested)

  const editMessage = async (messageId: string, content: string) => {
    const { error } = await supabase
      .from("messages")
      .update({ content, is_edited: true })
      .eq("id", messageId);

    if (error) {
      toast({
        title: "Error editing message",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      const { api } = await import("@/services/api");
      await api.messages.delete(messageId);
    } catch (error: any) {
      toast({
        title: "Error deleting message",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addReaction = async (messageId: string, emoji: string) => {
    if (!profile) return;

    const { error } = await supabase.from("message_reactions").insert({
      message_id: messageId,
      profile_id: profile.id,
      emoji,
    });

    if (error && !error.message.includes("duplicate")) {
      toast({
        title: "Error adding reaction",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const removeReaction = async (messageId: string, emoji: string) => {
    if (!profile) return;

    await supabase
      .from("message_reactions")
      .delete()
      .eq("message_id", messageId)
      .eq("profile_id", profile.id)
      .eq("emoji", emoji);
  };

  useEffect(() => {
    if (!channelId) return;
    fetchMessages();
  }, [channelId, fetchMessages]);

  useEffect(() => {
    if (!channelId || !profile) return;

    // Typing indicator channel
    const typingChannel = supabase.channel(`typing:${channelId}`, {
      config: {
        presence: {
          key: profile.id,
        },
      },
    });

    typingChannel
      .on("presence", { event: "sync" }, () => {
        const state = typingChannel.presenceState();
        const users = Object.values(state)
          .flat()
          .map((p: any) => p.username)
          .filter((u) => u !== (profile.display_name || profile.username));
        setTypingUsers(users);
      })
      .subscribe();

    // Messages channel
    const messagesChannel: RealtimeChannel = supabase
      .channel(`messages:${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`,
        },
        async (payload) => {
          const { data: newMessage, error } = await supabase
            .from("messages")
            .select(
              `
              *,
              author:profiles!messages_author_id_fkey(
                id, username, display_name, avatar_url, status, subscription_tier
              )
            `
            )
            .eq("id", payload.new.id)
            .single();

          if (!error && newMessage) {
            const msgWithDeleted = {
              ...newMessage,
              is_deleted:
                Array.isArray(newMessage.embeds) &&
                newMessage.embeds.some((e: any) => e.type === "deleted"),
            };
            setMessages((prev) => [...prev, msgWithDeleted as Message]);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`,
        },
        async (payload) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === payload.new.id
                ? {
                    ...msg,
                    ...payload.new,
                    is_deleted:
                      Array.isArray(payload.new.embeds) &&
                      payload.new.embeds.some((e: any) => e.type === "deleted"),
                  }
                : msg
            )
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          setMessages((prev) =>
            prev.filter((msg) => msg.id !== payload.old.id)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(typingChannel);
    };
  }, [channelId, profile]);

  const sendTypingStatus = useCallback(
    async (isTyping: boolean) => {
      if (!channelId || !profile) return;
      const channel = supabase.channel(`typing:${channelId}`);
      if (isTyping) {
        await channel.track({
          username: profile.display_name || profile.username,
          id: profile.id,
        });
      } else {
        await channel.untrack();
      }
    },
    [channelId, profile]
  );

  return {
    messages,
    loading,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    removeReaction,
    typingUsers,
    fetchMessages,
    pinMessage,
    sendTypingStatus,
  };
};
