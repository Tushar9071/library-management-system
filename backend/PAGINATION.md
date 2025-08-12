# Pagination API Documentation

## Books API

### Get Paginated Books

```
GET /books?page=1&limit=10&search=harry&category=fiction
```

#### Query Parameters:

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search in title, author, or description
- `category` (optional): Filter by book category

#### Response:

```json
{
  "message": "Books retrieved successfully",
  "data": [
    {
      "id": "1",
      "title": "Harry Potter and the Philosopher's Stone",
      "author": "J.K. Rowling",
      "isbn": "9780747532699",
      "description": "The first book in the Harry Potter series",
      "category": "Fantasy",
      "status": "available",
      "publishedYear": 1997,
      "totalCopies": 5,
      "availableCopies": 3,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalCount": 6000,
    "totalPages": 600,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Get Book Categories

```
GET /books/categories
```

#### Response:

```json
{
  "message": "Categories retrieved successfully",
  "data": ["Fiction", "Non-Fiction", "Science", "History", "Fantasy"]
}
```

## Users API

### Get Paginated Users

```
GET /users?page=1&limit=10&search=john&role=Student
```

#### Query Parameters:

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search in email, first name, last name, or phone
- `role` (optional): Filter by user role

#### Response:

```json
{
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "1",
      "email": "john.doe@example.com",
      "name": "John Doe",
      "phone": "+1234567890",
      "role": {
        "id": "1",
        "name": "Student"
      },
      "status": "active",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "lastLogin": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalCount": 1500,
    "totalPages": 150,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Get User Roles

```
GET /users/roles
```

#### Response:

```json
{
  "message": "User roles retrieved successfully",
  "data": [
    {
      "id": "1",
      "name": "Student"
    },
    {
      "id": "2",
      "name": "Faculty"
    },
    {
      "id": "3",
      "name": "Admin"
    }
  ]
}
```

## Performance Benefits

With 6000+ books, pagination provides several benefits:

1. **Reduced Load Time**: Instead of loading 6000 books at once, you load only 10-50 books per page
2. **Better UX**: Users can navigate through books efficiently
3. **Reduced Memory Usage**: Lower memory consumption on both client and server
4. **Faster Database Queries**: Using SKIP and TAKE operations with proper indexing
5. **Search Functionality**: Efficient searching across title, author, and description
6. **Category Filtering**: Quick filtering by book categories

## Frontend Implementation Example

```typescript
// React/Next.js example
const [books, setBooks] = useState([]);
const [pagination, setPagination] = useState({});
const [currentPage, setCurrentPage] = useState(1);
const [searchTerm, setSearchTerm] = useState('');
const [selectedCategory, setSelectedCategory] = useState('all');

const fetchBooks = async (page = 1, search = '', category = 'all') => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: '10',
    ...(search && { search }),
    ...(category !== 'all' && { category }),
  });

  const response = await fetch(`/api/books?${params}`);
  const data = await response.json();

  setBooks(data.data);
  setPagination(data.pagination);
};

// Usage
useEffect(() => {
  fetchBooks(currentPage, searchTerm, selectedCategory);
}, [currentPage, searchTerm, selectedCategory]);
```

## Database Indexing Recommendations

For optimal performance with large datasets, add these indexes to your database:

```sql
-- Books table indexes
CREATE INDEX idx_book_master_title ON book_master(title);
CREATE INDEX idx_book_master_author ON book_master(author);
CREATE INDEX idx_book_master_category ON book_master(category);
CREATE INDEX idx_book_master_created_at ON book_master(createdAt);

-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_info_firstname ON user_info(firstname);
CREATE INDEX idx_user_info_lastname ON user_info(lastname);
CREATE INDEX idx_users_created_at ON users(createdAt);
```
