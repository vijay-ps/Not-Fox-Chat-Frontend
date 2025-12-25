import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ServerRole {
  id: string;
  server_id: string;
  name: string;
  color: string;
  permissions: Record<string, boolean>;
  position: number;
  created_at: string;
}

export const useRoles = (serverId: string | undefined) => {
  const { toast } = useToast();
  const [roles, setRoles] = useState<ServerRole[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRoles = useCallback(async () => {
    if (!serverId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("server_roles")
        .select("*")
        .eq("server_id", serverId)
        .order("position", { ascending: false });

      if (error) throw error;
      setRoles(data as ServerRole[]);
    } catch (error: any) {
      console.error("Error fetching roles:", error);
      toast({
        title: "Error fetching roles",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [serverId, toast]);

  const createRole = async (name: string, color: string) => {
    if (!serverId) return;
    try {
      const { data, error } = await supabase
        .from("server_roles")
        .insert({
          server_id: serverId,
          name,
          color,
          permissions: {
            can_manage_messages: false,
            can_kick_members: false,
            can_ban_members: false,
            can_manage_channels: false,
            can_manage_roles: false,
          },
          position: roles.length,
        })
        .select()
        .single();

      if (error) throw error;

      setRoles([...roles, data as ServerRole]);
      toast({
        title: "Role created",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error creating role",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateRole = async (roleId: string, updates: Partial<ServerRole>) => {
    try {
      const { data, error } = await supabase
        .from("server_roles")
        .update(updates)
        .eq("id", roleId)
        .select()
        .single();

      if (error) throw error;

      setRoles(roles.map((r) => (r.id === roleId ? (data as ServerRole) : r)));
      toast({
        title: "Role updated",
      });
    } catch (error: any) {
      toast({
        title: "Error updating role",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteRole = async (roleId: string) => {
    try {
      const { error } = await supabase
        .from("server_roles")
        .delete()
        .eq("id", roleId);

      if (error) throw error;

      setRoles(roles.filter((r) => r.id !== roleId));
      toast({
        title: "Role deleted",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting role",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    roles,
    loading,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
  };
};
