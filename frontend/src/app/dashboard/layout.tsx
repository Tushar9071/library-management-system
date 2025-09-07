"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  Users,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  Shield,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { logOut } from "@/hooks/auth.hooks";
import { useHasPermission } from "@/hooks/usePermissions";
import { useAuthSync } from "@/hooks/useAuthSync";
import { userStore } from "@/store/useUserRoleStore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();

  // Sync authentication state
  useAuthSync();

  // Get user info for debugging
  const { id: userId, email, role, name } = userStore();

  // Sync authentication state
  useAuthSync();

  // Permission checks
  const hasReadBooks = useHasPermission("READ_BOOKS");
  const hasCreateBooks = useHasPermission("CREATE_BOOKS");
  const hasUpdateBooks = useHasPermission("UPDATE_BOOKS");
  const hasReadUsers = useHasPermission("READ_USERS");
  const hasCreateUsers = useHasPermission("CREATE_USERS");
  const hasReadRoles = useHasPermission("READ_ROLES");
  const hasManageSettings = useHasPermission("MANAGE_PERMISSIONS");
  const hasBorrowBooks = useHasPermission("BORROW_BOOKS");

  // Check if user is admin (has create/update permissions, but not just read)
  const isAdmin = hasCreateBooks || hasUpdateBooks || hasCreateUsers;

  // Debug log to check permissions
  useEffect(() => {
    console.log("=== PERMISSION DEBUG ===");
    console.log("Current user:", { userId, email, role, name });
    console.log("Current permissions:", {
      hasReadBooks,
      hasCreateBooks,
      hasUpdateBooks,
      hasReadUsers,
      hasCreateUsers,
      hasReadRoles,
      hasManageSettings,
      hasBorrowBooks,
      isAdmin,
    });
    console.log("Navigation items that will be shown:", getFilteredNavItems());
    console.log("========================");
  }, [
    userId,
    email,
    role,
    name,
    hasReadBooks,
    hasCreateBooks,
    hasUpdateBooks,
    hasReadUsers,
    hasCreateUsers,
    hasReadRoles,
    hasManageSettings,
    hasBorrowBooks,
    isAdmin,
  ]);

  // Ensure this only runs on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Filter navigation items based on permissions
  const getFilteredNavItems = () => {
    const allNavItems: Array<{
      href: string;
      icon: any;
      label: string;
      permission: string | null;
    }> = [
      { href: "/dashboard", icon: Home, label: "Dashboard", permission: null }, // Always show dashboard
    ];

    // Add books section
    if (hasReadBooks) {
      if (isAdmin) {
        // Show management interface for admins
        allNavItems.push({
          href: "/dashboard/books",
          icon: BookOpen,
          label: "Manage Books",
          permission: "READ_BOOKS",
        });
      } else {
        // Show browse interface for students/regular users
        allNavItems.push({
          href: "/dashboard/books",
          icon: BookOpen,
          label: "Browse Books",
          permission: "READ_BOOKS",
        });
      }
    }

    // Add borrowing features for all users who can borrow
    if (hasBorrowBooks) {
      allNavItems.push(
        {
          href: "/dashboard/my-books",
          icon: BookOpen,
          label: "My Books",
          permission: "BORROW_BOOKS",
        },
        {
          href: "/dashboard/borrowed",
          icon: BookOpen,
          label: "Borrowed Books",
          permission: "BORROW_BOOKS",
        }
      );
    }

    // Admin-only sections
    if (hasReadUsers) {
      allNavItems.push({
        href: "/dashboard/users",
        icon: Users,
        label: "Manage Users",
        permission: "READ_USERS",
      });
    }

    if (hasReadRoles) {
      allNavItems.push({
        href: "/dashboard/roles",
        icon: Shield,
        label: "Manage Roles",
        permission: "READ_ROLES",
      });
    }

    if (hasManageSettings) {
      allNavItems.push({
        href: "/dashboard/settings",
        icon: Settings,
        label: "Settings",
        permission: "MANAGE_PERMISSIONS",
      });
    }

    return allNavItems.filter((item) => {
      // Always show items without permission requirements
      if (!item.permission) return true;

      // Check specific permissions
      switch (item.permission) {
        case "READ_BOOKS":
          return hasReadBooks;
        case "BORROW_BOOKS":
          return hasBorrowBooks;
        case "READ_USERS":
          return hasReadUsers;
        case "READ_ROLES":
          return hasReadRoles;
        case "MANAGE_PERMISSIONS":
          return hasManageSettings;
        default:
          return false;
      }
    });
  };

  const navItems = getFilteredNavItems();

  // Don't render navigation links until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex">
        <div className="w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 shadow-lg"></div>
        <main className="flex-1 flex flex-col">
          <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <ThemeToggle />
            </div>
          </header>
          <div className="flex-1 p-6">{children}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 shadow-lg transform transition-transform duration-300 ease-in-out flex flex-col
        ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }
      `}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 dark:bg-blue-500 p-2 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                Library
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Management
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200
                  ${isActive}
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }
                `}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-screen lg:min-h-0">
        <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-4 flex items-center justify-between shadow-sm flex-shrink-0">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <ThemeToggle />
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Admin
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-2 w-full"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logOut}
                  className="text-red-600 dark:text-red-400"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
