const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Copy the EnhancedRolesService functionality to test
class TestEnhancedRolesService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async createRole(data) {
    const { name, description, permissions = [], emailDomainRules = [] } = data;

    try {
      // Filter out empty domain patterns
      const validEmailRules = emailDomainRules.filter(
        (rule) => rule.domainPattern && rule.domainPattern.trim() !== '',
      );

      // Get permission IDs from permission names
      const permissionRecords =
        permissions.length > 0
          ? await this.prisma.permission.findMany({
              where: {
                name: { in: permissions },
              },
            })
          : [];

      console.log(
        'Permission records found:',
        permissionRecords.map((p) => p.name),
      );

      const role = await this.prisma.userRole.create({
        data: {
          role: name,
          description,
          emailRules: {
            create: validEmailRules.map((rule) => ({
              domainPattern: rule.domainPattern.trim(),
              description: rule.description || '',
              priority: rule.priority || 0,
            })),
          },
          permissions: {
            create: permissionRecords.map((permission) => ({
              permissionId: permission.id,
            })),
          },
        },
        include: {
          emailRules: true,
          permissions: {
            include: {
              permission: true,
            },
          },
          _count: {
            select: { userinfo: true },
          },
        },
      });

      return this.formatRoleResponse(role);
    } catch (error) {
      throw error;
    }
  }

  formatRoleResponse(role) {
    return {
      id: role.id,
      name: role.role,
      description: role.description || '',
      userCount: role._count?.userinfo || 0,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      permissions:
        role.permissions?.map((rp) => ({
          id: rp.permission.id,
          name: rp.permission.name,
          description: rp.permission.description,
        })) || [],
      emailDomainRules:
        role.emailRules?.map((rule) => ({
          id: rule.id,
          domainPattern: rule.domainPattern,
          description: rule.description,
          priority: rule.priority,
          isActive: rule.isActive,
        })) || [],
    };
  }
}

async function testService() {
  try {
    const service = new TestEnhancedRolesService(prisma);

    const testData = {
      name: 'Test Service Role',
      description: 'Testing the service functionality',
      permissions: ['READ_BOOKS', 'CREATE_BOOKS'],
      emailDomainRules: [],
    };

    console.log('Creating role with data:', testData);

    const result = await service.createRole(testData);

    console.log('✅ Service test successful!');
    console.log('Created role:', result);

    // Clean up
    await prisma.rolePermission.deleteMany({
      where: { roleId: result.id },
    });
    await prisma.userRole.delete({
      where: { id: result.id },
    });

    console.log('✅ Cleanup completed');
  } catch (error) {
    console.error('❌ Service test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testService();
