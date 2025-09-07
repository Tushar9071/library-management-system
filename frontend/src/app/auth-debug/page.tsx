"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-hot-toast";

export default function AuthDebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loginData, setLoginData] = useState({
    email: "tusharrajpara00@gmail.com",
    password: "admin123",
  });

  useEffect(() => {
    checkLocalStorage();
  }, []);

  const checkLocalStorage = () => {
    const token = localStorage.getItem("token");
    const authToken = localStorage.getItem("authToken");
    const user = localStorage.getItem("user");

    setDebugInfo({
      hasToken: !!token,
      hasAuthToken: !!authToken,
      hasUser: !!user,
      tokenLength: token ? token.length : 0,
      authTokenLength: authToken ? authToken.length : 0,
      tokenPreview: token ? token.substring(0, 20) + "..." : "none",
      authTokenPreview: authToken ? authToken.substring(0, 20) + "..." : "none",
      userInfo: user ? JSON.parse(user) : null,
    });
  };

  const testLogin = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Login successful!");
        console.log("Login response:", result);

        // Store the token
        if (result.token) {
          localStorage.setItem("token", result.token);
          localStorage.setItem("authToken", result.token);
        }
        if (result.user) {
          localStorage.setItem("user", JSON.stringify(result.user));
        }

        checkLocalStorage();
      } else {
        toast.error(result.message || "Login failed");
        console.log("Login error:", result);
      }
    } catch (error) {
      toast.error("Login request failed");
      console.error("Login error:", error);
    }
  };

  const testApiCall = async () => {
    try {
      const token =
        localStorage.getItem("authToken") || localStorage.getItem("token");

      if (!token) {
        toast.error("No token found. Please login first.");
        return;
      }

      const response = await fetch(
        "http://localhost:8000/api/books?page=1&limit=5",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast.success("API call successful!");
        console.log("API response:", result);
      } else {
        toast.error(`API call failed: ${result.message}`);
        console.log("API error:", result);
      }
    } catch (error) {
      toast.error("API request failed");
      console.error("API error:", error);
    }
  };

  const clearStorage = () => {
    localStorage.clear();
    checkLocalStorage();
    toast.success("Storage cleared");
  };

  const checkAdminSetup = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/admin/check-setup",
        {
          method: "POST",
        }
      );
      const result = await response.json();

      if (response.ok) {
        toast.success("Admin check successful");
        console.log("Admin setup status:", result);
      } else {
        toast.error("Admin check failed");
        console.log("Admin check error:", result);
      }
    } catch (error) {
      toast.error("Admin check request failed");
      console.error("Admin check error:", error);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center">
          Authentication Debug Tool
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Login Test */}
          <Card>
            <CardHeader>
              <CardTitle>Test Login</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={loginData.email}
                  onChange={(e) =>
                    setLoginData({ ...loginData, email: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({ ...loginData, password: e.target.value })
                  }
                />
              </div>
              <Button onClick={testLogin} className="w-full">
                Test Login
              </Button>
            </CardContent>
          </Card>

          {/* Storage Info */}
          <Card>
            <CardHeader>
              <CardTitle>Local Storage Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                <p>
                  <strong>Has Token:</strong> {debugInfo.hasToken ? "✅" : "❌"}
                </p>
                <p>
                  <strong>Has Auth Token:</strong>{" "}
                  {debugInfo.hasAuthToken ? "✅" : "❌"}
                </p>
                <p>
                  <strong>Has User:</strong> {debugInfo.hasUser ? "✅" : "❌"}
                </p>
                <p>
                  <strong>Token Length:</strong> {debugInfo.tokenLength}
                </p>
                <p>
                  <strong>Auth Token Length:</strong>{" "}
                  {debugInfo.authTokenLength}
                </p>
                <p>
                  <strong>Token Preview:</strong> {debugInfo.tokenPreview}
                </p>
                <p>
                  <strong>Auth Token Preview:</strong>{" "}
                  {debugInfo.authTokenPreview}
                </p>
                {debugInfo.userInfo && (
                  <div>
                    <strong>User Info:</strong>
                    <pre className="text-xs bg-gray-100 p-2 rounded mt-1">
                      {JSON.stringify(debugInfo.userInfo, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button onClick={checkLocalStorage} variant="outline" size="sm">
                  Refresh
                </Button>
                <Button onClick={clearStorage} variant="destructive" size="sm">
                  Clear Storage
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* API Test */}
          <Card>
            <CardHeader>
              <CardTitle>Test API Calls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={testApiCall} className="w-full">
                Test Books API
              </Button>
              <Button
                onClick={checkAdminSetup}
                className="w-full"
                variant="outline"
              >
                Check Admin Setup
              </Button>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Debug Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>First, check admin setup status</li>
                <li>
                  If no admin exists, go to{" "}
                  <a href="/admin-setup" className="text-blue-600 underline">
                    /admin-setup
                  </a>
                </li>
                <li>Create admin user with email and password</li>
                <li>Come back here and test login</li>
                <li>Check if token is stored properly</li>
                <li>Test API calls to see if authentication works</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
