"use client";

import React, { useState, useEffect } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import {
  ProtectedFeature,
  ProtectedAction,
} from "@/components/ProtectedFeature";
import {
  useResourcePermissions,
  useHasPermission,
} from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/types/permissions";
import BooksWithPagination from "@/components/BooksWithPagination";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Edit,
  Trash2,
  BookOpen,
  Calendar,
  User,
  Hash,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  description: string;
  category: string;
  status: string;
  publishedYear: number;
  totalCopies: number;
  availableCopies: number;
  thumbnail?: string; // URL for book cover image
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function BooksPage() {
  // Lightweight gate: if user is not an admin (no create/update permissions), show browse view
  const canCreateBooks = useHasPermission("CREATE_BOOKS");
  const canUpdateBooks = useHasPermission("UPDATE_BOOKS");
  const isAdminView = canCreateBooks || canUpdateBooks;

  if (!isAdminView) {
    return <BooksWithPagination />;
  }

  const [books, setBooks] = useState<Book[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [visibleCategoryCount, setVisibleCategoryCount] = useState(10);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [categoryScrollRef, setCategoryScrollRef] =
    useState<HTMLDivElement | null>(null);
  const [isAutoLoadingCategories, setIsAutoLoadingCategories] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [viewingBook, setViewingBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    description: "",
    category: "",
    status: "available",
    publishedYear: new Date().getFullYear(),
    totalCopies: 1,
    availableCopies: 1,
    thumbnail: "",
  });

  const categories = [
    "Fiction",
    "Non-Fiction",
    "Science",
    "Technology",
    "History",
    "Biography",
    "Children",
    "Educational",
    "Reference",
    "Poetry",
    "Drama",
    "Other",
  ];

  // Enhanced category filtering with search and scroll pagination
  const filteredCategories = availableCategories.filter((category) =>
    category.toLowerCase().includes(categorySearchTerm.toLowerCase())
  );

  const visibleCategories = filteredCategories.slice(0, visibleCategoryCount);
  const hasMoreCategories = visibleCategoryCount < filteredCategories.length;

  // Fetch available categories from API
  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const response = await apiGet("/books/categories");
      const result = await response.json();
      setAvailableCategories(result.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Fallback to default categories
      setAvailableCategories(categories);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  // Fetch books with pagination
  const fetchBooks = async (
    page: number = 1,
    search: string = "",
    category: string = "all"
  ) => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
        ...(category !== "all" && { category }),
      });

      const response = await apiGet(`/books?${params}`);
      const result = await response.json();
      setBooks(result.data || []);
      setPagination(result.pagination);
    } catch (error) {
      toast.error("Failed to fetch books");
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  // Create book
  const createBook = async () => {
    try {
      const response = await apiPost("/books", formData);
      const result = await response.json();
      toast.success(result.message || "Book created successfully");
      setIsCreateOpen(false);
      resetForm();
      fetchBooks(currentPage, searchTerm, selectedCategory);
    } catch (error) {
      toast.error("Failed to create book");
      console.error("Error creating book:", error);
    }
  };

  // Update book
  const updateBook = async () => {
    if (!editingBook) return;

    try {
      const response = await apiPut(`/books/${editingBook.id}`, formData);
      const result = await response.json();
      toast.success(result.message || "Book updated successfully");
      setIsEditOpen(false);
      setEditingBook(null);
      resetForm();
      fetchBooks(currentPage, searchTerm, selectedCategory);
    } catch (error) {
      toast.error("Failed to update book");
      console.error("Error updating book:", error);
    }
  };

  // Delete book
  const deleteBook = async (bookId: string) => {
    try {
      const response = await apiDelete(`/books/${bookId}`);
      const result = await response.json();
      toast.success(result.message || "Book deleted successfully");
      // If we're on the last page and it becomes empty, go to previous page
      const newTotalCount = (pagination?.totalCount || 1) - 1;
      const newTotalPages = Math.ceil(
        newTotalCount / (pagination?.limit || 10)
      );
      const targetPage =
        currentPage > newTotalPages ? Math.max(1, newTotalPages) : currentPage;
      setCurrentPage(targetPage);
      fetchBooks(targetPage, searchTerm, selectedCategory);
    } catch (error) {
      toast.error("Failed to delete book");
      console.error("Error deleting book:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      author: "",
      isbn: "",
      description: "",
      category: "",
      status: "available",
      publishedYear: new Date().getFullYear(),
      totalCopies: 1,
      availableCopies: 1,
      thumbnail: "",
    });
  };

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      description: book.description,
      category: book.category,
      status: book.status,
      publishedYear: book.publishedYear,
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
      thumbnail: book.thumbnail || "",
    });
    setIsEditOpen(true);
  };

  const handleViewDetails = (book: Book) => {
    setViewingBook(book);
    setIsDetailOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return (
          <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse-slow">
            ✅ Available
          </Badge>
        );
      case "checked_out":
        return (
          <Badge className="bg-gradient-to-r from-blue-400 to-cyan-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            📚 Checked Out
          </Badge>
        );
      case "reserved":
        return (
          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            🔒 Reserved
          </Badge>
        );
      case "maintenance":
        return (
          <Badge className="bg-gradient-to-r from-red-400 to-pink-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            🔧 Maintenance
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0 shadow-lg">
            ❓ {status}
          </Badge>
        );
    }
  };

  // Search and filter handlers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBooks(1, searchTerm, selectedCategory);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchBooks(newPage, searchTerm, selectedCategory);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    fetchBooks(1, searchTerm, category);
  };

  // Reset category search and scroll pagination
  const resetCategoryFilters = () => {
    setCategorySearchTerm("");
    setVisibleCategoryCount(10);
  };

  // Handle category search
  const handleCategorySearch = (searchTerm: string) => {
    setCategorySearchTerm(searchTerm);
    setVisibleCategoryCount(10);
  };

  // Load more categories (scroll pagination)
  const loadMoreCategories = () => {
    setVisibleCategoryCount((prev) => prev + 10);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBooks(currentPage, searchTerm, selectedCategory);
  }, [currentPage]);

  // Reset category filters when dialogs open/close
  useEffect(() => {
    if (isCreateOpen || isEditOpen) {
      resetCategoryFilters();
    }
  }, [isCreateOpen, isEditOpen]);

  // Auto-scroll pagination effect for categories
  useEffect(() => {
    if (!categoryScrollRef || !hasMoreCategories || isAutoLoadingCategories)
      return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (
          entry.isIntersecting &&
          hasMoreCategories &&
          !isAutoLoadingCategories
        ) {
          setIsAutoLoadingCategories(true);
          setTimeout(() => {
            setVisibleCategoryCount((prev) => prev + 10);
            setIsAutoLoadingCategories(false);
          }, 500); // Add slight delay for better UX
        }
      },
      {
        threshold: 0.1,
        rootMargin: "20px",
      }
    );

    observer.observe(categoryScrollRef);

    return () => {
      observer.disconnect();
    };
  }, [categoryScrollRef, hasMoreCategories, isAutoLoadingCategories]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center p-6">
        <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 border-0 shadow-2xl rounded-2xl p-8 max-w-md w-full">
          <CardContent className="text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full opacity-20 animate-ping"></div>
              <div className="relative p-6 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-full mx-auto w-20 h-20 flex items-center justify-center">
                <BookOpen className="h-10 w-10 text-blue-600 dark:text-blue-400 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Loading Books...
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                📚 Fetching your library collection
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
      <div className="flex flex-col gap-4 mb-8">
        <div className="space-y-2">
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-pulse">
            📚 Library Books
          </h1>
          <p className="text-gray-600 dark:text-gray-300 animate-fade-in">
            Manage your library collection with ease
          </p>
        </div>

        <ProtectedAction resource="books" action="create">
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => resetForm()}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-bounce-in"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add New Book
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col bg-gradient-to-br from-slate-50/95 via-white/95 to-blue-50/95 dark:from-slate-900/95 dark:via-slate-800/95 dark:to-indigo-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30">
              {/* Header Section */}
              <div className="relative overflow-hidden flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 opacity-10 dark:opacity-20"></div>
                <div className="relative flex items-center gap-4 p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg transform hover:scale-105 transition-transform">
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-300 dark:to-purple-300 bg-clip-text text-transparent">
                      ✨ Add New Book
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 dark:text-gray-400 mt-1">
                      📚 Expand your library collection with a new book
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
                  id="create-book-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    createBook();
                  }}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Basic Info */}
                    <div className="space-y-6">
                      <div className="bg-white/70 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          📝 Basic Information
                        </h3>
                        <div className="space-y-5">
                          <div className="group">
                            <Label
                              htmlFor="title"
                              className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block"
                            >
                              📖 Book Title *
                            </Label>
                            <Input
                              id="title"
                              value={formData.title}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  title: e.target.value,
                                }))
                              }
                              placeholder="Enter the book title..."
                              className="h-12 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-300"
                              required
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              The main title of the book
                            </p>
                          </div>

                          <div className="group">
                            <Label
                              htmlFor="author"
                              className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block"
                            >
                              ✍️ Author *
                            </Label>
                            <Input
                              id="author"
                              value={formData.author}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  author: e.target.value,
                                }))
                              }
                              placeholder="Enter author name..."
                              className="h-12 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-300"
                              required
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              Who wrote this book?
                            </p>
                          </div>

                          <div className="group">
                            <Label
                              htmlFor="isbn"
                              className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block"
                            >
                              🔢 ISBN *
                            </Label>
                            <Input
                              id="isbn"
                              value={formData.isbn}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  isbn: e.target.value,
                                }))
                              }
                              placeholder="Enter ISBN number..."
                              className="h-12 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-300"
                              required
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              International Standard Book Number
                            </p>
                          </div>

                          <div className="group">
                            <Label
                              htmlFor="description"
                              className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block"
                            >
                              📝 Description
                            </Label>
                            <Textarea
                              id="description"
                              value={formData.description}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  description: e.target.value,
                                }))
                              }
                              placeholder="Enter book description or summary..."
                              className="bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-300"
                              rows={4}
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              A short summary or synopsis
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Advanced Info */}
                    <div className="space-y-6">
                      {/* Book Cover Section */}
                      <div className="bg-white/70 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          🖼️ Book Cover
                        </h3>
                        <div className="space-y-4">
                          <div className="group">
                            <Label
                              htmlFor="thumbnail"
                              className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block"
                            >
                              📷 Cover Image URL
                            </Label>
                            <Input
                              id="thumbnail"
                              value={formData.thumbnail}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  thumbnail: e.target.value,
                                }))
                              }
                              placeholder="Paste image URL here..."
                              className="h-12 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-300"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              Direct link to the book cover image
                            </p>
                          </div>
                          {formData.thumbnail && (
                            <div className="flex justify-center">
                              <div className="relative group">
                                <img
                                  src={formData.thumbnail}
                                  alt="Book cover preview"
                                  className="w-24 h-32 object-cover rounded-xl border-2 border-gray-200 dark:border-gray-600 shadow-lg group-hover:scale-105 transition-transform"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-colors"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Classification Section */}
                      <div className="bg-white/70 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          🏷️ Classification
                        </h3>
                        <div className="space-y-5">
                          <div className="group">
                            <Label
                              htmlFor="category"
                              className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block"
                            >
                              📂 Category *
                            </Label>
                            <Select
                              value={formData.category}
                              onValueChange={(value) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  category: value,
                                }))
                              }
                            >
                              <SelectTrigger className="h-12 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 transition-all duration-300">
                                <SelectValue placeholder="Choose a category..." />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl border-0 shadow-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm max-h-60">
                                <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                                  <Input
                                    placeholder="🔍 Search categories..."
                                    value={categorySearchTerm}
                                    onChange={(e) =>
                                      handleCategorySearch(e.target.value)
                                    }
                                    className="h-8 text-sm bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-lg"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                                {visibleCategories.length > 0 &&
                                  visibleCategories.map((category) => (
                                    <SelectItem
                                      key={category}
                                      value={category}
                                      className="rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/50"
                                    >
                                      📖 {category}
                                    </SelectItem>
                                  ))}
                                {visibleCategories.length === 0 &&
                                  categorySearchTerm && (
                                    <div className="p-3 text-center text-sm text-gray-500 dark:text-gray-400">
                                      No categories found. You can still type a
                                      custom category.
                                    </div>
                                  )}
                                {hasMoreCategories && (
                                  <div className="p-2 border-t border-gray-200 dark:border-gray-600">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="w-full text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        loadMoreCategories();
                                      }}
                                    >
                                      📂 Load More (
                                      {filteredCategories.length -
                                        visibleCategoryCount}{" "}
                                      remaining)
                                    </Button>
                                  </div>
                                )}
                                {!categorySearchTerm &&
                                  categories.map((category) => (
                                    <SelectItem
                                      key={category}
                                      value={category}
                                      className="rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/50"
                                    >
                                      📖 {category}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              Choose or search a category
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="group">
                              <Label
                                htmlFor="publishedYear"
                                className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block"
                              >
                                📅 Year *
                              </Label>
                              <Input
                                id="publishedYear"
                                type="number"
                                value={formData.publishedYear}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    publishedYear: parseInt(e.target.value),
                                  }))
                                }
                                placeholder="2024"
                                className="h-12 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-300"
                                required
                              />
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                Publication year
                              </p>
                            </div>
                            <div className="group">
                              <Label
                                htmlFor="status"
                                className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block"
                              >
                                📊 Status *
                              </Label>
                              <Select
                                value={formData.status}
                                onValueChange={(value) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    status: value,
                                  }))
                                }
                              >
                                <SelectTrigger className="h-12 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 transition-all duration-300">
                                  <SelectValue placeholder="Status..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                  <SelectItem value="available">
                                    ✅ Available
                                  </SelectItem>
                                  <SelectItem value="checked_out">
                                    📤 Checked Out
                                  </SelectItem>
                                  <SelectItem value="reserved">
                                    🔒 Reserved
                                  </SelectItem>
                                  <SelectItem value="maintenance">
                                    🔧 Maintenance
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                Current status
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="group">
                              <Label
                                htmlFor="totalCopies"
                                className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block"
                              >
                                📚 Total Copies *
                              </Label>
                              <Input
                                id="totalCopies"
                                type="number"
                                min="1"
                                value={formData.totalCopies}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    totalCopies: parseInt(e.target.value),
                                  }))
                                }
                                placeholder="1"
                                className="h-12 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-300"
                                required
                              />
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                Total quantity
                              </p>
                            </div>
                            <div className="group">
                              <Label
                                htmlFor="availableCopies"
                                className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block"
                              >
                                📖 Available *
                              </Label>
                              <Input
                                id="availableCopies"
                                type="number"
                                min="0"
                                max={formData.totalCopies}
                                value={formData.availableCopies}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    availableCopies: parseInt(e.target.value),
                                  }))
                                }
                                placeholder="1"
                                className="h-12 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-300"
                                required
                              />
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                Available now
                              </p>
                            </div>
                          </div>
                        </div>
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
                    onClick={() => setIsCreateOpen(false)}
                    className="px-8 py-3 h-12 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105 transition-all duration-300 font-medium"
                  >
                    ❌ Cancel
                  </Button>
                  <Button
                    form="create-book-form"
                    type="submit"
                    className="px-8 py-3 h-12 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-700 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 min-w-[140px]"
                  >
                    <Plus className="mr-2 h-5 w-5" />✨ Add Book
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </ProtectedAction>

        {/* Enhanced Search and Filter Controls */}
        <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 border-0 shadow-xl rounded-2xl animate-slide-up">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
                <div className="flex-1 relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BookOpen className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
                  </div>
                  <Input
                    type="text"
                    placeholder="🔍 Search books by title, author, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-300 hover:shadow-md"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                  <Select
                    value={selectedCategory}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger className="w-full sm:w-56 h-12 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-purple-400 focus:border-purple-500 transition-all duration-300">
                      <SelectValue placeholder="📂 All Categories" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-0 shadow-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm max-h-80 w-72">
                      {/* Category Search */}
                      <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                        <div className="relative">
                          <Input
                            placeholder="🔍 Search categories..."
                            value={categorySearchTerm}
                            onChange={(e) =>
                              handleCategorySearch(e.target.value)
                            }
                            className="h-8 text-sm bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-lg focus:border-purple-500"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        {hasMoreCategories && (
                          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                            <span>
                              Showing {visibleCategoryCount} of{" "}
                              {filteredCategories.length} categories
                            </span>
                          </div>
                        )}
                      </div>

                      {/* All Categories Option */}
                      <SelectItem
                        value="all"
                        className="rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/50 font-medium"
                      >
                        📚 All Categories
                      </SelectItem>

                      {/* Loading State */}
                      {(isLoadingCategories || isAutoLoadingCategories) && (
                        <div className="p-3 text-center">
                          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            {isAutoLoadingCategories
                              ? "Loading more..."
                              : "Loading categories..."}
                          </div>
                        </div>
                      )}

                      {/* Categories List */}
                      {!isLoadingCategories &&
                        visibleCategories.length > 0 &&
                        visibleCategories.map((category, index) => (
                          <SelectItem
                            key={category}
                            value={category}
                            className="rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/50"
                            ref={
                              index === visibleCategories.length - 3 &&
                              hasMoreCategories
                                ? setCategoryScrollRef
                                : null
                            }
                          >
                            📖 {category}
                          </SelectItem>
                        ))}

                      {/* Auto-scroll Trigger Element (invisible) */}
                      {hasMoreCategories &&
                        !isLoadingCategories &&
                        visibleCategories.length > 5 && (
                          <div
                            ref={setCategoryScrollRef}
                            className="h-1 w-full opacity-0"
                            aria-hidden="true"
                          />
                        )}

                      {/* No Results */}
                      {!isLoadingCategories &&
                        visibleCategories.length === 0 &&
                        categorySearchTerm && (
                          <div className="p-3 text-center text-sm text-gray-500 dark:text-gray-400">
                            No categories found for "{categorySearchTerm}"
                          </div>
                        )}

                      {/* Load More Button for manual loading */}
                      {!isLoadingCategories &&
                        !isAutoLoadingCategories &&
                        hasMoreCategories && (
                          <div className="p-2 border-t border-gray-200 dark:border-gray-600">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-all duration-300"
                              onClick={(e) => {
                                e.stopPropagation();
                                loadMoreCategories();
                              }}
                            >
                              📂 Load More Categories (
                              {filteredCategories.length - visibleCategoryCount}{" "}
                              remaining)
                            </Button>
                          </div>
                        )}

                      {/* Auto-scroll Indicator */}
                      {!isLoadingCategories && hasMoreCategories && (
                        <div className="p-2 border-t border-gray-200 dark:border-gray-600">
                          <div className="text-xs text-center text-gray-500 dark:text-gray-400">
                            💡 Scroll down for more categories
                          </div>
                        </div>
                      )}
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
                    📊 Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.totalCount
                    )}{" "}
                    of{" "}
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {pagination.totalCount}
                    </span>{" "}
                    books
                  </span>
                  {searchTerm && (
                    <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 rounded-full text-xs font-medium">
                      🔍 "{searchTerm}"
                    </span>
                  )}
                  {selectedCategory !== "all" && (
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                      📂 {selectedCategory}
                    </span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Books Display */}
        <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 border-0 shadow-2xl rounded-2xl overflow-hidden animate-fade-in">
          <CardHeader className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 text-white p-6">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold">
              <div className="p-2 bg-white/20 rounded-xl">
                <BookOpen className="h-6 w-6" />
              </div>
              Books Collection
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
              <div className="overflow-x-auto w-full">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/50 border-0">
                      <TableHead className="font-bold text-gray-700 dark:text-gray-300 py-4">
                        📚 Title
                      </TableHead>
                      <TableHead className="font-bold text-gray-700 dark:text-gray-300">
                        ✍️ Author
                      </TableHead>
                      <TableHead className="font-bold text-gray-700 dark:text-gray-300">
                        🔢 ISBN
                      </TableHead>
                      <TableHead className="font-bold text-gray-700 dark:text-gray-300">
                        📂 Category
                      </TableHead>
                      <TableHead className="font-bold text-gray-700 dark:text-gray-300">
                        📊 Status
                      </TableHead>
                      <TableHead className="font-bold text-gray-700 dark:text-gray-300">
                        📖 Copies
                      </TableHead>
                      <TableHead className="font-bold text-gray-700 dark:text-gray-300">
                        📅 Year
                      </TableHead>
                      <TableHead className="font-bold text-gray-700 dark:text-gray-300">
                        ⚡ Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {books.map((book, index) => (
                      <TableRow
                        key={book.id}
                        className="group hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 transition-all duration-500 border-0 animate-slide-in cursor-pointer"
                        style={{ animationDelay: `${index * 100}ms` }}
                        onClick={() => handleViewDetails(book)}
                      >
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3 max-w-[250px]">
                            {/* Book Thumbnail */}
                            <div className="flex-shrink-0">
                              {book.thumbnail ? (
                                <img
                                  src={book.thumbnail}
                                  alt={book.title}
                                  className="w-12 h-16 object-cover rounded-lg shadow-md border border-gray-200 dark:border-gray-600"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : (
                                <div className="w-12 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-600">
                                  <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                              )}
                            </div>

                            {/* Book Details */}
                            <div className="flex-1 min-w-0">
                              <div
                                className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300"
                                title={book.title}
                              >
                                {book.title}
                              </div>
                              {book.description && (
                                <div
                                  className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1"
                                  title={book.description}
                                >
                                  {book.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 max-w-[200px]">
                            <div className="p-1 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                              <User className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                            </div>
                            <span
                              className="truncate text-gray-700 dark:text-gray-300"
                              title={book.author}
                            >
                              {book.author}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 max-w-[150px]">
                            <div className="p-1 bg-green-100 dark:bg-green-900/50 rounded-lg">
                              <Hash className="h-3 w-3 text-green-600 dark:text-green-400" />
                            </div>
                            <span
                              className="truncate font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md"
                              title={book.isbn}
                            >
                              {book.isbn}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300 hover:shadow-md transition-all duration-300"
                          >
                            {book.category}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(book.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <div className="w-12 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
                                  style={{
                                    width: `${
                                      (book.availableCopies /
                                        book.totalCopies) *
                                      100
                                    }%`,
                                  }}
                                />
                              </div>
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {book.availableCopies}/{book.totalCopies}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="p-1 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                              <Calendar className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="text-sm font-medium">
                              {book.publishedYear}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <ProtectedAction resource="books" action="update">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(book);
                                }}
                                className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/50 dark:hover:bg-blue-800 border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:scale-110 transition-all duration-300"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </ProtectedAction>
                            <ProtectedAction resource="books" action="delete">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => e.stopPropagation()}
                                    className="bg-red-50 hover:bg-red-100 dark:bg-red-900/50 dark:hover:bg-red-800 border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 hover:scale-110 transition-all duration-300"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-2xl border-0 shadow-2xl">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-xl font-bold text-red-600">
                                      🗑️ Delete Book
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                                      Are you sure you want to delete{" "}
                                      <span className="font-semibold text-gray-900 dark:text-white">
                                        "{book.title}"
                                      </span>
                                      ? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="rounded-xl">
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteBook(book.id)}
                                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl"
                                    >
                                      Delete Book
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </ProtectedAction>
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
              {books.map((book, index) => (
                <Card
                  key={book.id}
                  className="group bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/30 border-0 shadow-lg hover:shadow-2xl rounded-2xl overflow-hidden transform hover:scale-[1.02] transition-all duration-500 animate-slide-in cursor-pointer"
                  style={{ animationDelay: `${index * 150}ms` }}
                  onClick={() => handleViewDetails(book)}
                >
                  <CardContent className="p-0">
                    {/* Gradient Header with Thumbnail */}
                    <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 p-4 text-white">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex gap-3 flex-1 min-w-0">
                          {/* Book Thumbnail */}
                          <div className="flex-shrink-0">
                            {book.thumbnail ? (
                              <img
                                src={book.thumbnail}
                                alt={book.title}
                                className="w-16 h-20 object-cover rounded-lg shadow-lg border-2 border-white/20"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="w-16 h-20 bg-white/20 rounded-lg flex items-center justify-center border-2 border-white/20">
                                <BookOpen className="h-8 w-8 text-white" />
                              </div>
                            )}
                          </div>

                          {/* Book Details */}
                          <div className="flex-1 min-w-0">
                            <h3
                              className="font-bold text-lg break-words mb-2"
                              title={book.title}
                            >
                              📚 {book.title}
                            </h3>
                            <div className="flex items-center gap-2 text-blue-100">
                              <div className="p-1 bg-white/20 rounded-lg">
                                <User className="h-4 w-4" />
                              </div>
                              <span
                                className="break-words font-medium"
                                title={book.author}
                              >
                                {book.author}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 flex-shrink-0">
                          <ProtectedAction resource="books" action="update">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(book);
                              }}
                              className="bg-white/20 hover:bg-white/30 border-white/30 text-white hover:scale-110 transition-all duration-300 rounded-xl"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </ProtectedAction>
                          <ProtectedAction resource="books" action="delete">
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
                                    🗑️ Delete Book
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                                    Are you sure you want to delete{" "}
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                      "{book.title}"
                                    </span>
                                    ? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="rounded-xl">
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteBook(book.id)}
                                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl"
                                  >
                                    Delete Book
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </ProtectedAction>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-4">
                      {/* Description */}
                      {book.description && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                          <p className="text-sm text-gray-600 dark:text-gray-400 break-words italic">
                            💬 {book.description}
                          </p>
                        </div>
                      )}

                      {/* ISBN */}
                      <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                        <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                          <Hash className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                            ISBN
                          </div>
                          <span
                            className="font-mono text-sm font-semibold text-gray-900 dark:text-white break-all"
                            title={book.isbn}
                          >
                            {book.isbn}
                          </span>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                          <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">
                            📂 Category
                          </div>
                          <Badge
                            variant="outline"
                            className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300"
                          >
                            {book.category}
                          </Badge>
                        </div>

                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                            📊 Status
                          </div>
                          {getStatusBadge(book.status)}
                        </div>

                        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                          <div className="text-xs text-orange-600 dark:text-orange-400 font-medium mb-1">
                            📖 Copies
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm font-semibold">
                              <span>{book.availableCopies} available</span>
                              <span>{book.totalCopies} total</span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-500"
                                style={{
                                  width: `${
                                    (book.availableCopies / book.totalCopies) *
                                    100
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                          <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-1">
                            📅 Year
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-indigo-500" />
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {book.publishedYear}
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
                    <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
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
        {books.length === 0 && !loading && (
          <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 border-0 shadow-xl rounded-2xl animate-bounce-in">
            <CardContent className="p-8">
              <div className="text-center py-12">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full opacity-20 animate-ping"></div>
                  <div className="relative p-6 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-full mx-auto w-24 h-24 flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>

                <h3 className="mt-6 text-xl font-bold text-gray-900 dark:text-gray-100">
                  {searchTerm || selectedCategory !== "all"
                    ? "🔍 No Books Found"
                    : "📚 No Books Yet"}
                </h3>

                <p className="mt-3 text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  {searchTerm || selectedCategory !== "all"
                    ? "We couldn't find any books matching your search criteria. Try adjusting your filters or search terms."
                    : "Your library collection is empty. Start building your collection by adding your first book!"}
                </p>

                {!searchTerm && selectedCategory === "all" && (
                  <Button
                    onClick={() => setIsCreateOpen(true)}
                    className="mt-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Add Your First Book
                  </Button>
                )}

                {(searchTerm || selectedCategory !== "all") && (
                  <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedCategory("all");
                        setCurrentPage(1);
                        fetchBooks(1, "", "all");
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
                      Add New Book
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Book Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col bg-gradient-to-br from-slate-50/95 via-white/95 to-blue-50/95 dark:from-slate-900/95 dark:via-slate-800/95 dark:to-indigo-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30">
            {/* Header Section */}
            <div className="relative overflow-hidden flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 opacity-10 dark:opacity-20"></div>
              <div className="relative flex items-center gap-4 p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="p-4 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-lg transform hover:scale-105 transition-transform">
                  <Edit className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-blue-700 dark:from-purple-300 dark:to-blue-300 bg-clip-text text-transparent">
                    ✏️ Edit Book
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 dark:text-gray-400 mt-1">
                    📝 Update book information and details
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
                id="edit-book-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  updateBook();
                }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Basic Info */}
                  <div className="space-y-6">
                    <div className="bg-white/70 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        📝 Basic Information
                      </h3>
                      <div className="space-y-5">
                        <div className="group">
                          <Label
                            htmlFor="edit-title"
                            className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block"
                          >
                            📖 Book Title *
                          </Label>
                          <Input
                            id="edit-title"
                            value={formData.title}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                title: e.target.value,
                              }))
                            }
                            placeholder="Enter the book title..."
                            className="h-12 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-300"
                            required
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            The main title of the book
                          </p>
                        </div>

                        <div className="group">
                          <Label
                            htmlFor="edit-author"
                            className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block"
                          >
                            ✍️ Author *
                          </Label>
                          <Input
                            id="edit-author"
                            value={formData.author}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                author: e.target.value,
                              }))
                            }
                            placeholder="Enter author name..."
                            className="h-12 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-300"
                            required
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Who wrote this book?
                          </p>
                        </div>

                        <div className="group">
                          <Label
                            htmlFor="edit-isbn"
                            className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block"
                          >
                            🔢 ISBN *
                          </Label>
                          <Input
                            id="edit-isbn"
                            value={formData.isbn}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                isbn: e.target.value,
                              }))
                            }
                            placeholder="Enter ISBN number..."
                            className="h-12 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-300"
                            required
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            International Standard Book Number
                          </p>
                        </div>

                        <div className="group">
                          <Label
                            htmlFor="edit-description"
                            className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block"
                          >
                            📝 Description
                          </Label>
                          <Textarea
                            id="edit-description"
                            value={formData.description}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                description: e.target.value,
                              }))
                            }
                            placeholder="Enter book description or summary..."
                            className="bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-300"
                            rows={4}
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            A short summary or synopsis
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Advanced Info */}
                  <div className="space-y-6">
                    {/* Book Cover Section */}
                    <div className="bg-white/70 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        🖼️ Book Cover
                      </h3>
                      <div className="space-y-4">
                        <div className="group">
                          <Label
                            htmlFor="edit-thumbnail"
                            className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block"
                          >
                            📷 Cover Image URL
                          </Label>
                          <Input
                            id="edit-thumbnail"
                            value={formData.thumbnail}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                thumbnail: e.target.value,
                              }))
                            }
                            placeholder="Paste image URL here..."
                            className="h-12 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-300"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Direct link to the book cover image
                          </p>
                        </div>
                        {formData.thumbnail && (
                          <div className="flex justify-center">
                            <div className="relative group">
                              <img
                                src={formData.thumbnail}
                                alt="Book cover preview"
                                className="w-24 h-32 object-cover rounded-xl border-2 border-gray-200 dark:border-gray-600 shadow-lg group-hover:scale-105 transition-transform"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-colors"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Classification Section */}
                    <div className="bg-white/70 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        🏷️ Classification
                      </h3>
                      <div className="space-y-5">
                        <div className="group">
                          <Label
                            htmlFor="edit-category"
                            className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block"
                          >
                            📂 Category *
                          </Label>
                          <Select
                            value={formData.category}
                            onValueChange={(value) =>
                              setFormData((prev) => ({
                                ...prev,
                                category: value,
                              }))
                            }
                          >
                            <SelectTrigger className="h-12 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 transition-all duration-300">
                              <SelectValue placeholder="Choose a category..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-0 shadow-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm max-h-60">
                              <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                                <Input
                                  placeholder="🔍 Search categories..."
                                  value={categorySearchTerm}
                                  onChange={(e) =>
                                    handleCategorySearch(e.target.value)
                                  }
                                  className="h-8 text-sm bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-lg"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                              {visibleCategories.length > 0 &&
                                visibleCategories.map((category) => (
                                  <SelectItem
                                    key={category}
                                    value={category}
                                    className="rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/50"
                                  >
                                    📖 {category}
                                  </SelectItem>
                                ))}
                              {visibleCategories.length === 0 &&
                                categorySearchTerm && (
                                  <div className="p-3 text-center text-sm text-gray-500 dark:text-gray-400">
                                    No categories found. You can still type a
                                    custom category.
                                  </div>
                                )}
                              {hasMoreCategories && (
                                <div className="p-2 border-t border-gray-200 dark:border-gray-600">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full text-xs text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/50"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      loadMoreCategories();
                                    }}
                                  >
                                    📂 Load More (
                                    {filteredCategories.length -
                                      visibleCategoryCount}{" "}
                                    remaining)
                                  </Button>
                                </div>
                              )}
                              {!categorySearchTerm &&
                                categories.map((category) => (
                                  <SelectItem
                                    key={category}
                                    value={category}
                                    className="rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/50"
                                  >
                                    📖 {category}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Choose or search a category
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="group">
                            <Label
                              htmlFor="edit-publishedYear"
                              className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block"
                            >
                              📅 Year *
                            </Label>
                            <Input
                              id="edit-publishedYear"
                              type="number"
                              value={formData.publishedYear}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  publishedYear: parseInt(e.target.value),
                                }))
                              }
                              placeholder="2024"
                              className="h-12 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-300"
                              required
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              Publication year
                            </p>
                          </div>
                          <div className="group">
                            <Label
                              htmlFor="edit-status"
                              className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block"
                            >
                              📊 Status *
                            </Label>
                            <Select
                              value={formData.status}
                              onValueChange={(value) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  status: value,
                                }))
                              }
                            >
                              <SelectTrigger className="h-12 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 transition-all duration-300">
                                <SelectValue placeholder="Status..." />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                <SelectItem value="available">
                                  ✅ Available
                                </SelectItem>
                                <SelectItem value="checked_out">
                                  📤 Checked Out
                                </SelectItem>
                                <SelectItem value="reserved">
                                  🔒 Reserved
                                </SelectItem>
                                <SelectItem value="maintenance">
                                  🔧 Maintenance
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              Current status
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="group">
                            <Label
                              htmlFor="edit-totalCopies"
                              className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block"
                            >
                              📚 Total Copies *
                            </Label>
                            <Input
                              id="edit-totalCopies"
                              type="number"
                              min="1"
                              value={formData.totalCopies}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  totalCopies: parseInt(e.target.value),
                                }))
                              }
                              placeholder="1"
                              className="h-12 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-300"
                              required
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              Total quantity
                            </p>
                          </div>
                          <div className="group">
                            <Label
                              htmlFor="edit-availableCopies"
                              className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block"
                            >
                              📖 Available *
                            </Label>
                            <Input
                              id="edit-availableCopies"
                              type="number"
                              min="0"
                              max={formData.totalCopies}
                              value={formData.availableCopies}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  availableCopies: parseInt(e.target.value),
                                }))
                              }
                              placeholder="1"
                              className="h-12 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-300"
                              required
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              Available now
                            </p>
                          </div>
                        </div>
                      </div>
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
                  onClick={() => setIsEditOpen(false)}
                  className="px-8 py-3 h-12 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105 transition-all duration-300 font-medium"
                >
                  ❌ Cancel
                </Button>
                <Button
                  form="edit-book-form"
                  type="submit"
                  className="px-8 py-3 h-12 rounded-xl bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-600 hover:from-purple-600 hover:via-blue-600 hover:to-indigo-700 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 min-w-[160px]"
                >
                  <Edit className="mr-2 h-5 w-5" />✨ Update Book
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Book Details Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                <BookOpen className="h-6 w-6" />
                📖 Book Details
              </DialogTitle>
            </DialogHeader>

            {viewingBook && (
              <div className="space-y-6">
                {/* Book Cover and Basic Info */}
                <div className="flex gap-6">
                  {/* Thumbnail */}
                  <div className="flex-shrink-0">
                    {viewingBook.thumbnail ? (
                      <img
                        src={viewingBook.thumbnail}
                        alt={viewingBook.title}
                        className="w-32 h-44 object-cover rounded-xl shadow-lg border border-gray-200 dark:border-gray-600"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.nextElementSibling?.classList.remove(
                            "hidden"
                          );
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-32 h-44 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-xl flex items-center justify-center border border-gray-200 dark:border-gray-600 ${
                        viewingBook.thumbnail ? "hidden" : ""
                      }`}
                    >
                      <BookOpen className="h-16 w-16 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {viewingBook.title}
                      </h3>
                      <p className="text-lg text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <User className="h-5 w-5" />
                        by {viewingBook.author}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Badge
                        variant="outline"
                        className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300"
                      >
                        📂 {viewingBook.category}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`${
                          viewingBook.status === "available"
                            ? "bg-green-100 dark:bg-green-900/50 border-green-300 dark:border-green-600 text-green-700 dark:text-green-300"
                            : viewingBook.status === "checked_out"
                            ? "bg-red-100 dark:bg-red-900/50 border-red-300 dark:border-red-600 text-red-700 dark:text-red-300"
                            : viewingBook.status === "reserved"
                            ? "bg-yellow-100 dark:bg-yellow-900/50 border-yellow-300 dark:border-yellow-600 text-yellow-700 dark:text-yellow-300"
                            : "bg-gray-100 dark:bg-gray-900/50 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {viewingBook.status === "available" && "✅ Available"}
                        {viewingBook.status === "checked_out" &&
                          "📤 Checked Out"}
                        {viewingBook.status === "reserved" && "🔒 Reserved"}
                        {viewingBook.status === "maintenance" &&
                          "🔧 Maintenance"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {viewingBook.description && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      📄 Description
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {viewingBook.description}
                    </p>
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Hash className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-semibold text-blue-900 dark:text-blue-300">
                        ISBN
                      </span>
                    </div>
                    <p className="font-mono text-gray-700 dark:text-gray-300">
                      {viewingBook.isbn}
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <span className="font-semibold text-green-900 dark:text-green-300">
                        Published Year
                      </span>
                    </div>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">
                      {viewingBook.publishedYear}
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      <span className="font-semibold text-purple-900 dark:text-purple-300">
                        Total Copies
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                      {viewingBook.totalCopies}
                    </p>
                  </div>

                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      <span className="font-semibold text-orange-900 dark:text-orange-300">
                        Available Copies
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                      {viewingBook.availableCopies}
                    </p>
                  </div>
                </div>

                {/* Added Date */}
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <span className="font-semibold text-indigo-900 dark:text-indigo-300">
                      Added to Library
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {new Date(viewingBook.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                Close
              </Button>
              {viewingBook && (
                <ProtectedAction resource="books" action="update">
                  <Button
                    onClick={() => {
                      setIsDetailOpen(false);
                      handleEdit(viewingBook);
                    }}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Book
                  </Button>
                </ProtectedAction>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
