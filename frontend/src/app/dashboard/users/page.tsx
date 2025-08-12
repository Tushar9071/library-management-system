"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Users, Mail, Phone, Calendar } from "lucide-react";
import { toast } from "react-hot-toast";

interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: {
    id: string;
    name: string;
  };
  status: string;
  createdAt: string;
  lastLogin: string;
}

interface Role {
  id: string;
  name: string;
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phone: "",
    password: "",
    roleId: "",
    status: "active",
  });

  // Fetch users with pagination
  const fetchUsers = async (
    page: number = 1,
    search: string = "",
    role: string = "all"
  ) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
        ...(role !== "all" && { role }),
      });

      const response = await fetch(
        `http://localhost:8000/api/users?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch users");

      const result = await response.json();
      setUsers(result.data || []);
      setPagination(result.pagination);
    } catch (error) {
      toast.error("Failed to fetch users");
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch roles
  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/api/users/roles", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch roles");

      const result = await response.json();
      setRoles(result.data || []);
    } catch (error) {
      toast.error("Failed to fetch roles");
      console.error("Error fetching roles:", error);
    }
  };

  // Search and filter handlers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers(1, searchTerm, selectedRole);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchUsers(newPage, searchTerm, selectedRole);
  };

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    setCurrentPage(1);
    fetchUsers(1, searchTerm, role);
  };

  // Create user
  const createUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to create user");

      const result = await response.json();
      toast.success(result.message || "User created successfully");
      setIsCreateOpen(false);
      resetForm();
      fetchUsers(currentPage, searchTerm, selectedRole);
    } catch (error) {
      toast.error("Failed to create user");
      console.error("Error creating user:", error);
    }
  };

  // Update user
  const updateUser = async () => {
    if (!editingUser) return;

    try {
      const token = localStorage.getItem("token");
      const updateData: any = { ...formData };
      if (!updateData.password) {
        delete updateData.password; // Don't update password if empty
      }

      const response = await fetch(
        `http://localhost:8000/api/users/${editingUser.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) throw new Error("Failed to update user");

      const result = await response.json();
      toast.success(result.message || "User updated successfully");
      setIsEditOpen(false);
      setEditingUser(null);
      resetForm();
      fetchUsers(currentPage, searchTerm, selectedRole);
    } catch (error) {
      toast.error("Failed to update user");
      console.error("Error updating user:", error);
    }
  };

  // Delete user
  const deleteUser = async (userId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8000/api/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete user");

      const result = await response.json();
      toast.success(result.message || "User deleted successfully");
      // If we're on the last page and it becomes empty, go to previous page
      const newTotalCount = (pagination?.totalCount || 1) - 1;
      const newTotalPages = Math.ceil(
        newTotalCount / (pagination?.limit || 10)
      );
      const targetPage =
        currentPage > newTotalPages ? Math.max(1, newTotalPages) : currentPage;
      setCurrentPage(targetPage);
      fetchUsers(targetPage, searchTerm, selectedRole);
    } catch (error) {
      toast.error("Failed to delete user");
      console.error("Error deleting user:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      name: "",
      phone: "",
      password: "",
      roleId: "",
      status: "active",
    });
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      name: user.name,
      phone: user.phone,
      password: "", // Don't pre-fill password
      roleId: user.role.id,
      status: user.status,
    });
    setIsEditOpen(true);
  };

  const handleViewDetails = (user: User) => {
    setViewingUser(user);
    setIsDetailOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "inactive":
        return <Badge className="bg-red-100 text-red-800">Inactive</Badge>;
      case "suspended":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Suspended</Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    fetchUsers(currentPage, searchTerm, selectedRole);
  }, [currentPage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center p-6">
        <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 border-0 shadow-2xl rounded-2xl p-8 max-w-md w-full">
          <CardContent className="text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full opacity-20 animate-ping"></div>
              <div className="relative p-6 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-full mx-auto w-20 h-20 flex items-center justify-center">
                <Users className="h-10 w-10 text-blue-600 dark:text-blue-400 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Loading Users...
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                👥 Fetching user management data
              </p>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 p-6">
      {/* Animated Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-8">
        <div className="space-y-2">
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-pulse">
            👥 User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300 animate-fade-in">
            Manage your library members and staff
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => resetForm()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-bounce-in"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add New User
            </Button>
          </DialogTrigger>

          {/* Enhanced Search and Filter Controls */}
          <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 border-0 shadow-xl rounded-2xl animate-slide-up">
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="space-y-6">
                <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
                  <div className="flex-1 relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Users className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
                    </div>
                    <Input
                      type="text"
                      placeholder="🔍 Search users by name, email, or phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-12 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-300 hover:shadow-md"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                    <Select
                      value={selectedRole}
                      onValueChange={handleRoleChange}
                    >
                      <SelectTrigger className="w-full sm:w-56 h-12 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-purple-400 focus:border-purple-500 transition-all duration-300">
                        <SelectValue placeholder="👤 All Roles" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-0 shadow-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
                        <SelectItem
                          value="all"
                          className="rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/50 font-medium"
                        >
                          👥 All Roles
                        </SelectItem>
                        {roles.map((role) => (
                          <SelectItem
                            key={role.id}
                            value={role.name}
                            className="rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/50"
                          >
                            🔑 {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      type="submit"
                      className="w-full sm:w-auto h-12 px-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                      ✨ Search
                    </Button>
                  </div>
                </div>
              </form>

              {/* Enhanced Results Summary */}
              {pagination && (
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300">
                    <span className="flex items-center gap-1">
                      📊 Showing {(pagination.page - 1) * pagination.limit + 1}{" "}
                      to{" "}
                      {Math.min(
                        pagination.page * pagination.limit,
                        pagination.totalCount
                      )}{" "}
                      of{" "}
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {pagination.totalCount}
                      </span>{" "}
                      users
                    </span>
                    {searchTerm && (
                      <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 rounded-full text-xs font-medium">
                        🔍 "{searchTerm}"
                      </span>
                    )}
                    {selectedRole !== "all" && (
                      <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                        👤 {selectedRole}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the system.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter full name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="Enter email address"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="Enter phone number"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  placeholder="Enter password"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.roleId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, roleId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createUser}>Create User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Enhanced Users Display */}
      <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 border-0 shadow-2xl rounded-2xl overflow-hidden animate-fade-in">
        <CardHeader className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 text-white p-6">
          <CardTitle className="flex items-center gap-3 text-2xl font-bold">
            <div className="p-2 bg-white/20 rounded-xl">
              <Users className="h-6 w-6" />
            </div>
            Users Collection
            {pagination && (
              <span className="ml-auto px-4 py-2 bg-white/20 rounded-xl text-sm font-medium">
                {pagination.totalCount} Total
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/50 border-0">
                    <TableHead className="font-bold text-gray-700 dark:text-gray-300 py-4">
                      👤 Name
                    </TableHead>
                    <TableHead className="font-bold text-gray-700 dark:text-gray-300">
                      📧 Email
                    </TableHead>
                    <TableHead className="font-bold text-gray-700 dark:text-gray-300">
                      📱 Phone
                    </TableHead>
                    <TableHead className="font-bold text-gray-700 dark:text-gray-300">
                      🔑 Role
                    </TableHead>
                    <TableHead className="font-bold text-gray-700 dark:text-gray-300">
                      📊 Status
                    </TableHead>
                    <TableHead className="font-bold text-gray-700 dark:text-gray-300">
                      📅 Last Login
                    </TableHead>
                    <TableHead className="font-bold text-gray-700 dark:text-gray-300">
                      ⚡ Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow
                      key={user.id}
                      className="cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 transition-all duration-300"
                      onClick={() => handleViewDetails(user)}
                    >
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          {user.phone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role.name}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {user.lastLogin
                            ? new Date(user.lastLogin).toLocaleDateString()
                            : "Never"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(user);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this user?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteUser(user.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Enhanced Mobile/Tablet Card View */}
          <div className="lg:hidden p-6 space-y-6">
            {users.map((user, index) => (
              <Card
                key={user.id}
                className="group bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/30 border-0 shadow-lg hover:shadow-2xl rounded-2xl overflow-hidden transform hover:scale-[1.02] transition-all duration-500 animate-slide-in cursor-pointer"
                style={{ animationDelay: `${index * 150}ms` }}
                onClick={() => handleViewDetails(user)}
              >
                <CardContent className="p-0">
                  {/* Gradient Header */}
                  <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 p-4 text-white">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3
                          className="font-bold text-lg break-words mb-2"
                          title={user.name}
                        >
                          👤 {user.name}
                        </h3>
                        <div className="flex items-center gap-2 text-blue-100">
                          <div className="p-1 bg-white/20 rounded-lg">
                            <Mail className="h-4 w-4" />
                          </div>
                          <span
                            className="break-words font-medium"
                            title={user.email}
                          >
                            {user.email}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(user);
                          }}
                          className="bg-white/20 hover:bg-white/30 border-white/30 text-white hover:scale-110 transition-all duration-300 rounded-xl"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                              className="bg-red-500/20 hover:bg-red-500/30 border-red-300/30 text-white hover:scale-110 transition-all duration-300 rounded-xl"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-2xl border-0 shadow-2xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-xl font-bold text-red-600">
                                🗑️ Delete User
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                                Are you sure you want to delete{" "}
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  "{user.name}"
                                </span>
                                ? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="rounded-xl">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteUser(user.id)}
                                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl"
                              >
                                Delete User
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-4">
                    {/* Phone */}
                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                      <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                        <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                          Phone
                        </div>
                        <span
                          className="font-semibold text-gray-900 dark:text-white break-all"
                          title={user.phone}
                        >
                          {user.phone}
                        </span>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                        <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">
                          🔑 Role
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300"
                        >
                          {user.role?.name || "No Role"}
                        </Badge>
                      </div>

                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                        <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                          📊 Status
                        </div>
                        <Badge
                          variant={
                            user.status === "active" ? "default" : "secondary"
                          }
                          className={
                            user.status === "active"
                              ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 shadow-lg"
                              : "bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0 shadow-lg"
                          }
                        >
                          {user.status === "active"
                            ? "✅ Active"
                            : "❌ Inactive"}
                        </Badge>
                      </div>

                      <div className="col-span-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                        <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-1">
                          📅 Last Login
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-indigo-500" />
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {user.lastLogin
                              ? new Date(user.lastLogin).toLocaleDateString()
                              : "Never"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 border-0 shadow-xl rounded-2xl animate-slide-up">
          <CardContent className="p-6">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span>
                  Page{" "}
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {pagination.page}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {pagination.totalPages}
                  </span>
                </span>
              </div>

              <div className="flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                  className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/50 dark:to-indigo-900/50 border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-800 dark:hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl hover:scale-105 transition-all duration-300"
                >
                  <span className="hidden sm:inline">⬅️ Previous</span>
                  <span className="sm:hidden">⬅️ Prev</span>
                </Button>

                {/* Enhanced Page Numbers - Hidden on mobile */}
                <div className="hidden sm:flex items-center space-x-2">
                  {(() => {
                    const pages = [];
                    const maxVisiblePages = 5;
                    const startPage = Math.max(
                      1,
                      pagination.page - Math.floor(maxVisiblePages / 2)
                    );
                    const endPage = Math.min(
                      pagination.totalPages,
                      startPage + maxVisiblePages - 1
                    );

                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <Button
                          key={i}
                          variant={
                            i === pagination.page ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => handlePageChange(i)}
                          className={
                            i === pagination.page
                              ? "w-10 h-10 p-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl rounded-xl hover:scale-110 transition-all duration-300"
                              : "w-10 h-10 p-0 bg-white/80 dark:bg-gray-700/80 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-xl hover:scale-110 transition-all duration-300"
                          }
                        >
                          {i}
                        </Button>
                      );
                    }
                    return pages;
                  })()}
                </div>

                {/* Enhanced Mobile page indicator */}
                <div className="sm:hidden flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl border border-purple-200 dark:border-purple-700">
                  <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                    {pagination.page} / {pagination.totalPages}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                  className="px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/50 dark:to-pink-900/50 border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-800 dark:hover:to-pink-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl hover:scale-105 transition-all duration-300"
                >
                  <span className="hidden sm:inline">Next ➡️</span>
                  <span className="sm:hidden">Next ➡️</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced No Results */}
      {users.length === 0 && !loading && (
        <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 border-0 shadow-xl rounded-2xl animate-bounce-in">
          <CardContent className="p-8">
            <div className="text-center py-12">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full opacity-20 animate-ping"></div>
                <div className="relative p-6 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-full mx-auto w-24 h-24 flex items-center justify-center">
                  <Users className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>
              </div>

              <h3 className="mt-6 text-xl font-bold text-gray-900 dark:text-gray-100">
                {searchTerm || selectedRole !== "all"
                  ? "🔍 No Users Found"
                  : "👥 No Users Yet"}
              </h3>

              <p className="mt-3 text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                {searchTerm || selectedRole !== "all"
                  ? "We couldn't find any users matching your search criteria. Try adjusting your filters or search terms."
                  : "Your user management system is empty. Start building your team by adding your first user!"}
              </p>

              {!searchTerm && selectedRole === "all" && (
                <Button
                  onClick={() => setIsCreateOpen(true)}
                  className="mt-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Add Your First User
                </Button>
              )}

              {(searchTerm || selectedRole !== "all") && (
                <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedRole("all");
                      setCurrentPage(1);
                      fetchUsers(1, "", "all");
                    }}
                    className="bg-white/80 dark:bg-gray-700/80 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-xl"
                  >
                    🔄 Clear Filters
                  </Button>
                  <Button
                    onClick={() => setIsCreateOpen(true)}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New User
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and settings.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter full name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="Enter email address"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                placeholder="Enter phone number"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-password">
                New Password (leave blank to keep current)
              </Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                placeholder="Enter new password"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={formData.roleId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, roleId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateUser}>Update User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <Users className="h-6 w-6" />
              👤 User Details
            </DialogTitle>
          </DialogHeader>

          {viewingUser && (
            <div className="space-y-6">
              {/* User Avatar and Basic Info */}
              <div className="flex gap-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-700 shadow-lg">
                    <Users className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>

                {/* Basic Info */}
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {viewingUser.name}
                    </h3>
                    <p className="text-lg text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      {viewingUser.email}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Badge
                      variant="outline"
                      className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300"
                    >
                      🎭 {viewingUser.role.name}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`${
                        viewingUser.status === "active"
                          ? "bg-green-100 dark:bg-green-900/50 border-green-300 dark:border-green-600 text-green-700 dark:text-green-300"
                          : viewingUser.status === "inactive"
                          ? "bg-red-100 dark:bg-red-900/50 border-red-300 dark:border-red-600 text-red-700 dark:text-red-300"
                          : "bg-yellow-100 dark:bg-yellow-900/50 border-yellow-300 dark:border-yellow-600 text-yellow-700 dark:text-yellow-300"
                      }`}
                    >
                      {viewingUser.status === "active" && "✅ Active"}
                      {viewingUser.status === "inactive" && "❌ Inactive"}
                      {viewingUser.status === "suspended" && "⏸️ Suspended"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
                  📞 Contact Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                      <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Email
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {viewingUser.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                      <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Phone
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {viewingUser.phone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <span className="font-semibold text-purple-900 dark:text-purple-300">
                      Member Since
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {new Date(viewingUser.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="font-semibold text-green-900 dark:text-green-300">
                      Last Login
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {viewingUser.lastLogin
                      ? new Date(viewingUser.lastLogin).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : "Never logged in"}
                  </p>
                </div>
              </div>

              {/* Role Details */}
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                <h4 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-3 flex items-center gap-2">
                  🎭 Role & Permissions
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Current Role:
                    </span>
                    <Badge
                      variant="outline"
                      className="bg-indigo-100 dark:bg-indigo-900/50 border-indigo-300 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300"
                    >
                      {viewingUser.role.name}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This role determines what actions the user can perform in
                    the system.
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Close
            </Button>
            {viewingUser && (
              <Button
                onClick={() => {
                  setIsDetailOpen(false);
                  handleEdit(viewingUser);
                }}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit User
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
