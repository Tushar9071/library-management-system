"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Permission, UserPermissions, PERMISSIONS } from "@/types/permissions";
import { userStore } from "@/store/useUserRoleStore";

interface PermissionContextType extends UserPermissions {
  loading: boolean;
  error: string | null;
  refreshPermissions: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(
  undefined
);

export function PermissionProvider({ children }: { children: ReactNode }) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id: userId } = userStore();

  const fetchUserPermissions = async () => {
    if (!userId) {
      console.log("No userId found, cannot fetch permissions");
      setPermissions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Import the API utility dynamically to avoid SSR issues
      const { apiGet } = await import("@/lib/api");

      const response = await apiGet(`/permissions/user/${userId}`);

      if (response.ok) {
        const result = await response.json();
        // The backend returns the permissions directly or in a data field
        const userPermissions = result.data || result;
        console.log("=== FETCHED PERMISSIONS ===");
        console.log("User ID:", userId || "1 (fallback)");
        console.log("Raw API response:", result);
        console.log("Processed permissions:", userPermissions);
        console.log("============================");
        setPermissions(Array.isArray(userPermissions) ? userPermissions : []);
        setError(null);
      } else {
        throw new Error("Failed to fetch permissions");
      }
    } catch (err) {
      console.error("Error fetching permissions:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch permissions"
      );
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permissionName: string): boolean => {
    return permissions.some((p) => p.name === permissionName);
  };

  const canCreate = (resource: string): boolean => {
    return hasPermission(`CREATE_${resource.toUpperCase()}`);
  };

  const canRead = (resource: string): boolean => {
    return hasPermission(`READ_${resource.toUpperCase()}`);
  };

  const canUpdate = (resource: string): boolean => {
    return hasPermission(`UPDATE_${resource.toUpperCase()}`);
  };

  const canDelete = (resource: string): boolean => {
    return hasPermission(`DELETE_${resource.toUpperCase()}`);
  };

  useEffect(() => {
    fetchUserPermissions();
  }, [userId]);

  const value: PermissionContextType = {
    permissions,
    loading,
    error,
    hasPermission,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    refreshPermissions: fetchUserPermissions,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions(): PermissionContextType {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error("usePermissions must be used within a PermissionProvider");
  }
  return context;
}

// Hook for checking specific permissions
export function useHasPermission(permissionName: string): boolean {
  const { hasPermission } = usePermissions();
  return hasPermission(permissionName);
}

// Hook for resource-based permissions
export function useResourcePermissions(resource: string) {
  const { canCreate, canRead, canUpdate, canDelete } = usePermissions();

  return {
    canCreate: canCreate(resource),
    canRead: canRead(resource),
    canUpdate: canUpdate(resource),
    canDelete: canDelete(resource),
  };
}
