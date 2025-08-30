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
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Edit,
  Trash2,
  Shield,
  Users,
  Calendar,
  Search,
  Filter,
  Eye,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Check,
  FileText,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  createdAt: string;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [viewingRole, setViewingRole] = useState<Role | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
  });

  const availablePermissions = [
    "READ_BOOKS",
    "CREATE_BOOKS",
    "UPDATE_BOOKS",
    "DELETE_BOOKS",
    "READ_USERS",
    "CREATE_USERS",
    "UPDATE_USERS",
    "DELETE_USERS",
    "MANAGE_ROLES",
    "ASSIGN_ROLES",
    "VIEW_REPORTS",
    "SYSTEM_CONFIG",
  ];

  // Helper to normalize various API list shapes into Role[]
  const toRoleArray = (data: unknown): Role[] => {
    const anyData = data as any;
    const list =
      Array.isArray(anyData) ||
      anyData?.items ||
      anyData?.data ||
      anyData?.roles ||
      [];
    return Array.isArray(list) ? (list as Role[]) : [];
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/roles");
      if (response.ok) {
        const data = await response.json();
        setRoles(toRoleArray(data));
      } else {
        toast.error("Failed to fetch roles");
        setRoles([]);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast.error("Error fetching roles");
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error("Role name is required");
      return;
    }

    try {
      const response = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const payload = await response.json();
        const newRole = (payload as any)?.role ?? payload;
        setRoles((prev) => [...prev, newRole as Role]);
        setFormData({ name: "", description: "", permissions: [] });
        setIsCreateDialogOpen(false);
        toast.success("Role created successfully");
      } else {
        toast.error("Failed to create role");
      }
    } catch (error) {
      console.error("Error creating role:", error);
      toast.error("Error creating role");
    }
  };

  const handleEdit = async () => {
    if (!editingRole || !formData.name.trim()) {
      toast.error("Role name is required");
      return;
    }

    try {
      const response = await fetch(`/api/roles/${editingRole.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const payload = await response.json();
        const updatedRole = (payload as any)?.role ?? payload;
        setRoles((prev) =>
          prev.map((r) => (r.id === editingRole.id ? (updatedRole as Role) : r))
        );
        setIsEditDialogOpen(false);
        setEditingRole(null);
        toast.success("Role updated successfully");
      } else {
        toast.error("Failed to update role");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Error updating role");
    }
  };

  const handleDelete = async (roleId: string) => {
    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setRoles(roles.filter((r) => r.id !== roleId));
        toast.success("Role deleted successfully");
      } else {
        toast.error("Failed to delete role");
      }
    } catch (error) {
      console.error("Error deleting role:", error);
      toast.error("Error deleting role");
    }
  };

  const openEditDialog = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: [...role.permissions],
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (role: Role) => {
    setViewingRole(role);
    setIsViewDialogOpen(true);
  };

  const togglePermission = (permission: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  // Filter roles based on search
  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRoles = filteredRoles.slice(startIndex, endIndex);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center p-6">
        <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 border-0 shadow-2xl rounded-2xl p-8 max-w-md w-full">
          <CardContent className="text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full opacity-20 animate-ping"></div>
              <div className="relative p-6 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-full mx-auto w-20 h-20 flex items-center justify-center">
                <Shield className="h-10 w-10 text-blue-600 dark:text-blue-400 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Loading Roles...
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                🛡️ Fetching role management data
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
      <div className="container mx-auto space-y-8">
        {/* Animated Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-pulse">
              🛡️ Role Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300 animate-fade-in">
              Manage user roles and permissions in your library system
            </p>
          </div>

          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 gap-2">
                <Plus className="h-5 w-5" />
                Add Role
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col bg-gradient-to-br from-slate-50/95 via-white/95 to-blue-50/95 dark:from-slate-900/95 dark:via-slate-800/95 dark:to-indigo-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30">
              {/* Header Section */}
              <div className="relative overflow-hidden flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 opacity-10 dark:opacity-20"></div>
                <div className="relative flex items-center gap-4 p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg transform hover:scale-105 transition-transform">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-300 dark:to-purple-300 bg-clip-text text-transparent">
                      ✨ Add New Role
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 dark:text-gray-400 mt-1">
                      🛡️ Create a new role with specific permissions for your
                      library system
                    </DialogDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Ready
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="px-6 pt-4 flex-shrink-0">
                <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* Form Content - Scrollable */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <form
                  id="create-role-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleCreate();
                  }}
                >
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-700/30">
                      <h3 className="text-lg font-bold text-blue-700 dark:text-blue-300 mb-4 flex items-center gap-2">
                        📝 Basic Information
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <Label
                            htmlFor="name"
                            className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
                          >
                            <Shield className="h-4 w-4 text-blue-500" />
                            Role Name *
                          </Label>
                          <Input
                            id="name"
                            placeholder="Enter role name (e.g., Admin, Student, Librarian)"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            required
                            className="mt-2 h-11 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-300"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="description"
                            className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
                          >
                            <FileText className="h-4 w-4 text-indigo-500" />
                            Description
                          </Label>
                          <Textarea
                            id="description"
                            placeholder="Enter role description and responsibilities..."
                            value={formData.description}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                description: e.target.value,
                              })
                            }
                            rows={3}
                            className="mt-2 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all duration-300 resize-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Permissions */}
                    <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200/50 dark:border-purple-700/30">
                      <h3 className="text-lg font-bold text-purple-700 dark:text-purple-300 mb-4 flex items-center gap-2">
                        🔐 Permissions ({formData.permissions.length} selected)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-purple-200/50 dark:border-purple-700/30">
                        {availablePermissions.map((permission) => (
                          <div
                            key={permission}
                            className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                              formData.permissions.includes(permission)
                                ? "bg-purple-50 dark:bg-purple-900/50 border-purple-300 dark:border-purple-600"
                                : "bg-white/80 dark:bg-gray-700/80 border-gray-200 dark:border-gray-600 hover:bg-purple-50 dark:hover:bg-purple-900/30"
                            }`}
                            onClick={() => togglePermission(permission)}
                          >
                            <div
                              className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                formData.permissions.includes(permission)
                                  ? "bg-purple-500 border-purple-500"
                                  : "border-gray-300 dark:border-gray-600"
                              }`}
                            >
                              {formData.permissions.includes(permission) && (
                                <Check className="h-3 w-3 text-white" />
                              )}
                            </div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer flex-1">
                              {permission
                                .replace(/_/g, " ")
                                .toLowerCase()
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* Fixed Footer with Action Buttons */}
              <div className="flex-shrink-0 border-t border-gray-200/50 dark:border-gray-700/50 p-6 bg-gradient-to-r from-slate-50/90 to-blue-50/90 dark:from-slate-800/90 dark:to-indigo-900/90 backdrop-blur-sm">
                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="px-8 py-3 h-12 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105 transition-all duration-300 font-medium"
                  >
                    ❌ Cancel
                  </Button>
                  <Button
                    form="create-role-form"
                    type="submit"
                    className="px-8 py-3 h-12 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-700 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 min-w-[140px]"
                  >
                    <Shield className="mr-2 h-5 w-5" />✨ Create Role
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Enhanced Search and Filter Controls */}
        <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 border-0 shadow-xl rounded-2xl animate-slide-up">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="🔍 Search roles by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-300 hover:shadow-md"
                />
              </div>
              <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl border border-blue-200 dark:border-blue-700">
                <Filter className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  {filteredRoles.length} of {roles.length} roles
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Roles Display */}
        <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 border-0 shadow-2xl rounded-2xl overflow-hidden animate-fade-in">
          <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-6">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold">
              <div className="p-2 bg-white/20 rounded-xl">
                <Shield className="h-6 w-6" />
              </div>
              Roles Collection
              <span className="ml-auto px-4 py-2 bg-white/20 rounded-xl text-sm font-medium">
                {filteredRoles.length} Total
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {currentRoles.length > 0 ? (
              <>
                {/* Enhanced Desktop Table */}
                <div className="hidden lg:block">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/50 border-0">
                          <TableHead className="font-bold text-gray-700 dark:text-gray-300 py-4 pl-6">
                            🛡️ Role Details
                          </TableHead>
                          <TableHead className="font-bold text-gray-700 dark:text-gray-300">
                            🔐 Permissions & Users
                          </TableHead>
                          <TableHead className="font-bold text-gray-700 dark:text-gray-300">
                            📊 Statistics
                          </TableHead>
                          <TableHead className="font-bold text-gray-700 dark:text-gray-300">
                            📅 Created Date
                          </TableHead>
                          <TableHead className="font-bold text-gray-700 dark:text-gray-300 text-center">
                            ⚡ Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentRoles.map((role, index) => (
                          <TableRow
                            key={role.id}
                            className="group cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 transition-all duration-300 border-b border-gray-100 dark:border-gray-700/50 hover:border-blue-200 dark:hover:border-blue-600/50"
                            onClick={() => openViewDialog(role)}
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            {/* Role Details */}
                            <TableCell className="pl-6 py-4">
                              <div className="flex items-center gap-4">
                                <div className="relative">
                                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/50 dark:to-indigo-900/50 rounded-xl flex items-center justify-center border-2 border-white dark:border-gray-700 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                                    {role.name}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2" title={role.description}>
                                    {role.description.length > 60
                                      ? `${role.description.substring(0, 60)}...`
                                      : role.description}
                                  </div>
                                </div>
                              </div>
                            </TableCell>

                            {/* Permissions & Users */}
                            <TableCell className="py-4">
                              <div className="space-y-3">
                                <div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Permissions ({role.permissions.length}):</div>
                                  <div className="flex flex-wrap gap-1">
                                    {role.permissions.slice(0, 2).map((permission) => (
                                      <Badge
                                        key={permission}
                                        className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 text-xs hover:scale-105 transition-transform duration-300"
                                      >
                                        {permission.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                                      </Badge>
                                    ))}
                                    {role.permissions.length > 2 && (
                                      <Badge 
                                        variant="outline" 
                                        className="text-xs bg-gray-100 dark:bg-gray-800 hover:scale-105 transition-transform duration-300"
                                      >
                                        +{role.permissions.length - 2} more
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="p-1 bg-green-100 dark:bg-green-900/50 rounded-lg">
                                    <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                                  </div>
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {role.userCount} assigned users
                                  </span>
                                </div>
                              </div>
                            </TableCell>

                            {/* Statistics */}
                            <TableCell className="py-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"></div>
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {role.permissions.length} permissions
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"></div>
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {role.userCount} users
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {role.userCount > 0 ? 'Active role' : 'Unused role'}
                                </div>
                              </div>
                            </TableCell>

                            {/* Created Date */}
                            <TableCell className="py-4">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-blue-500" />
                                <div>
                                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {new Date(role.createdAt).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Created
                                  </div>
                                </div>
                              </div>
                            </TableCell>

                            {/* Actions */}
                            <TableCell className="py-4 text-center">
                              <div className="flex items-center justify-center gap-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openViewDialog(role);
                                  }}
                                  className="w-10 h-10 p-0 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/50 dark:to-emerald-900/50 border-green-200 dark:border-green-700 text-green-600 dark:text-green-400 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-800 dark:hover:to-emerald-800 hover:scale-110 transition-all duration-300 rounded-xl shadow-sm hover:shadow-md"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditDialog(role);
                                  }}
                                  className="w-10 h-10 p-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/50 dark:to-indigo-900/50 border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-800 dark:hover:to-indigo-800 hover:scale-110 transition-all duration-300 rounded-xl shadow-sm hover:shadow-md"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => e.stopPropagation()}
                                      className="w-10 h-10 p-0 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/50 dark:to-pink-900/50 border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 hover:from-red-100 hover:to-pink-100 dark:hover:from-red-800 dark:hover:to-pink-800 hover:scale-110 transition-all duration-300 rounded-xl shadow-sm hover:shadow-md"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="rounded-2xl border-0 shadow-2xl bg-gradient-to-br from-white to-red-50 dark:from-gray-900 dark:to-red-900/20">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="text-2xl font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                                        🗑️ Delete Role
                                      </AlertDialogTitle>
                                      <AlertDialogDescription className="text-gray-600 dark:text-gray-400 text-base">
                                        Are you sure you want to permanently delete the role{" "}
                                        <span className="font-bold text-gray-900 dark:text-white bg-yellow-100 dark:bg-yellow-900/50 px-2 py-1 rounded">
                                          "{role.name}"
                                        </span>
                                        ?<br />
                                        <span className="text-red-600 dark:text-red-400 font-medium">
                                          ⚠️ This will affect {role.userCount} users and cannot be undone.
                                        </span>
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="gap-3">
                                      <AlertDialogCancel className="rounded-xl border-2 border-gray-300 hover:bg-gray-100 transition-all duration-300">
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDelete(role.id)}
                                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Role
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

                {/* Enhanced Mobile/Tablet Cards */}
                <div className="lg:hidden p-6 space-y-6">
                  {currentRoles.map((role, index) => (
                    <Card
                      key={role.id}
                      className="group bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/30 dark:from-gray-800 dark:via-purple-900/20 dark:to-indigo-900/20 border-0 shadow-xl hover:shadow-2xl rounded-3xl overflow-hidden transform hover:scale-[1.02] transition-all duration-500 animate-slide-in cursor-pointer backdrop-blur-sm"
                      style={{ animationDelay: `${index * 150}ms` }}
                      onClick={() => openViewDialog(role)}
                    >
                      <CardContent className="p-0">
                        {/* Enhanced Gradient Header */}
                        <div className="relative bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-6 text-white overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-indigo-600/20 to-blue-600/20 backdrop-blur-3xl"></div>
                          <div className="relative flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <div className="relative">
                                <div className="w-16 h-16 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl flex items-center justify-center border-2 border-white/30 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                  <Shield className="h-8 w-8 text-white" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-bold text-white">
                                    {role.userCount}
                                  </span>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-xl text-white mb-2 truncate" title={role.name}>
                                  {role.name}
                                </h3>
                                <p className="text-purple-100 text-sm mb-2 line-clamp-2" title={role.description}>
                                  {role.description}
                                </p>
                                <div className="flex items-center gap-2 text-purple-100">
                                  <Badge 
                                    variant="outline" 
                                    className="bg-white/20 border-white/30 text-white text-xs hover:bg-white/30 transition-colors duration-300"
                                  >
                                    🔐 {role.permissions.length} permissions
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col gap-2 flex-shrink-0">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openViewDialog(role);
                                }}
                                className="w-10 h-10 p-0 bg-white/20 hover:bg-white/30 border-white/30 text-white hover:scale-110 transition-all duration-300 rounded-xl backdrop-blur-sm"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditDialog(role);
                                }}
                                className="w-10 h-10 p-0 bg-blue-500/20 hover:bg-blue-500/30 border-blue-300/30 text-white hover:scale-110 transition-all duration-300 rounded-xl backdrop-blur-sm"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-10 h-10 p-0 bg-red-500/20 hover:bg-red-500/30 border-red-300/30 text-white hover:scale-110 transition-all duration-300 rounded-xl backdrop-blur-sm"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-3xl border-0 shadow-2xl bg-gradient-to-br from-white to-red-50 dark:from-gray-900 dark:to-red-900/20 max-w-md">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-2xl font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                                      🗑️ Delete Role
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                                      Are you sure you want to permanently delete{" "}
                                      <span className="font-bold text-gray-900 dark:text-white bg-yellow-100 dark:bg-yellow-900/50 px-2 py-1 rounded-lg">
                                        "{role.name}"
                                      </span>
                                      ?<br /><br />
                                      <span className="text-red-600 dark:text-red-400 font-medium">
                                        ⚠️ This will affect {role.userCount} users and cannot be undone.
                                      </span>
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="gap-3">
                                    <AlertDialogCancel className="rounded-xl border-2 border-gray-300 hover:bg-gray-100 transition-all duration-300">
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(role.id)}
                                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete Role
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Content Section */}
                        <div className="p-6 space-y-4 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
                          {/* Permissions Section */}
                          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-700/30">
                            <h4 className="text-sm font-bold text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-2">
                              🔐 Permissions ({role.permissions.length})
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {role.permissions.slice(0, 4).map((permission) => (
                                <Badge
                                  key={permission}
                                  className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 text-xs hover:scale-105 transition-transform duration-300"
                                >
                                  {permission.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                                </Badge>
                              ))}
                              {role.permissions.length > 4 && (
                                <Badge 
                                  variant="outline" 
                                  className="text-xs bg-blue-50 dark:bg-blue-900/30 hover:scale-105 transition-transform duration-300"
                                >
                                  +{role.permissions.length - 4} more
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Statistics Grid */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200/50 dark:border-purple-700/30">
                              <div className="text-xs text-purple-600 dark:text-purple-400 font-bold mb-2 flex items-center gap-1">
                                👥 Assigned Users
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-purple-500" />
                                <span className="text-lg font-bold text-gray-900 dark:text-white">
                                  {role.userCount}
                                </span>
                              </div>
                              <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                                {role.userCount > 0 ? 'Active role' : 'Unused role'}
                              </div>
                            </div>

                            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200/50 dark:border-green-700/30">
                              <div className="text-xs text-green-600 dark:text-green-400 font-bold mb-2 flex items-center gap-1">
                                🔐 Permissions
                              </div>
                              <div className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-green-500" />
                                <span className="text-lg font-bold text-gray-900 dark:text-white">
                                  {role.permissions.length}
                                </span>
                              </div>
                              <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                                Access levels
                              </div>
                            </div>
                          </div>

                          {/* Creation Date */}
                          <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-indigo-200/50 dark:border-indigo-700/30">
                            <h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-300 mb-2 flex items-center gap-2">
                              📅 Role Information
                            </h4>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-indigo-500" />
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  Created on {new Date(role.createdAt).toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </div>
                                <div className="text-xs text-indigo-600 dark:text-indigo-400">
                                  System role configuration
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Quick Action Hint */}
                          <div className="text-center py-2">
                            <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1 inline-flex items-center gap-1">
                              👆 Tap card for full details
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t">
                    <div className="text-sm text-gray-600">
                      Showing {startIndex + 1} to{" "}
                      {Math.min(endIndex, filteredRoles.length)} of{" "}
                      {filteredRoles.length} roles
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={prevPage}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <span className="text-sm font-medium px-3 py-1 bg-gray-100 rounded">
                        {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={nextPage}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No roles found
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm
                    ? "No roles match your search criteria."
                    : "Get started by creating your first role."}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Role
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col bg-gradient-to-br from-slate-50/95 via-white/95 to-blue-50/95 dark:from-slate-900/95 dark:via-slate-800/95 dark:to-indigo-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30">
            {/* Header Section */}
            <div className="relative overflow-hidden flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 opacity-10 dark:opacity-20"></div>
              <div className="relative flex items-center gap-4 p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="p-4 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-lg transform hover:scale-105 transition-transform">
                  <Edit className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-blue-700 dark:from-purple-300 dark:to-blue-300 bg-clip-text text-transparent">
                    ✏️ Edit Role
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 dark:text-gray-400 mt-1">
                    � Update the role details and permissions as needed
                  </DialogDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-orange-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Editing
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="px-6 pt-4 flex-shrink-0">
              <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Form Content - Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <form
                id="edit-role-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleEdit();
                }}
              >
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-700/30">
                    <h3 className="text-lg font-bold text-blue-700 dark:text-blue-300 mb-4 flex items-center gap-2">
                      📝 Basic Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label
                          htmlFor="edit-name"
                          className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
                        >
                          <Shield className="h-4 w-4 text-blue-500" />
                          Role Name *
                        </Label>
                        <Input
                          id="edit-name"
                          placeholder="Enter role name (e.g., Admin, Student, Librarian)"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          required
                          className="mt-2 h-11 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-300"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="edit-description"
                          className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
                        >
                          <FileText className="h-4 w-4 text-indigo-500" />
                          Description
                        </Label>
                        <Textarea
                          id="edit-description"
                          placeholder="Enter role description and responsibilities..."
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                          rows={3}
                          className="mt-2 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all duration-300 resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Permissions */}
                  <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200/50 dark:border-purple-700/30">
                    <h3 className="text-lg font-bold text-purple-700 dark:text-purple-300 mb-4 flex items-center gap-2">
                      🔐 Permissions ({formData.permissions.length} selected)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-purple-200/50 dark:border-purple-700/30">
                      {availablePermissions.map((permission) => (
                        <div
                          key={permission}
                          className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                            formData.permissions.includes(permission)
                              ? "bg-purple-50 dark:bg-purple-900/50 border-purple-300 dark:border-purple-600"
                              : "bg-white/80 dark:bg-gray-700/80 border-gray-200 dark:border-gray-600 hover:bg-purple-50 dark:hover:bg-purple-900/30"
                          }`}
                          onClick={() => togglePermission(permission)}
                        >
                          <div
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                              formData.permissions.includes(permission)
                                ? "bg-purple-500 border-purple-500"
                                : "border-gray-300 dark:border-gray-600"
                            }`}
                          >
                            {formData.permissions.includes(permission) && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer flex-1">
                            {permission
                              .replace(/_/g, " ")
                              .toLowerCase()
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Fixed Footer with Action Buttons */}
            <div className="flex-shrink-0 border-t border-gray-200/50 dark:border-gray-700/50 p-6 bg-gradient-to-r from-slate-50/90 to-blue-50/90 dark:from-slate-800/90 dark:to-blue-900/90 backdrop-blur-sm">
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="px-8 py-3 h-12 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105 transition-all duration-300 font-medium"
                >
                  ❌ Cancel
                </Button>
                <Button
                  form="edit-role-form"
                  type="submit"
                  className="px-8 py-3 h-12 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 min-w-[160px]"
                >
                  <Edit className="mr-2 h-5 w-5" />✨ Update Role
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Role Details</DialogTitle>
              <DialogDescription>
                Complete information about this role and its permissions.
              </DialogDescription>
            </DialogHeader>

            {viewingRole && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Role Name
                      </Label>
                      <p className="mt-1 text-base font-semibold text-gray-900">
                        {viewingRole.name}
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Users with this Role
                      </Label>
                      <div className="mt-1 flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-base font-semibold text-gray-900">
                          {viewingRole.userCount}
                        </span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Created Date
                      </Label>
                      <div className="mt-1 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-base text-gray-900">
                          {new Date(viewingRole.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Description
                      </Label>
                      <p className="mt-1 text-base text-gray-900 bg-gray-50 p-3 rounded-lg">
                        {viewingRole.description || "No description provided"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Permissions ({viewingRole.permissions.length})
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {viewingRole.permissions.map((permission) => (
                      <div
                        key={permission}
                        className="p-3 bg-primary/10 border border-primary/20 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium text-gray-900">
                            {permission
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {viewingRole.permissions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Shield className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p>No permissions assigned to this role</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsViewDialogOpen(false)}
              >
                Close
              </Button>
              {viewingRole && (
                <Button
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    openEditDialog(viewingRole);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Role
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
