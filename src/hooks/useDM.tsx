import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "@/hooks/use-toast";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface DMConversation {
  id: string;
  created_at: string;
  updated_at: string;
  participants: DMParticipant[];
  last_message?: DirectMessage;
}

export interface DMParticipant {
  id: string;
  conversation_id: string;
  profile_id: string;
  profile?: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    status: string;
  };
}

export interface DirectMessage {
  id: string;
  conversation_id: string;
  author_id: string;
  content: string;
  created_at: string;
  is_edited: boolean;
  reply_to_id?: string;
  attachments?: unknown[];
  author?: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export const useDM = (conversationId: string | null) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<DMConversation[]>([]);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const fetchConversations = useCallback(async () => {
    if (!profile) return;

    try {
      const { data: myParticipations, error: partError } = await supabase
        .from("dm_participants")
        .select("conversation_id")
        .eq("profile_id", profile.id);

      if (partError) throw partError;

      if (!myParticipations || myParticipations.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      const conversationIds = myParticipations.map((p) => p.conversation_id);

      const { data: convData, error: convError } = await supabase
        .from("dm_conversations")
        .select(
          `
          id,
          created_at
        `
        )
        .in("id", conversationIds)
        .order("created_at", { ascending: false });

      if (convError) throw convError;

      const { data: participantsData, error: participantsError } =
        await supabase
          .from("dm_participants")
          .select(
            `
          unique_id:id,
          conversation_id,
          profile_id,
          profile:profiles(*)
        `
          )
          .in("conversation_id", conversationIds);

      if (participantsError) throw participantsError;

      const formattedConversations: DMConversation[] = (convData || []).map(
        (conv: { id: string; created_at: string }) => {
          const parts = participantsData
            .filter((p) => p.conversation_id === conv.id)
            .map((p) => ({
              id: p.unique_id,
              conversation_id: p.conversation_id,
              profile_id: p.profile_id,
              profile: p.profile,
            }));

          return {
            id: conv.id,
            created_at: conv.created_at,
            updated_at: conv.created_at, // Fallback since updated_at missing
            participants: parts,
          };
        }
      );

      setConversations(formattedConversations);
    } catch (error: any) {
      console.error("Error fetching DMs:", error);
      toast({
        title: "Error fetching DMs",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [profile, toast]);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from("direct_messages")
        .select(
          `
          *,
          author:profiles(*)
        `
        )
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setMessages((data as DirectMessage[]) || []);
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error fetching messages",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingMessages(false);
    }
  }, [conversationId, toast]);

  const startConversation = async (targetUserId: string) => {
    if (!profile) return null;

    try {
      const existing = conversations.find(
        (c) =>
          c.participants.some((p) => p.profile_id === targetUserId) &&
          c.participants.some((p) => p.profile_id === profile.id) &&
          c.participants.length === 2 // Direct DM usually 2 people
      );

      if (existing) {
        return existing.id;
      }

      const { data: newId, error: rpcError } = await (supabase as any).rpc(
        "create_dm",
        {
          target_user_id: targetUserId,
        }
      );

      if (rpcError) throw rpcError;

      await fetchConversations();
      return newId;
    } catch (error: any) {
      console.error("Error creating DM:", error);
      toast({
        title: "Error creating DM",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const sendMessage = async (content: string) => {
    if (!profile || !conversationId) return;

    try {
      const { error } = await supabase.from("direct_messages").insert({
        conversation_id: conversationId,
        author_id: profile.id,
        content,
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (profile) {
      fetchConversations();
    }
  }, [profile, fetchConversations]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`direct_messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "direct_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, fetchMessages]);

  return {
    conversations,
    loading,
    messages,
    loadingMessages,
    startConversation,
    sendMessage,
    currentUser: profile,
  };
};
