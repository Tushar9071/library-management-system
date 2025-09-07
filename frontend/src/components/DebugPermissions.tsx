"use client";
import { useEffect, useState } from "react";
import { userStore } from "@/store/useUserRoleStore";
import { usePermissions } from "@/hooks/usePermissions";

export default function DebugPermissions() {
  const { id, email, role, name } = userStore();
  const { permissions, loading, error } = usePermissions();
  const [localStorageData, setLocalStorageData] = useState<any>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLocalStorageData({
        userData: localStorage.getItem("userData"),
        authToken: localStorage.getItem("authToken"),
        token: localStorage.getItem("token"),
      });
    }
  }, []);

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Debug Information</h2>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">User Store Data:</h3>
          <pre className="bg-white dark:bg-gray-900 p-2 rounded text-sm">
            {JSON.stringify({ id, email, role, name }, null, 2)}
          </pre>
        </div>

        <div>
          <h3 className="font-semibold">LocalStorage Data:</h3>
          <pre className="bg-white dark:bg-gray-900 p-2 rounded text-sm">
            {JSON.stringify(localStorageData, null, 2)}
          </pre>
        </div>

        <div>
          <h3 className="font-semibold">Permissions Status:</h3>
          <p>Loading: {loading ? "Yes" : "No"}</p>
          <p>Error: {error || "None"}</p>
          <p>Permission Count: {permissions.length}</p>
        </div>

        <div>
          <h3 className="font-semibold">Permissions List:</h3>
          <pre className="bg-white dark:bg-gray-900 p-2 rounded text-sm max-h-40 overflow-y-auto">
            {JSON.stringify(permissions, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
