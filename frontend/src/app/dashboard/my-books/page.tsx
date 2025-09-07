"use client";
import React, { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { ProtectedFeature } from "@/components/ProtectedFeature";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

interface ActiveBorrow {
  id: number;
  bookId: number;
  title: string;
  author: string;
  borrowDate: string;
  dueDate: string;
  overdueDays: number;
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function MyBooksPage() {
  const [items, setItems] = useState<ActiveBorrow[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchBorrows = async (p = 1) => {
    setLoading(true);
    try {
      const res = await apiGet(`/borrows/my?page=${p}&limit=10`);
      const data = await res.json();
      setItems(data.data || []);
      setPagination(data.pagination);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load borrows");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrows(page);
  }, [page]);

  const returnBook = async (bookId: number) => {
    try {
      const res = await apiPost(`/borrows/return/${bookId}`, {});
      const data = await res.json();
      if (res.ok) {
        if (data.data?.fine > 0) {
          toast(`Returned with fine ₹${data.data.fine}`);
        } else {
          toast.success("Book returned");
        }
        fetchBorrows(page);
      } else {
        toast.error(data.message || "Return failed");
      }
    } catch (e) {
      console.error(e);
      toast.error("Return failed");
    }
  };

  return (
    <ProtectedFeature permission="BORROW_BOOKS" fallback={<div className="p-6 text-gray-500">You don't have access to borrowing features.</div>}>
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-semibold">My Books</h1>
        {loading ? (
          <div>Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-gray-500">No active borrows.</div>
        ) : (
          <div className="space-y-3">
            {items.map((it) => (
              <div key={it.id} className="bg-white dark:bg-slate-800 border rounded p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{it.title}</div>
                  <div className="text-sm text-gray-500">{it.author}</div>
                  <div className="text-xs text-gray-500">
                    Borrowed: {new Date(it.borrowDate).toLocaleDateString()} • Due: {new Date(it.dueDate).toLocaleDateString()}
                    {it.overdueDays > 0 && (
                      <span className="ml-2 text-red-600">Overdue {it.overdueDays} day(s)</span>
                    )}
                  </div>
                </div>
                <Button variant="outline" onClick={() => returnBook(it.bookId)}>Return</Button>
              </div>
            ))}
          </div>
        )}
        {pagination && (
          <div className="flex gap-2">
            <Button disabled={!pagination.hasPrev} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
            <span className="px-2 py-1 text-sm">Page {pagination.page} of {pagination.totalPages}</span>
            <Button disabled={!pagination.hasNext} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        )}
      </div>
    </ProtectedFeature>
  );
}
