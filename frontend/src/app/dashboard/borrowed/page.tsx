"use client";
import React, { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { ProtectedFeature } from "@/components/ProtectedFeature";

interface HistoryItem {
  id: number;
  bookId: number;
  title: string;
  author: string;
  borrowDate: string;
  dueDate: string;
  returnedAt: string;
  daysLate: number;
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function BorrowHistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchHistory = async (p = 1) => {
    setLoading(true);
    try {
      const res = await apiGet(`/borrows/history?page=${p}&limit=10`);
      const data = await res.json();
      setItems(data.data || []);
      setPagination(data.pagination);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(page);
  }, [page]);

  return (
    <ProtectedFeature permission="BORROW_BOOKS" fallback={<div className="p-6 text-gray-500">You don't have access to history.</div>}>
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Borrowed Books</h1>
        {loading ? (
          <div>Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-gray-500">No history yet.</div>
        ) : (
          <div className="space-y-3">
            {items.map((it) => (
              <div key={it.id} className="bg-white dark:bg-slate-800 border rounded p-4">
                <div className="font-medium">{it.title}</div>
                <div className="text-sm text-gray-500">{it.author}</div>
                <div className="text-xs text-gray-500">
                  Borrowed: {new Date(it.borrowDate).toLocaleDateString()} • Due: {new Date(it.dueDate).toLocaleDateString()} • Returned: {new Date(it.returnedAt).toLocaleDateString()}
                  {it.daysLate > 0 && (
                    <span className="ml-2 text-red-600">Late by {it.daysLate} day(s)</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {pagination && (
          <div className="flex gap-2">
            <button disabled={!pagination.hasPrev} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-2 border rounded">Prev</button>
            <span className="px-2 py-1 text-sm">Page {pagination.page} of {pagination.totalPages}</span>
            <button disabled={!pagination.hasNext} onClick={() => setPage((p) => p + 1)} className="px-3 py-2 border rounded">Next</button>
          </div>
        )}
      </div>
    </ProtectedFeature>
  );
}
