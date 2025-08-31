export interface Permission {
  id: number;
  name: string;
  description?: string;
  category: string;
  action: string;
}

export interface UserPermissions {
  permissions: Permission[];
  hasPermission: (permissionName: string) => boolean;
  canCreate: (resource: string) => boolean;
  canRead: (resource: string) => boolean;
  canUpdate: (resource: string) => boolean;
  canDelete: (resource: string) => boolean;
}

export const PERMISSIONS = {
  // Books
  READ_BOOKS: 'READ_BOOKS',
  CREATE_BOOKS: 'CREATE_BOOKS',
  UPDATE_BOOKS: 'UPDATE_BOOKS',
  DELETE_BOOKS: 'DELETE_BOOKS',
  BORROW_BOOKS: 'BORROW_BOOKS',
  RETURN_BOOKS: 'RETURN_BOOKS',
  
  // Users
  READ_USERS: 'READ_USERS',
  CREATE_USERS: 'CREATE_USERS',
  UPDATE_USERS: 'UPDATE_USERS',
  DELETE_USERS: 'DELETE_USERS',
  
  // Roles
  READ_ROLES: 'READ_ROLES',
  CREATE_ROLES: 'CREATE_ROLES',
  UPDATE_ROLES: 'UPDATE_ROLES',
  DELETE_ROLES: 'DELETE_ROLES',
  MANAGE_PERMISSIONS: 'MANAGE_PERMISSIONS',
} as const;
