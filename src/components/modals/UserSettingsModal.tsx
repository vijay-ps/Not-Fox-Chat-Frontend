import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, LogOut, User, Shield, Bell, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignOut: () => void;
}

const UserSettingsModal = ({
  isOpen,
  onClose,
  onSignOut,
}: UserSettingsModalProps) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [view, setView] = useState<"menu" | "edit_profile">("menu");
  const [loading, setLoading] = useState(false);

  // Edit Profile State
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Reset state when opening
  useEffect(() => {
    if (isOpen && profile) {
      setDisplayName(profile.display_name || profile.username || "");
      setAvatarUrl(profile.avatar_url || "");
      setView("menu");
    }
  }, [isOpen, profile]);

  const handleSaveProfile = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName,
          avatar_url: avatarUrl,
        })
        .eq("id", profile.id);

      if (error) throw error;

      toast({
        title: "Profile updated!",
        description: "Your changes have been saved.",
      });
      setView("menu");
      // Profile update should trigger realtime subscription in useAuth eventually, or page reload
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !profile) return null;

  if (view === "edit_profile") {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md glass rounded-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display text-foreground">
                Edit Profile
              </h2>
              <button
                onClick={() => setView("menu")}
                className="text-sm text-primary hover:underline"
              >
                Back
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-secondary rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Avatar URL
                </label>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-secondary rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="https://..."
                />
              </div>

              {/* Preview */}
              <div className="flex items-center gap-4 mt-4 p-4 bg-secondary/30 rounded-lg">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) =>
                      (e.currentTarget.src = "https://github.com/shadcn.png")
                    }
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-foreground">
                    {displayName}
                  </div>
                  <div className="text-xs text-muted-foreground">Preview</div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setView("menu")}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSaveProfile}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-sm glass rounded-2xl p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display text-foreground">Settings</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full hover:bg-secondary"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>

          <div className="flex flex-col items-center mb-8">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-2xl text-primary-foreground font-bold">
                {(profile.display_name || profile.username)
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-semibold text-foreground">
                {profile.display_name || profile.username}
              </p>
              <p className="text-sm text-muted-foreground">
                @{profile.username}
              </p>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            {[
              { icon: User, label: "Edit Profile", action: "edit_profile" },
              { icon: Shield, label: "Privacy & Safety", action: "privacy" },
              { icon: Bell, label: "Notifications", action: "notifications" },
              { icon: Palette, label: "Appearance", action: "appearance" },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  if (item.action === "edit_profile") setView("edit_profile");
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary/50 text-foreground transition-colors text-left"
              >
                <item.icon className="w-5 h-5 text-muted-foreground" />
                {item.label}
              </button>
            ))}
          </div>

          <Button variant="destructive" className="w-full" onClick={onSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UserSettingsModal;
