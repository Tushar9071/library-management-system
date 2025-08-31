# Library Management System - API Testing Guide

## Base URL

- Development: `http://localhost:8000/api`
- All endpoints require `/api` prefix

## Authentication Endpoints

### POST /auth/signup

**Type:** POST
**Path:** `/auth/signup`
**Description:** Register a new user
**Headers:**

```
Content-Type: application/json
```

**Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "1234567890",
  "birthDate": "1990-01-01",
  "gender": "Male"
}
```

**Test Data:**

```json
{
  "email": "testuser@library.com",
  "password": "test123",
  "firstName": "Test",
  "lastName": "User",
  "phone": "9876543210",
  "birthDate": "1995-06-15",
  "gender": "Female"
}
```

### POST /auth/login

**Type:** POST
**Path:** `/auth/login`
**Description:** Login user
**Headers:**

```
Content-Type: application/json
```

**Body:**

```json
{
  "email": "admin@library.com",
  "password": "admin123"
}
```

**Test Data:**

```json
{
  "email": "admin@library.com",
  "password": "admin123"
}
```

**Response:**

```json
{
  "message": "Login successful",
  "data": {
    "id": 1,
    "email": "admin@library.com",
    "role": "Admin",
    "name": "Admin User",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /auth/google-login

**Type:** POST
**Path:** `/auth/google-login`
**Description:** Google OAuth login
**Headers:**

```
Content-Type: application/json
```

**Body:**

```json
{
  "token": "google_oauth_token_here"
}
```

### POST /auth/github-login

**Type:** POST
**Path:** `/auth/github-login`
**Description:** GitHub OAuth login
**Headers:**

```
Content-Type: application/json
```

**Body:**

```json
{
  "token": "github_oauth_token_here"
}
```

### POST /auth/logout

**Type:** POST
**Path:** `/auth/logout`
**Description:** Logout user
**Headers:**

```
Authorization: Bearer {token}
```

## Books Endpoints

### GET /books

**Type:** GET
**Path:** `/books`
**Description:** Get all books with pagination
**Headers:**

```
Authorization: Bearer {token}
```

**Query Parameters:**

```
?page=1&limit=10&search=javascript&category=technology
```

**Test URLs:**

```
GET /books
GET /books?page=1&limit=5
GET /books?search=javascript
GET /books?category=Fiction
GET /books?page=2&limit=10&search=programming&category=Technology
```

### GET /books/test-no-auth

**Type:** GET
**Path:** `/books/test-no-auth`
**Description:** Test endpoint without authentication
**Headers:** None required

### GET /books/categories

**Type:** GET
**Path:** `/books/categories`
**Description:** Get all book categories
**Headers:**

```
Authorization: Bearer {token}
```

### GET /books/:id

**Type:** GET
**Path:** `/books/{id}`
**Description:** Get single book by ID
**Headers:**

```
Authorization: Bearer {token}
```

**Test URLs:**

```
GET /books/1
GET /books/2
```

### POST /books

**Type:** POST
**Path:** `/books`
**Description:** Create new book
**Headers:**

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**

```json
{
  "title": "JavaScript: The Good Parts",
  "author": "Douglas Crockford",
  "isbn": "978-0596517748",
  "description": "A comprehensive guide to JavaScript programming",
  "category": "Technology",
  "status": "available",
  "publishedYear": 2008,
  "totalCopies": 5,
  "availableCopies": 5,
  "thumbnail": "https://example.com/book-cover.jpg"
}
```

**Test Data:**

```json
{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "isbn": "978-0132350884",
  "description": "A handbook of agile software craftsmanship",
  "category": "Programming",
  "status": "available",
  "publishedYear": 2008,
  "totalCopies": 3,
  "availableCopies": 3,
  "thumbnail": ""
}
```

### PUT /books/:id

**Type:** PUT
**Path:** `/books/{id}`
**Description:** Update book by ID
**Headers:**

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**

```json
{
  "title": "Updated Book Title",
  "author": "Updated Author",
  "isbn": "978-0000000000",
  "description": "Updated description",
  "category": "Updated Category",
  "status": "borrowed",
  "publishedYear": 2023,
  "totalCopies": 10,
  "availableCopies": 8,
  "thumbnail": "https://example.com/updated-cover.jpg"
}
```

### DELETE /books/:id

**Type:** DELETE
**Path:** `/books/{id}`
**Description:** Delete book by ID
**Headers:**

```
Authorization: Bearer {token}
```

**Test URLs:**

```
DELETE /books/1
DELETE /books/2
```

## Users Endpoints

### GET /users

**Type:** GET
**Path:** `/users`
**Description:** Get all users with pagination
**Headers:**

```
Authorization: Bearer {token}
```

**Query Parameters:**

```
?page=1&limit=10&search=admin&role=Admin
```

**Test URLs:**

```
GET /users
GET /users?page=1&limit=5
GET /users?search=admin
GET /users?role=Admin
```

### GET /users/roles

**Type:** GET
**Path:** `/users/roles`
**Description:** Get all available roles
**Headers:**

```
Authorization: Bearer {token}
```

### GET /users/:id

**Type:** GET
**Path:** `/users/{id}`
**Description:** Get single user by ID
**Headers:**

```
Authorization: Bearer {token}
```

**Test URLs:**

```
GET /users/1
GET /users/2
```

### POST /users

**Type:** POST
**Path:** `/users`
**Description:** Create new user
**Headers:**

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**

```json
{
  "email": "newuser@library.com",
  "name": "New User",
  "phone": "1234567890",
  "password": "newpassword123",
  "roleId": "2",
  "status": "active"
}
```

**Test Data:**

```json
{
  "email": "librarian@library.com",
  "name": "Library Staff",
  "phone": "9876543210",
  "password": "librarian123",
  "roleId": "2",
  "status": "active"
}
```

### PUT /users/:id

**Type:** PUT
**Path:** `/users/{id}`
**Description:** Update user by ID
**Headers:**

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**

```json
{
  "email": "updated@library.com",
  "name": "Updated Name",
  "phone": "0987654321",
  "roleId": "3",
  "status": "inactive"
}
```

### DELETE /users/:id

**Type:** DELETE
**Path:** `/users/{id}`
**Description:** Delete user by ID
**Headers:**

```
Authorization: Bearer {token}
```

## Roles Endpoints

### GET /roles

**Type:** GET
**Path:** `/roles`
**Description:** Get all roles
**Headers:**

```
Authorization: Bearer {token}
```

### GET /roles/:id

**Type:** GET
**Path:** `/roles/{id}`
**Description:** Get single role by ID
**Headers:**

```
Authorization: Bearer {token}
```

**Test URLs:**

```
GET /roles/1
GET /roles/2
```

### POST /roles

**Type:** POST
**Path:** `/roles`
**Description:** Create new role
**Headers:**

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**

```json
{
  "name": "Librarian",
  "description": "Library staff with book management access"
}
```

**Test Data:**

```json
{
  "name": "Student",
  "description": "Student user with limited access"
}
```

### PUT /roles/:id

**Type:** PUT
**Path:** `/roles/{id}`
**Description:** Update role by ID
**Headers:**

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**

```json
{
  "name": "Updated Role",
  "description": "Updated role description"
}
```

### DELETE /roles/:id

**Type:** DELETE
**Path:** `/roles/{id}`
**Description:** Delete role by ID
**Headers:**

```
Authorization: Bearer {token}
```

## Permissions Endpoints

### GET /permissions

**Type:** GET
**Path:** `/permissions`
**Description:** Get all permissions
**Headers:**

```
Authorization: Bearer {token}
```

### GET /permissions/role/:roleId

**Type:** GET
**Path:** `/permissions/role/{roleId}`
**Description:** Get permissions for specific role
**Headers:**

```
Authorization: Bearer {token}
```

**Test URLs:**

```
GET /permissions/role/1
GET /permissions/role/2
```

### GET /permissions/user/:userId

**Type:** GET
**Path:** `/permissions/user/{userId}`
**Description:** Get permissions for specific user
**Headers:**

```
Authorization: Bearer {token}
```

**Test URLs:**

```
GET /permissions/user/1
GET /permissions/user/2
```

### POST /permissions/role/:roleId

**Type:** POST
**Path:** `/permissions/role/{roleId}`
**Description:** Update role permissions
**Headers:**

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**

```json
{
  "permissionIds": [1, 2, 3, 10, 11, 12]
}
```

**Test Data:**

```json
{
  "permissionIds": [10, 11]
}
```

### POST /permissions/initialize

**Type:** POST
**Path:** `/permissions/initialize`
**Description:** Initialize default permissions
**Headers:**

```
Authorization: Bearer {token}
```

## User Roles Endpoints

### GET /user-roles

**Type:** GET
**Path:** `/user-roles`
**Description:** Get all user role assignments
**Headers:**

```
Authorization: Bearer {token}
```

### GET /user-roles/:id

**Type:** GET
**Path:** `/user-roles/{id}`
**Description:** Get specific user role assignment
**Headers:**

```
Authorization: Bearer {token}
```

### POST /user-roles

**Type:** POST
**Path:** `/user-roles`
**Description:** Create user role assignment
**Headers:**

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**

```json
{
  "userId": 2,
  "roleId": 2
}
```

### PUT /user-roles/:id

**Type:** PUT
**Path:** `/user-roles/{id}`
**Description:** Update user role assignment
**Headers:**

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**

```json
{
  "userId": 2,
  "roleId": 3
}
```

### DELETE /user-roles/:id

**Type:** DELETE
**Path:** `/user-roles/{id}`
**Description:** Soft delete user role assignment
**Headers:**

```
Authorization: Bearer {token}
```

### DELETE /user-roles/:id/permanent

**Type:** DELETE
**Path:** `/user-roles/{id}/permanent`
**Description:** Permanently delete user role assignment
**Headers:**

```
Authorization: Bearer {token}
```

## Admin Endpoints

### POST /admin/initialize

**Type:** POST
**Path:** `/admin/initialize`
**Description:** Initialize admin user (First time setup)
**Headers:**

```
Content-Type: application/json
```

**Body:**

```json
{
  "email": "admin@library.com",
  "name": "Admin User",
  "password": "admin123"
}
```

### POST /admin/check-setup

**Type:** POST
**Path:** `/admin/check-setup`
**Description:** Check if admin setup is complete
**Headers:**

```
Content-Type: application/json
```

## CSV Endpoints

### GET /csv/getCsv

**Type:** GET
**Path:** `/csv/getCsv`
**Description:** Get CSV file
**Headers:**

```
Authorization: Bearer {token}
```

### GET /csv/readCsv

**Type:** GET
**Path:** `/csv/readCsv`
**Description:** Read CSV data
**Headers:**

```
Authorization: Bearer {token}
```

### GET /csv/setDataIndatabase

**Type:** GET
**Path:** `/csv/setDataIndatabase`
**Description:** Import CSV data to database
**Headers:**

```
Authorization: Bearer {token}
```

### GET /csv/allbook

**Type:** GET
**Path:** `/csv/allbook`
**Description:** Get all books from CSV
**Headers:**

```
Authorization: Bearer {token}
```

## Test Endpoints

### GET /test/admin

**Type:** GET
**Path:** `/test/admin`
**Description:** Test admin access
**Headers:**

```
Authorization: Bearer {token}
```

### GET /test/public

**Type:** GET
**Path:** `/test/public`
**Description:** Test public access
**Headers:** None required

## Complete Test Sequence

### 1. Initialize Admin (First Time)

```bash
curl -X POST http://localhost:8000/api/admin/initialize \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@library.com",
    "name": "Admin User",
    "password": "admin123"
  }'
```

### 2. Login as Admin

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@library.com",
    "password": "admin123"
  }'
```

### 3. Get Admin Token (Save from login response)

```
TOKEN="your_token_here"
```

### 4. Test Books Access

```bash
curl -X GET http://localhost:8000/api/books \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Create a Book

```bash
curl -X POST http://localhost:8000/api/books \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Book",
    "author": "Test Author",
    "isbn": "978-0000000000",
    "description": "A test book",
    "category": "Technology",
    "status": "available",
    "publishedYear": 2024,
    "totalCopies": 1,
    "availableCopies": 1
  }'
```

### 6. Get User Permissions

```bash
curl -X GET http://localhost:8000/api/permissions/user/1 \
  -H "Authorization: Bearer $TOKEN"
```

### 7. Get All Roles

```bash
curl -X GET http://localhost:8000/api/roles \
  -H "Authorization: Bearer $TOKEN"
```

### 8. Get All Users

```bash
curl -X GET http://localhost:8000/api/users \
  -H "Authorization: Bearer $TOKEN"
```

## PostgreSQL Database Queries

### Check Users Table

```sql
SELECT * FROM users;
```

### Check User Info Table

```sql
SELECT * FROM userinfo;
```

### Check Roles Table

```sql
SELECT * FROM roles;
```

### Check Permissions Table

```sql
SELECT * FROM permissions;
```

### Check Role Permissions

```sql
SELECT r.name as role_name, p.name as permission_name
FROM roles r
JOIN rolepermissions rp ON r.id = rp.roleid
JOIN permissions p ON rp.permissionid = p.id;
```

### Check User Roles

```sql
SELECT u.email, r.name as role_name
FROM users u
JOIN userinfo ui ON u.id = ui.userid
JOIN roles r ON ui.roleid = r.id;
```

### Check Books Table

```sql
SELECT * FROM books;
```

### Check All Tables

```sql
\dt
```

### Sample Data for Testing

#### Create Test Role

```sql
INSERT INTO roles (name, description) VALUES ('Librarian', 'Library staff member');
```

#### Create Test User

```sql
INSERT INTO users (email, password) VALUES ('librarian@library.com', 'hashed_password');
```

#### Create Test Book

```sql
INSERT INTO books (title, author, isbn, description, category, status, publishedyear, totalcopies, availablecopies)
VALUES ('Sample Book', 'Sample Author', '978-1234567890', 'A sample book for testing', 'Fiction', 'available', 2024, 3, 3);
```

## Environment Variables Required

```env
DATABASE_URL="postgresql://username:password@localhost:5432/library_management_system"
JWT_SECRET="your_jwt_secret_key"
PORT=8000
```

## Notes

1. All protected endpoints require a valid JWT token in the Authorization header
2. Admin permissions are required for user and role management
3. Book permissions (CREATE_BOOKS, READ_BOOKS, etc.) are required for book operations
4. The system supports pagination with `page` and `limit` query parameters
5. Search functionality is available on most list endpoints
6. Soft delete is implemented for most entities
