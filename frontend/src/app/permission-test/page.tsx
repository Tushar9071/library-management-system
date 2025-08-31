"use client";

import { PermissionDebug } from '@/components/PermissionDebug';
import { Button } from '@/components/ui/button';
import { loginUser } from '@/lib/api';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function PermissionTestPage() {
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async () => {
    setLoading(true);
    try {
      const result = await loginUser('admin@library.com', 'admin123');
      if (result.success) {
        toast.success('Admin logged in successfully!');
        // Wait a moment for state to update
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error(result.error || 'Login failed');
      }
    } catch (error) {
      toast.error('Login error');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Permission System Test</h1>
      
      <div className="mb-6 space-x-4">
        <Button onClick={handleAdminLogin} disabled={loading}>
          {loading ? 'Logging in...' : 'Login as Admin'}
        </Button>
        <Button onClick={handleLogout} variant="outline">
          Logout & Clear Storage
        </Button>
      </div>

      <PermissionDebug />
    </div>
  );
}
