"use client"

import type React from "react"
import Link from "next/link"
import { BookOpen, Users, User, Home, Settings, LogOut, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle" // Import ThemeToggle

// This is a placeholder for user role. In a real application, this would come from your authentication system.
const currentUserRole = "librarian" // Can be "librarian", "student", or "public"

const navItems = {
  librarian: [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Manage Books", href: "/dashboard/books", icon: BookOpen },
    { name: "Manage Users", href: "/dashboard/users", icon: Users },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ],
  student: [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "My Books", href: "/dashboard/my-books", icon: BookOpen },
    { name: "Profile", href: "/dashboard/profile", icon: User },
  ],
  public: [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Browse Catalog", href: "/dashboard/catalog", icon: BookOpen },
  ],
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const userNavigation = navItems[currentUserRole as keyof typeof navItems] || []

  // In a real app, you'd check session here and redirect if unauthenticated
  // if (!userNavigation.length && currentUserRole !== "public") {
  //   redirect("/auth");
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 shadow-lg flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 dark:bg-blue-500 p-2 rounded-full shadow-md">
              <BookOpen className="text-white w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Library Portal</h2>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {userNavigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors",
                // Add active state logic here based on current path
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-slate-700">
          {/* You can add a dedicated logout button here if preferred, or rely on the dropdown */}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-4 flex items-center justify-between shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
          <div className="flex items-center gap-4">
            <ThemeToggle /> {/* Add ThemeToggle here */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 cursor-pointer rounded-full p-1 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800">
                  <div className="w-8 h-8 rounded-full bg-blue-200 dark:bg-blue-700 flex items-center justify-center text-blue-800 dark:text-blue-200 font-medium">
                    JD
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 text-sm hidden sm:inline">
                    John Doe ({currentUserRole})
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <Link href="/dashboard/profile" className="flex items-center gap-2 w-full">
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/dashboard/settings" className="flex items-center gap-2 w-full">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <button
                    onClick={() => console.log("Logging out...")}
                    className="flex items-center gap-2 w-full text-red-600 dark:text-red-400"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 overflow-auto">{children}</div>
      </main>
    </div>
  )
}
