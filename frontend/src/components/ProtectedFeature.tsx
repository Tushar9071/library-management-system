"use client";
import { ReactNode } from "react";
import { useHasPermission } from "@/hooks/usePermissions";

interface ProtectedFeatureProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
  requireAll?: boolean; // If true, user must have all permissions
}

export function ProtectedFeature({
  permission,
  children,
  fallback = null,
  requireAll = false,
}: ProtectedFeatureProps) {
  const permissions = Array.isArray(permission) ? permission : [permission];

  const hasPermissions = permissions.map((p) => useHasPermission(p));

  const hasAccess = requireAll
    ? hasPermissions.every(Boolean)
    : hasPermissions.some(Boolean);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Specific components for common use cases
interface ResourceProtectedProps {
  resource: string;
  action: "create" | "read" | "update" | "delete";
  children: ReactNode;
  fallback?: ReactNode;
}

export function ProtectedAction({
  resource,
  action,
  children,
  fallback,
}: ResourceProtectedProps) {
  const permission = `${action.toUpperCase()}_${resource.toUpperCase()}`;

  return (
    <ProtectedFeature permission={permission} fallback={fallback}>
      {children}
    </ProtectedFeature>
  );
}

// HOC for protecting entire components
export function withPermission(
  Component: React.ComponentType<any>,
  permission: string
) {
  return function PermissionWrappedComponent(props: any) {
    const hasPermission = useHasPermission(permission);

    if (!hasPermission) {
      return (
        <div className="flex items-center justify-center p-8 text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">🔒</div>
            <p>Access Denied</p>
            <p className="text-sm">
              You don't have permission to access this feature.
            </p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
