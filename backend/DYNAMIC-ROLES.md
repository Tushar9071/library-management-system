# Dynamic Email-Based Role Assignment System

## Overview

The Library Management System now features a sophisticated dynamic role assignment system that automatically assigns roles to users based on their email domain patterns. This system replaces the previous hardcoded logic with a flexible, configurable approach.

## Key Features

### 🔧 **Dynamic Configuration**

- Admins can create multiple email domain rules through the web interface
- Each rule has a domain pattern, description, and priority level
- Rules can be easily activated/deactivated without code changes

### 🎯 **Priority-Based Matching**

- Rules are processed in order of priority (highest first)
- First matching rule determines the assigned role
- Prevents conflicts when multiple patterns might match the same email

### 🌐 **Flexible Pattern Matching**

- **Simple Domain Matching**: `@darshan.ac.in` matches emails ending with that domain
- **Regex Patterns**: `@.*\.ac\.in$` matches any academic institution in India
- **Custom Logic**: Complex patterns for specific use cases

### 🛡️ **Fallback Safety**

- If no patterns match, users get the default "public user" role
- System ensures every user gets a valid role assignment
- Graceful error handling for missing roles

## How It Works

### 1. **Rule Creation**

Admins create email domain rules through the enhanced roles interface:

```javascript
{
  domainPattern: "@darshan.ac.in",
  description: "Darshan University students",
  priority: 10,
  roleId: 2 // Student role
}
```

### 2. **Email Processing**

When a user signs up or logs in via social auth:

```typescript
// 1. Get all active rules ordered by priority
const rules = await this.prisma.emailDomainRule.findMany({
  where: { isActive: true },
  orderBy: { priority: 'desc' },
});

// 2. Check each rule until a match is found
for (const rule of rules) {
  if (this.matchesEmailPattern(email, rule.domainPattern)) {
    return rule.roleId; // Assign this role
  }
}

// 3. Fallback to default "public user" role
return defaultPublicUserRoleId;
```

### 3. **Pattern Matching Logic**

```typescript
private matchesEmailPattern(email: string, pattern: string): boolean {
  // Simple domain matching
  if (pattern.startsWith('@')) {
    return email.toLowerCase().endsWith(pattern.toLowerCase());
  }

  // Regex pattern matching
  try {
    const regex = new RegExp(pattern, 'i');
    return regex.test(email);
  } catch (error) {
    console.error('Invalid regex pattern:', pattern);
    return false;
  }
}
```

## Configuration Examples

### Example 1: University Students

```javascript
{
  domainPattern: "@darshan.ac.in",
  description: "Darshan University students and staff",
  priority: 10,
  role: "Student"
}
```

### Example 2: Academic Institutions

```javascript
{
  domainPattern: "@.*\\.ac\\.in$",
  description: "Any academic institution in India",
  priority: 5,
  role: "Academic"
}
```

### Example 3: Corporate Domains

```javascript
{
  domainPattern: "@(company|corp)\\.com$",
  description: "Corporate email domains",
  priority: 7,
  role: "Corporate User"
}
```

### Example 4: Gmail Users

```javascript
{
  domainPattern: "@gmail\\.com$",
  description: "Gmail users",
  priority: 3,
  role: "Gmail User"
}
```

## Integration Points

### 1. **User Registration** (`users.service.ts`)

```typescript
// Use dynamic role assignment
let roleId = await this.enhancedRolesService.assignRoleByEmailDomain(email);

// Fallback to default role
if (!roleId) {
  const publicRole = await this.prisma.userRole.findFirst({
    where: { role: 'public user' },
  });
  roleId = publicRole.id;
}
```

### 2. **Social Authentication** (`auth.service.ts`)

Both Google and GitHub authentication use the same dynamic role assignment logic, ensuring consistent behavior across all login methods.

### 3. **Admin Interface** (`roles/page.tsx`)

The enhanced roles management interface allows admins to:

- Create new roles with email domain rules
- Edit existing domain patterns
- Set priorities for rule precedence
- View and test email assignments

## Benefits

### ✅ **Administrative Control**

- No code changes needed to modify role assignment logic
- Real-time updates through web interface
- Easy testing and validation of rules

### ✅ **Scalability**

- Support for unlimited email domain rules
- Efficient priority-based processing
- Regex support for complex patterns

### ✅ **Maintainability**

- Clean separation of business logic and configuration
- Centralized rule management
- Comprehensive logging and error handling

### ✅ **Flexibility**

- Support for any email pattern imaginable
- Easy integration with new authentication methods
- Backward compatibility with existing users

## Default Behavior

If no email domain rules are configured or none match the user's email:

1. System assigns the "public user" role
2. Logs the fallback assignment for monitoring
3. Ensures the user can still access the system

This guarantees that the system remains functional even without any configured rules, making it safe to deploy and easy to adopt gradually.

## Monitoring and Debugging

The system includes comprehensive logging:

```
Email domain rule matched for student@darshan.ac.in, assigned "Student" role (ID: 2)
No email domain rules matched for user@gmail.com, assigned default "public user" role (ID: 1)
```

This helps administrators understand and troubleshoot role assignments in real-time.
