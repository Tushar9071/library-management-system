"use client";

import { useState } from "react";
import {
  BookOpen,
  Calendar,
  Home,
  Search,
  Settings,
  Users,
  BarChart3,
  Clock,
  Star,
  FileText,
  Database,
  Shield,
  Bell,
  HelpCircle,
  LogOut,
  User,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Link from "next/link";

// Mock user data - in real app this would come from auth context
const mockUser = {
  id: "1",
  name: "John Doe",
  email: "john@university.edu",
  role: "student", // student, faculty, admin, public
  avatar: "/placeholder.svg?height=40&width=40",
};

export function AppSidebar() {
  const [user] = useState(mockUser);

  const getNavigationItems = () => {
    const commonItems = [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
      },
      {
        title: "Search Catalog",
        url: "/dashboard/search",
        icon: Search,
      },
    ];

    switch (user.role) {
      case "admin":
        return [
          ...commonItems,
          {
            title: "User Management",
            url: "/dashboard/users",
            icon: Users,
            items: [
              { title: "All Users", url: "/dashboard/users" },
              { title: "Add User", url: "/dashboard/users/add" },
              { title: "User Roles", url: "/dashboard/users/roles" },
            ],
          },
          {
            title: "Book Management",
            url: "/dashboard/books",
            icon: BookOpen,
            items: [
              { title: "All Books", url: "/dashboard/books" },
              { title: "Add Book", url: "/dashboard/books/add" },
              { title: "Categories", url: "/dashboard/books/categories" },
              { title: "Publishers", url: "/dashboard/books/publishers" },
            ],
          },
          {
            title: "Transactions",
            url: "/dashboard/transactions",
            icon: FileText,
            items: [
              { title: "Borrowing", url: "/dashboard/transactions/borrowing" },
              { title: "Returns", url: "/dashboard/transactions/returns" },
              {
                title: "Reservations",
                url: "/dashboard/transactions/reservations",
              },
              { title: "Overdue", url: "/dashboard/transactions/overdue" },
            ],
          },
          {
            title: "Analytics",
            url: "/dashboard/analytics",
            icon: BarChart3,
          },
          {
            title: "System Settings",
            url: "/dashboard/settings",
            icon: Settings,
            items: [
              { title: "General", url: "/dashboard/settings/general" },
              {
                title: "Library Policies",
                url: "/dashboard/settings/policies",
              },
              {
                title: "Notifications",
                url: "/dashboard/settings/notifications",
              },
              { title: "Backup", url: "/dashboard/settings/backup" },
            ],
          },
        ];

      case "faculty":
        return [
          ...commonItems,
          {
            title: "My Books",
            url: "/dashboard/my-books",
            icon: BookOpen,
          },
          {
            title: "Course Reserves",
            url: "/dashboard/course-reserves",
            icon: Calendar,
            items: [
              { title: "Current Courses", url: "/dashboard/course-reserves" },
              { title: "Add Reserve", url: "/dashboard/course-reserves/add" },
              {
                title: "Reserve History",
                url: "/dashboard/course-reserves/history",
              },
            ],
          },
          {
            title: "Research",
            url: "/dashboard/research",
            icon: Database,
            items: [
              { title: "Saved Papers", url: "/dashboard/research/papers" },
              {
                title: "Research Databases",
                url: "/dashboard/research/databases",
              },
              { title: "Citation Tools", url: "/dashboard/research/citations" },
            ],
          },
          {
            title: "Reservations",
            url: "/dashboard/reservations",
            icon: Calendar,
          },
          {
            title: "History",
            url: "/dashboard/history",
            icon: Clock,
          },
          {
            title: "Favorites",
            url: "/dashboard/favorites",
            icon: Star,
          },
        ];

      case "student":
        return [
          ...commonItems,
          {
            title: "My Books",
            url: "/dashboard/my-books",
            icon: BookOpen,
          },
          {
            title: "Reservations",
            url: "/dashboard/reservations",
            icon: Calendar,
          },
          {
            title: "History",
            url: "/dashboard/history",
            icon: Clock,
          },
          {
            title: "Favorites",
            url: "/dashboard/favorites",
            icon: Star,
          },
        ];

      case "public":
        return [
          {
            title: "Browse Catalog",
            url: "/dashboard/search",
            icon: Search,
          },
          {
            title: "Library Info",
            url: "/dashboard/info",
            icon: HelpCircle,
            items: [
              { title: "Hours & Location", url: "/dashboard/info/hours" },
              { title: "Services", url: "/dashboard/info/services" },
              { title: "Policies", url: "/dashboard/info/policies" },
              { title: "Contact", url: "/dashboard/info/contact" },
            ],
          },
        ];

      default:
        return commonItems;
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-2 py-1">
              <BookOpen className="h-6 w-6" />
              <div className="flex flex-col">
                <span className="font-semibold text-sm">LibraryMS</span>
                <span className="text-xs text-muted-foreground">
                  Management System
                </span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.items ? (
                    <Collapsible className="group/collapsible">
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton>
                          <item.icon />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild>
                                <Link href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user.role !== "public" && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Account</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/dashboard/profile">
                        <User />
                        <span>Profile</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/dashboard/notifications">
                        <Bell />
                        <span>Notifications</span>
                        <Badge variant="destructive" className="ml-auto">
                          3
                        </Badge>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {user.role === "admin" && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/dashboard/admin">
                          <Shield />
                          <span>Admin Panel</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={user.avatar || "/placeholder.svg"}
                      alt={user.name}
                    />
                    <AvatarFallback className="rounded-lg">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs capitalize">
                      {user.role}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}>
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Account</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Help</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
