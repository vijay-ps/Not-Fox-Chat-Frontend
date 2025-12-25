import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "@/hooks/use-toast";

import { Server, Channel } from "@/types";
export type { Server, Channel };

export const useServers = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [servers, setServers] = useState<Server[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServers = async () => {
    if (!profile) return;
    try {
      const { api } = await import("@/services/api");
      const data = await api.servers.list();
      setServers(data || []);
    } catch (error) {
      console.error("Error fetching servers:", error);
    }
    setLoading(false);
  };

  const fetchChannels = async (serverId: string) => {
    try {
      const { api } = await import("@/services/api");
      const data = await api.servers.getChannels(serverId);

      setChannels(data || []);
    } catch (error) {
      console.error("Error fetching channels:", error);
    }
  };

  const createServer = async (name: string, description?: string) => {
    if (!profile) return null;

    try {
      const { api } = await import("@/services/api");
      const server = await api.servers.create({ name, description });

      if (server.error) throw new Error(server.error);

      await fetchServers();
      return server as Server;
    } catch (error: any) {
      toast({
        title: "Error creating server",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const joinServer = async (inviteCode: string) => {
    if (!profile) return null;

    try {
      const { api } = await import("@/services/api");
      const server = await api.servers.join(inviteCode);

      if (server.error) throw new Error(server.error);

      toast({
        title: "Joined server!",
        description: `You are now a member of ${server.name}`,
      });

      await fetchServers();
      return server as Server;
    } catch (error: any) {
      toast({
        title: "Error joining server",
        description: error.message || "Failed to join server",
        variant: "destructive",
      });
      return error.server ? (error.server as Server) : null;
    }
  };

  const createChannel = async (
    serverId: string,
    name: string,
    type: Channel["type"] = "text"
  ) => {
    try {
      const { api } = await import("@/services/api");
      const channel = await api.channels.create({ serverId, name, type });

      if (channel.error) throw new Error(channel.error);

      await fetchChannels(serverId);
      return channel as Channel;
    } catch (error: any) {
      toast({
        title: "Error creating channel",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  useEffect(() => {
    if (profile) {
      fetchServers();
    }
  }, [profile]);

  return {
    servers,
    channels,
    loading,
    fetchServers,
    fetchChannels,
    createServer,
    joinServer,
    createChannel,
  };
};
