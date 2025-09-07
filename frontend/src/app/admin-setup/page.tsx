"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-hot-toast";

export default function AdminSetupPage() {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [setupStatus, setSetupStatus] = useState<any>(null);
  const [formData, setFormData] = useState({
    email: "tusharrajpara00@gmail.com",
    password: "",
    name: "System Admin",
  });

  const checkSetup = async () => {
    try {
      setChecking(true);
      const response = await fetch(
        "http://localhost:8000/api/admin/check-setup",
        {
          method: "POST",
        }
      );
      const result = await response.json();
      setSetupStatus(result);

      if (result.setupComplete) {
        toast.success("Admin setup is complete!");
      } else {
        toast("Admin setup required", {
          icon: "ℹ️",
        });
      }
    } catch (error) {
      toast.error("Failed to check setup status");
      console.error("Error checking setup:", error);
    } finally {
      setChecking(false);
    }
  };

  const initializeAdmin = async () => {
    if (!formData.email || !formData.password || !formData.name) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:8000/api/admin/initialize",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message);
        setSetupStatus({
          setupComplete: true,
          adminUser: result.data,
        });
        // Clear password for security
        setFormData({ ...formData, password: "" });
      } else {
        toast.error(result.message || "Failed to initialize admin");
      }
    } catch (error) {
      toast.error("Failed to initialize admin");
      console.error("Error initializing admin:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Admin Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={checkSetup}
              disabled={checking}
              variant="outline"
              className="w-full"
            >
              {checking ? "Checking..." : "Check Setup Status"}
            </Button>

            {setupStatus && (
              <div
                className={`p-4 rounded-lg ${
                  setupStatus.setupComplete
                    ? "bg-green-50 border border-green-200"
                    : "bg-yellow-50 border border-yellow-200"
                }`}
              >
                <p className="font-medium">{setupStatus.message}</p>
                {setupStatus.adminUser && (
                  <div className="mt-2 text-sm">
                    <p>
                      <strong>Email:</strong> {setupStatus.adminUser.email}
                    </p>
                    <p>
                      <strong>Name:</strong> {setupStatus.adminUser.name}
                    </p>
                    <p>
                      <strong>Role:</strong> {setupStatus.adminUser.role}
                    </p>
                    <p>
                      <strong>Permissions:</strong>{" "}
                      {setupStatus.adminUser.permissionCount}
                    </p>
                  </div>
                )}
              </div>
            )}

            {setupStatus && !setupStatus.setupComplete && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="admin@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Enter secure password"
                  />
                </div>

                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Admin Name"
                  />
                </div>

                <Button
                  onClick={initializeAdmin}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Initializing..." : "Initialize Admin User"}
                </Button>
              </div>
            )}

            {setupStatus && setupStatus.setupComplete && (
              <div className="text-center">
                <p className="mb-4">Admin setup is complete! You can now:</p>
                <div className="space-y-2">
                  <Button
                    onClick={() => (window.location.href = "/auth")}
                    className="w-full"
                  >
                    Go to Login
                  </Button>
                  <Button
                    onClick={() => (window.location.href = "/dashboard")}
                    variant="outline"
                    className="w-full"
                  >
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
