import { PlusCircle, Search, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Placeholder data for books
const books = [
  {
    id: "B001",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    genre: "Classic",
    status: "Available",
  },
  {
    id: "B002",
    title: "1984",
    author: "George Orwell",
    genre: "Dystopian",
    status: "Borrowed",
  },
  {
    id: "B003",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    genre: "Classic",
    status: "Available",
  },
  {
    id: "B004",
    title: "Dune",
    author: "Frank Herbert",
    genre: "Science Fiction",
    status: "Available",
  },
  {
    id: "B005",
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    genre: "Fantasy",
    status: "Borrowed",
  },
]

export default function ManageBooksPage() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-8 border border-gray-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Books</h2>
        <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white">
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Book
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
        <Input
          placeholder="Search books by title or author..."
          className="pl-9 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-slate-700">
              <TableHead className="text-gray-700 dark:text-gray-300">ID</TableHead>
              <TableHead className="text-gray-700 dark:text-gray-300">Title</TableHead>
              <TableHead className="text-gray-700 dark:text-gray-300">Author</TableHead>
              <TableHead className="text-gray-700 dark:text-gray-300">Genre</TableHead>
              <TableHead className="text-gray-700 dark:text-gray-300">Status</TableHead>
              <TableHead className="text-right text-gray-700 dark:text-gray-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {books.map((book) => (
              <TableRow key={book.id} className="border-b border-gray-200 dark:border-slate-700">
                <TableCell className="font-medium text-gray-900 dark:text-white">{book.id}</TableCell>
                <TableCell className="text-gray-800 dark:text-gray-200">{book.title}</TableCell>
                <TableCell className="text-gray-800 dark:text-gray-200">{book.author}</TableCell>
                <TableCell className="text-gray-800 dark:text-gray-200">{book.genre}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      book.status === "Available"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                    }`}
                  >
                    {book.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
