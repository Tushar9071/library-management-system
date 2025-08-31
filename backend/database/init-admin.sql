-- Initialize Admin User and Permissions Script
-- This script creates the first admin user with all permissions

-- First, initialize all permissions if they don't exist
INSERT INTO "Permission" (name, description, "createdAt", "updatedAt") VALUES
('USER_CREATE', 'Create new users', NOW(), NOW()),
('USER_READ', 'View user information', NOW(), NOW()),
('USER_UPDATE', 'Update user information', NOW(), NOW()),
('USER_DELETE', 'Delete users', NOW(), NOW()),
('ROLE_CREATE', 'Create new roles', NOW(), NOW()),
('ROLE_READ', 'View roles', NOW(), NOW()),
('ROLE_UPDATE', 'Update roles', NOW(), NOW()),
('ROLE_DELETE', 'Delete roles', NOW(), NOW()),
('BOOK_CREATE', 'Create new books', NOW(), NOW()),
('BOOK_READ', 'View books', NOW(), NOW()),
('BOOK_UPDATE', 'Update books', NOW(), NOW()),
('BOOK_DELETE', 'Delete books', NOW(), NOW()),
('PERMISSION_MANAGE', 'Manage permissions', NOW(), NOW()),
('ADMIN_ACCESS', 'Full admin access', NOW(), NOW()),
('SYSTEM_MANAGE', 'Manage system settings', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Create Admin role if it doesn't exist
INSERT INTO "Role" (name, description, "createdAt", "updatedAt") VALUES
('Admin', 'System Administrator with full access', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Create the first admin user (replace with your email)
-- Note: The password will be hashed by the application, this is just a placeholder
INSERT INTO "User" (email, password, name, "isActive", "createdAt", "updatedAt") VALUES
('tusharrajpara00@gmail.com', '$2b$10$placeholder', 'System Admin', true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Assign admin role to the admin user
INSERT INTO "UserRole" ("userId", "roleId", "isActive", "createdAt", "updatedAt")
SELECT u.id, r.id, true, NOW(), NOW()
FROM "User" u, "Role" r
WHERE u.email = 'tusharrajpara00@gmail.com' AND r.name = 'Admin'
ON CONFLICT ("userId", "roleId") DO NOTHING;

-- Assign all permissions to Admin role
INSERT INTO "RolePermission" ("roleId", "permissionId", "createdAt", "updatedAt")
SELECT r.id, p.id, NOW(), NOW()
FROM "Role" r, "Permission" p
WHERE r.name = 'Admin'
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

-- Create some basic roles for other users
INSERT INTO "Role" (name, description, "createdAt", "updatedAt") VALUES
('Librarian', 'Library staff with book management access', NOW(), NOW()),
('Member', 'Library member with read access', NOW(), NOW()),
('Student', 'Student with limited access', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to Librarian role
INSERT INTO "RolePermission" ("roleId", "permissionId", "createdAt", "updatedAt")
SELECT r.id, p.id, NOW(), NOW()
FROM "Role" r, "Permission" p
WHERE r.name = 'Librarian' AND p.name IN ('BOOK_CREATE', 'BOOK_READ', 'BOOK_UPDATE', 'USER_READ')
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

-- Assign permissions to Member role
INSERT INTO "RolePermission" ("roleId", "permissionId", "createdAt", "updatedAt")
SELECT r.id, p.id, NOW(), NOW()
FROM "Role" r, "Permission" p
WHERE r.name = 'Member' AND p.name IN ('BOOK_READ', 'USER_READ')
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

-- Assign permissions to Student role
INSERT INTO "RolePermission" ("roleId", "permissionId", "createdAt", "updatedAt")
SELECT r.id, p.id, NOW(), NOW()
FROM "Role" r, "Permission" p
WHERE r.name = 'Student' AND p.name IN ('BOOK_READ')
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

-- Display the results
SELECT 'Admin user created:' as status;
SELECT u.email, u.name, r.name as role 
FROM "User" u 
JOIN "UserRole" ur ON u.id = ur."userId"
JOIN "Role" r ON ur."roleId" = r.id
WHERE u.email = 'tusharrajpara00@gmail.com';

SELECT 'Total permissions assigned to Admin:' as status;
SELECT COUNT(*) as permission_count
FROM "RolePermission" rp
JOIN "Role" r ON rp."roleId" = r.id
WHERE r.name = 'Admin';
