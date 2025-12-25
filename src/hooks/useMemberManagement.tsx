import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useMemberManagement = (serverId: string | undefined) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const kickMember = async (memberId: string, memberName: string) => {
    if (!serverId) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("server_members")
        .delete()
        .eq("server_id", serverId)
        .eq("profile_id", memberId);

      if (error) {
        throw error;
      }

      toast({
        title: `Kicked ${memberName}`,
        description: "They have been removed from the server.",
      });
    } catch (error: any) {
      console.error("Error kicking member:", error);
      toast({
        title: "Error kicking member",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const banMember = async (memberId: string, memberName: string) => {
    await kickMember(memberId, memberName);
    toast({
      title: `Banned ${memberName}`,
      description:
        "User has been kicked. (Ban list implementation pending DB update).",
    });
  };

  return {
    kickMember,
    banMember,
    loading,
  };
};
