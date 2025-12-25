import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRoles, ServerRole } from "@/hooks/useRoles";
import { Plus, Trash2, Shield, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface RolesModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverId: string;
}

const PERMISSIONS_LIST = [
  {
    key: "can_manage_messages",
    label: "Manage Messages",
    description: "Can delete messages sent by others",
  },
  {
    key: "can_kick_members",
    label: "Kick Members",
    description: "Can kick members from the server",
  },
  {
    key: "can_ban_members",
    label: "Ban Members",
    description: "Can ban members from the server",
  },
  {
    key: "can_manage_channels",
    label: "Manage Channels",
    description: "Can create, edit, and delete channels",
  },
  {
    key: "can_manage_roles",
    label: "Manage Roles",
    description: "Can create and edit roles",
  },
];

const PRESET_COLORS = [
  "#99AAB5", // Grey
  "#1ABC9C", // Teal
  "#2ECC71", // Green
  "#3498DB", // Blue
  "#9B59B6", // Purple
  "#E91E63", // Pink
  "#F1C40F", // Yellow
  "#E67E22", // Orange
  "#E74C3C", // Red
  "#95A5A6", // Dark Grey
];

export const RolesModal = ({ isOpen, onClose, serverId }: RolesModalProps) => {
  const { roles, loading, fetchRoles, createRole, updateRole, deleteRole } =
    useRoles(serverId);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && serverId) {
      fetchRoles();
    }
  }, [isOpen, serverId, fetchRoles]);

  useEffect(() => {
    if (roles.length > 0 && !selectedRoleId) {
      setSelectedRoleId(roles[0].id);
    }
  }, [roles, selectedRoleId]);

  const selectedRole = roles.find((r) => r.id === selectedRoleId);

  const handleCreateRole = async () => {
    await createRole("New Role", "#99AAB5");
  };

  const handlePermissionChange = (permKey: string, checked: boolean) => {
    if (!selectedRole) return;

    const newPermissions = {
      ...selectedRole.permissions,
      [permKey]: checked,
    };

    updateRole(selectedRole.id, { permissions: newPermissions });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl h-[600px] p-0 gap-0 overflow-hidden flex bg-background">
        {/* Sidebar: Role List */}
        <div className="w-64 bg-secondary/30 border-r border-border flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Roles</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCreateRole}
              title="Create Role"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRoleId(role.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                    selectedRoleId === role.id
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  )}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: role.color }}
                  />
                  <span className="truncate flex-1 text-left">{role.name}</span>
                </button>
              ))}
              {roles.length === 0 && !loading && (
                <div className="text-center p-4 text-xs text-muted-foreground">
                  No roles found. Create one!
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Main Content: Edit Role */}
        <div className="flex-1 flex flex-col bg-background min-w-0">
          {selectedRole ? (
            <div className="flex-1 flex flex-col h-full">
              <div className="p-6 border-b border-border">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  Edit Role - {selectedRole.name}
                </h2>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-6 space-y-8">
                  {/* Role Name */}
                  <div className="space-y-2">
                    <Label>Role Name</Label>
                    <Input
                      value={selectedRole.name}
                      onChange={(e) =>
                        updateRole(selectedRole.id, { name: e.target.value })
                      }
                    />
                  </div>

                  {/* Role Color */}
                  <div className="space-y-2">
                    <Label>Role Color</Label>
                    <div className="flex flex-wrap gap-2">
                      <div className="w-10 h-10 rounded border border-border flex items-center justify-center relative overflow-hidden">
                        <input
                          type="color"
                          value={selectedRole.color}
                          onChange={(e) =>
                            updateRole(selectedRole.id, {
                              color: e.target.value,
                            })
                          }
                          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                        />
                        <div
                          className="w-full h-full"
                          style={{ backgroundColor: selectedRole.color }}
                        />
                      </div>
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => updateRole(selectedRole.id, { color })}
                          className="w-10 h-10 rounded border border-border hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Permissions */}
                  <div className="space-y-4">
                    <div className="border-b border-border pb-2">
                      <Label className="text-lg">Permissions</Label>
                    </div>
                    <div className="space-y-4">
                      {PERMISSIONS_LIST.map((perm) => (
                        <div
                          key={perm.key}
                          className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/10"
                        >
                          <div>
                            <div className="font-medium text-sm">
                              {perm.label}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {perm.description}
                            </div>
                          </div>
                          <div className="flex items-center h-6">
                            {/* Simple Toggle - could use Switch if available but using native checkbox styled similar */}
                            <input
                              type="checkbox"
                              checked={!!selectedRole.permissions?.[perm.key]}
                              onChange={(e) =>
                                handlePermissionChange(
                                  perm.key,
                                  e.target.checked
                                )
                              }
                              className="w-5 h-5 accent-primary rounded cursor-pointer"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-border bg-secondary/10 flex justify-between items-center">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this role?")) {
                      deleteRole(selectedRole.id);
                      setSelectedRoleId(null);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Role
                </Button>
                <Button onClick={onClose}>Done</Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Select a role to edit
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
