import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { EnhancedRolesService } from '../roles/enhanced-roles.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private enhancedRolesService: EnhancedRolesService,
  ) {}

  async createUser(email: string, password: string, info: any) {
    const existingUser = await this.prisma.users.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const hash = await bcrypt.hash(password, 10);

    // Use dynamic role assignment based on email domain rules
    let roleId = await this.enhancedRolesService.assignRoleByEmailDomain(email);

    // If no role matches email domain rules, assign default "public user" role
    if (!roleId) {
      const publicRole = await this.prisma.userRole.findFirst({
        where: { role: 'public user' },
      });

      if (!publicRole) {
        throw new BadRequestException(
          'Default "public user" role not found. Please ensure it exists in the database.',
        );
      }

      roleId = publicRole.id;
      console.log(
        `No email domain rules matched for ${email}, assigned default "public user" role (ID: ${roleId})`,
      );
    } else {
      const assignedRole = await this.prisma.userRole.findUnique({
        where: { id: roleId },
      });
      console.log(
        `Email domain rule matched for ${email}, assigned "${assignedRole?.role}" role (ID: ${roleId})`,
      );
    }

    const birthDateString = info.dob; // e.g. "2006-07-07"
    const dob = birthDateString ? new Date(birthDateString) : null;

    console.log(info);

    const user = await this.prisma.users.create({
      data: {
        email,
        password: hash,
        userInfoId: {
          create: {
            firstname: info.firstName,
            lastname: info.lastName,
            phone: info.phone,
            gender: info.gender,
            dob: birthDateString,
            roleId: roleId,
          },
        },
      },
      include: {
        userInfoId: true,
      },
    });

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.users.findUnique({
      where: { email },
      include: {
        userInfoId: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  // CRUD methods for admin panel
  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    role?: string,
  ) {
    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const whereClause: any = { visibility: true };

    if (search) {
      whereClause.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        {
          userInfoId: {
            OR: [
              { firstname: { contains: search, mode: 'insensitive' } },
              { lastname: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    if (role && role !== 'all') {
      whereClause.userInfoId = {
        ...whereClause.userInfoId,
        role: {
          role: { equals: role, mode: 'insensitive' },
        },
      };
    }

    // Get total count for pagination
    const totalCount = await this.prisma.users.count({
      where: whereClause,
    });

    // Get paginated results
    const users = await this.prisma.users.findMany({
      where: whereClause,
      include: {
        userInfoId: {
          include: {
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const formattedUsers = users.map((user) => ({
      id: user.id.toString(),
      email: user.email,
      name: user.userInfoId
        ? `${user.userInfoId.firstname} ${user.userInfoId.lastname}`
        : 'Unknown',
      phone: user.userInfoId?.phone || '',
      role: {
        id: user.userInfoId?.role?.id?.toString() || '',
        name: user.userInfoId?.role?.role || 'Unknown',
      },
      status: user.visibility ? 'active' : 'inactive',
      createdAt: user.createdAt.toISOString(),
      lastLogin: user.updatedAt.toISOString(),
    }));

    return {
      users: formattedUsers,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1,
      },
    };
  }

  async getUserRoles() {
    const roles = await this.prisma.userRole.findMany({
      select: {
        id: true,
        role: true,
      },
      orderBy: { role: 'asc' },
    });

    return roles.map((role) => ({
      id: role.id.toString(),
      name: role.role,
    }));
  }

  async findById(id: number) {
    const user = await this.prisma.users.findUnique({
      where: { id, visibility: true },
      include: {
        userInfoId: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id.toString(),
      email: user.email,
      name: user.userInfoId
        ? `${user.userInfoId.firstname} ${user.userInfoId.lastname}`
        : 'Unknown',
      phone: user.userInfoId?.phone || '',
      role: {
        id: user.userInfoId?.role?.id?.toString() || '',
        name: user.userInfoId?.role?.role || 'Unknown',
      },
      status: user.visibility ? 'active' : 'inactive',
      createdAt: user.createdAt.toISOString(),
      lastLogin: user.updatedAt.toISOString(),
    };
  }

  async create(createUserDto: any) {
    const { email, name, phone, password, roleId, status } = createUserDto;
    const [firstname, lastname] = name.split(' ');

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with userInfo
    const user = await this.prisma.users.create({
      data: {
        email,
        password: hashedPassword,
        visibility: status === 'active',
        userInfoId: {
          create: {
            firstname: firstname || name,
            lastname: lastname || '',
            phone: phone || `temp_${Date.now()}`, // Temporary phone if not provided
            gender: 'Other',
            roleId: parseInt(roleId),
          },
        },
      },
      include: {
        userInfoId: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user.userInfoId) {
      throw new Error('User info not found');
    }

    return {
      id: user.id.toString(),
      email: user.email,
      name: `${user.userInfoId.firstname} ${user.userInfoId.lastname}`,
      phone: user.userInfoId.phone || '',
      role: {
        id: user.userInfoId.role.id.toString(),
        name: user.userInfoId.role.role,
      },
      status: user.visibility ? 'active' : 'inactive',
      createdAt: user.createdAt.toISOString(),
      lastLogin: user.updatedAt.toISOString(),
    };
  }

  async update(id: number, updateUserDto: any) {
    const { email, name, phone, password, roleId, status } = updateUserDto;
    const [firstname, lastname] = name.split(' ');

    // Prepare update data
    const updateData: any = {
      email,
      visibility: status === 'active',
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update user and userInfo
    const user = await this.prisma.users.update({
      where: { id },
      data: {
        ...updateData,
        userInfoId: {
          update: {
            firstname: firstname || name,
            lastname: lastname || '',
            phone: phone || `temp_${Date.now()}`,
            roleId: parseInt(roleId),
          },
        },
      },
      include: {
        userInfoId: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user.userInfoId) {
      throw new Error('User info not found');
    }

    return {
      id: user.id.toString(),
      email: user.email,
      name: `${user.userInfoId.firstname} ${user.userInfoId.lastname}`,
      phone: user.userInfoId.phone || '',
      role: {
        id: user.userInfoId.role.id.toString(),
        name: user.userInfoId.role.role,
      },
      status: user.visibility ? 'active' : 'inactive',
      createdAt: user.createdAt.toISOString(),
      lastLogin: user.updatedAt.toISOString(),
    };
  }

  async delete(id: number) {
    // Soft delete by setting visibility to false
    await this.prisma.users.update({
      where: { id },
      data: { visibility: false },
    });

    return { message: 'User deleted successfully' };
  }

  // Keep existing method for backward compatibility
  findOne(id: number) {
    return this.findById(id);
  }
}
