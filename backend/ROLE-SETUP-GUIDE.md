# Role Management Issue Fix & Setup Guide

## 🔧 **Issue Fixed**

The error you encountered was due to trying to create a role with a name that already exists in the database. The `userRole` table has a unique constraint on the `role` field.

**Error Details:**

```
Unique constraint failed on the fields: (`role`)
```

## ✅ **Solution Implemented**

Added comprehensive error handling to the `EnhancedRolesService`:

1. **Duplicate Name Checking**: Before creating/updating roles, we now check if the name already exists
2. **User-Friendly Error Messages**: Clear error messages explaining what went wrong
3. **Proper HTTP Status Codes**: `409 Conflict` for duplicate names, `404 Not Found` for missing roles

## 📋 **Recommended Role Setup**

Based on your requirements, here's the recommended role configuration:

### 1. **Admin Role** (Already exists?)

- **Name**: `Admin`
- **Description**: `System administrators with full access`
- **Email Domain Rules**: Leave empty or add specific admin domains
- **Permissions**: All permissions (CREATE, READ, UPDATE, DELETE for all resources)

### 2. **Student Role**

- **Name**: `Student`
- **Description**: `Darshan University students`
- **Email Domain Rules**:
  - **Pattern**: `@darshan\.ac\.in$`
  - **Priority**: `10`
  - **Description**: `Darshan University student emails`
- **Permissions**: Basic read access, book borrowing

### 3. **Teacher/Faculty Role**

- **Name**: `Teacher`
- **Description**: `Faculty and teaching staff`
- **Email Domain Rules**:
  - **Pattern**: `@faculty\.darshan\.ac\.in$`
  - **Priority**: `15`
  - **Description**: `Faculty email domain`
- **Permissions**: Enhanced access for managing students and books

### 4. **Public User Role** (Default)

- **Name**: `public user`
- **Description**: `Default role for general users`
- **Email Domain Rules**: **Leave completely empty** (this serves as the fallback)
- **Permissions**: Basic read-only access

## 🎯 **Domain Pattern Examples**

### Simple Domain Matching:

```
@darshan.ac.in         # Exact domain match
@faculty.darshan.ac.in # Specific subdomain
```

### Regex Patterns:

```
@.*\.ac\.in$           # Any academic institution in India
@(student|alumni)\.darshan\.ac\.in$  # Multiple subdomains
```

### Public Email Providers:

```
@(gmail|yahoo|hotmail)\.(com|co\.in)$  # Common email providers
```

## 🔍 **How to Check Existing Roles**

1. **Via Prisma Studio**: Open http://localhost:5556 and navigate to the `userRole` table
2. **Via API**: GET request to `/api/roles`
3. **Via Frontend**: Go to `/dashboard/roles` in your application

## 🛠️ **Step-by-Step Setup**

### Step 1: Check Existing Roles

First, see what roles already exist to avoid duplicates.

### Step 2: Create Missing Roles

If you need to create any of the recommended roles:

1. Go to your application at `http://localhost:3000/dashboard/roles`
2. Click "Create New Role"
3. Fill in the role details as per the recommendations above
4. **For public user role**: Leave the email domain rules section empty
5. **For specific roles**: Add the appropriate domain patterns

### Step 3: Test Email Assignment

Try registering new users with different email domains to verify the automatic role assignment:

- `student@darshan.ac.in` → Should get "Student" role
- `prof@faculty.darshan.ac.in` → Should get "Teacher" role
- `user@gmail.com` → Should get "public user" role

## 🚨 **Common Issues & Solutions**

### Issue: "Role already exists"

**Solution**: Check existing roles first, or use a different name

### Issue: "Can't edit/delete roles"

**Possible Causes**:

1. **Permission Issue**: Your user might not have `UPDATE_ROLES` or `DELETE_ROLES` permissions
2. **Frontend Issue**: The permission check might not be working correctly

### Issue: Email domain rules not working

**Solution**:

1. Ensure patterns are correct (test regex patterns online)
2. Check priority ordering (higher priority = checked first)
3. Verify the role has the domain rules properly saved

## 🔧 **Permission Debugging**

If you're still having issues with edit/delete permissions, let's check:

1. **Your current permissions**: Check what permissions your user actually has
2. **Frontend permission checks**: Ensure the UI is correctly checking permissions
3. **Backend permission guards**: Verify the API endpoints are properly protected

Would you like me to help debug the permission issue specifically?

## 📞 **Next Steps**

1. Check your existing roles via Prisma Studio
2. Create the missing roles as per the recommendations
3. Test the email domain rule functionality
4. If you still can't edit/delete, let me know and I'll help debug the permission system

The error handling is now much more robust, and you'll get clear feedback when trying to create duplicate roles!
