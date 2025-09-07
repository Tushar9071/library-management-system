"use client";

import { usePermissions } from "@/hooks/usePermissions";
import { getCurrentUser } from "@/lib/api";
import { useEffect, useState } from "react";

export function PermissionDebug() {
  const { permissions, loading, error, hasPermission } = usePermissions();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const user = getCurrentUser();
    setUserData(user);
  }, []);

  const testPermissions = [
    "CREATE_BOOKS",
    "READ_BOOKS",
    "UPDATE_BOOKS",
    "DELETE_BOOKS",
    "CREATE_USERS",
    "READ_USERS",
    "CREATE_ROLES",
    "READ_ROLES",
  ];

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h3 className="text-lg font-bold mb-4">Permission Debug</h3>

      <div className="mb-4">
        <h4 className="font-semibold">User Data:</h4>
        <pre className="text-xs bg-white dark:bg-gray-900 p-2 rounded">
          {JSON.stringify(userData, null, 2)}
        </pre>
      </div>

      <div className="mb-4">
        <h4 className="font-semibold">Auth Token:</h4>
        <p className="text-xs">
          {localStorage.getItem("authToken") ? "Present" : "Missing"}
        </p>
      </div>

      <div className="mb-4">
        <h4 className="font-semibold">Permissions Status:</h4>
        <p>Loading: {loading ? "Yes" : "No"}</p>
        <p>Error: {error || "None"}</p>
        <p>Count: {permissions.length}</p>
      </div>

      <div className="mb-4">
        <h4 className="font-semibold">Permission Tests:</h4>
        {testPermissions.map((perm) => (
          <div key={perm} className="flex justify-between">
            <span>{perm}:</span>
            <span
              className={
                hasPermission(perm) ? "text-green-600" : "text-red-600"
              }
            >
              {hasPermission(perm) ? "✅" : "❌"}
            </span>
          </div>
        ))}
      </div>

      <div>
        <h4 className="font-semibold">All Permissions:</h4>
        <div className="text-xs max-h-32 overflow-y-auto">
          {permissions.map((perm) => (
            <div key={perm.id}>{perm.name}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
