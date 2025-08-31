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
  LogOut,
  User,
} from "lucide-react";
import { useHasPermission } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/types/permissions";

// Define types for navigation items
type NavigationSubItem = {
  title: string;
  url: string;
  permission?: string;
};

type NavigationItem = {
  title: string;
  url: string;
  icon: React.ComponentType<any>;
  permission?: string;
  items?: NavigationSubItem[];
};

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

  // Use permission hooks to check access
  const hasReadBooks = useHasPermission(PERMISSIONS.READ_BOOKS);
  const hasCreateBooks = useHasPermission(PERMISSIONS.CREATE_BOOKS);
  const hasReadUsers = useHasPermission(PERMISSIONS.READ_USERS);
  const hasCreateUsers = useHasPermission(PERMISSIONS.CREATE_USERS);
  const hasReadRoles = useHasPermission(PERMISSIONS.READ_ROLES);
  const hasBorrowBooks = useHasPermission(PERMISSIONS.BORROW_BOOKS);
  const hasManagePermissions = useHasPermission(PERMISSIONS.MANAGE_PERMISSIONS);

  const getNavigationItems = (): NavigationItem[] => {
    const allItems: NavigationItem[] = [
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

    // Add User Management if user has permissions
    if (hasReadUsers) {
      const userSubItems: NavigationSubItem[] = [];
      if (hasReadUsers) userSubItems.push({ title: "All Users", url: "/dashboard/users" });
      if (hasCreateUsers) userSubItems.push({ title: "Add User", url: "/dashboard/users/add" });
      if (hasReadRoles) userSubItems.push({ title: "User Roles", url: "/dashboard/roles" });

      allItems.push({
        title: "User Management",
        url: "/dashboard/users",
        icon: Users,
        items: userSubItems,
      });
    }

    // Add Book Management if user has permissions
    if (hasReadBooks) {
      const bookSubItems: NavigationSubItem[] = [];
      if (hasReadBooks) bookSubItems.push({ title: "All Books", url: "/dashboard/books" });
      if (hasCreateBooks) bookSubItems.push({ title: "Add Book", url: "/dashboard/books/add" });
      if (hasReadBooks) bookSubItems.push({ title: "Categories", url: "/dashboard/books/categories" });

      allItems.push({
        title: "Book Management",
        url: "/dashboard/books",
        icon: BookOpen,
        items: bookSubItems,
      });
    }

    // Add borrowing features for students/faculty
    if (hasBorrowBooks) {
      allItems.push(
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
        }
      );
    }

    // Add read-only features
    if (hasReadBooks) {
      allItems.push({
        title: "Favorites",
        url: "/dashboard/favorites",
        icon: Star,
      });
    }

    // Add admin features
    if (hasReadUsers) {
      allItems.push({
        title: "Analytics",
        url: "/dashboard/analytics",
        icon: BarChart3,
      });
    }

    if (hasManagePermissions) {
      allItems.push({
        title: "System Settings",
        url: "/dashboard/settings",
        icon: Settings,
      });
    }

    return allItems;
  };

  const navigationItems = getNavigationItems();

  // Type guard to check if an item has subitems
  const hasSubItems = (
    item: NavigationItem
  ): item is NavigationItem & { items: NavigationSubItem[] } => {
    return item.items !== undefined && item.items.length > 0;
  };

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
                  {hasSubItems(item) ? (
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton>
                          <item.icon className="h-4 w-4" />
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
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {hasCreateBooks && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/dashboard/books/add">
                      <BookOpen className="h-4 w-4" />
                      <span>Add Book</span>
                      <Badge variant="secondary" className="ml-auto">
                        Quick
                      </Badge>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {hasCreateUsers && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/dashboard/users/add">
                      <Users className="h-4 w-4" />
                      <span>Add User</span>
                      <Badge variant="secondary" className="ml-auto">
                        Quick
                      </Badge>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {user.role}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
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
