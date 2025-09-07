"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Permission } from "@/types/permissions";
import toast from "react-hot-toast";

interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}

interface PermissionManagerProps {
  roleId: number;
  onClose: () => void;
}

export function PermissionManager({ roleId, onClose }: PermissionManagerProps) {
  const [role, setRole] = useState<Role | null>(null);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [roleId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch all permissions
      const permissionsResponse = await fetch("/api/permissions", {
        credentials: "include",
      });

      // Fetch role permissions
      const roleResponse = await fetch(`/api/permissions/role/${roleId}`, {
        credentials: "include",
      });

      if (permissionsResponse.ok && roleResponse.ok) {
        const allPerms = await permissionsResponse.json();
        const rolePerms = await roleResponse.json();

        setAllPermissions(allPerms);
        setSelectedPermissions(rolePerms.map((p: Permission) => p.id));
      } else {
        throw new Error("Failed to fetch permissions");
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.error("Failed to load permissions");
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (permissionId: number, checked: boolean) => {
    if (checked) {
      setSelectedPermissions((prev) => [...prev, permissionId]);
    } else {
      setSelectedPermissions((prev) =>
        prev.filter((id) => id !== permissionId)
      );
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const response = await fetch(`/api/permissions/role/${roleId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          permissionIds: selectedPermissions,
        }),
        credentials: "include",
      });

      if (response.ok) {
        toast.success("Permissions updated successfully");
        onClose();
      } else {
        throw new Error("Failed to update permissions");
      }
    } catch (error) {
      console.error("Error saving permissions:", error);
      toast.error("Failed to save permissions");
    } finally {
      setSaving(false);
    }
  };

  // Group permissions by category
  const groupedPermissions = allPermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p>Loading permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Manage Role Permissions</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {Object.entries(groupedPermissions).map(([category, permissions]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="capitalize text-lg">
                {category} Permissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {permissions.map((permission) => (
                  <div
                    key={permission.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`permission-${permission.id}`}
                      checked={selectedPermissions.includes(permission.id)}
                      onCheckedChange={(checked) =>
                        handlePermissionChange(
                          permission.id,
                          checked as boolean
                        )
                      }
                    />
                    <label
                      htmlFor={`permission-${permission.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {permission.name.replace(/_/g, " ")}
                          </p>
                          {permission.description && (
                            <p className="text-sm text-gray-500">
                              {permission.description}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {permission.action}
                        </Badge>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
