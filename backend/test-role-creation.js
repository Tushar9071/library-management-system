const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCreateRole() {
  try {
    // First, get some permissions
    const permissions = await prisma.permission.findMany({
      where: {
        name: { in: ['READ_BOOKS', 'CREATE_BOOKS'] },
      },
    });

    console.log(
      'Found permissions:',
      permissions.map((p) => p.name),
    );

    // Test creating a role with permissions directly
    const role = await prisma.userRole.create({
      data: {
        role: 'Test Role Direct',
        description: 'Testing direct role creation',
        permissions: {
          create: permissions.map((permission) => ({
            permissionId: permission.id,
          })),
        },
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    console.log('Created role:', {
      id: role.id,
      name: role.role,
      description: role.description,
      permissions: role.permissions.map((rp) => rp.permission.name),
    });

    // Clean up
    await prisma.rolePermission.deleteMany({
      where: { roleId: role.id },
    });
    await prisma.userRole.delete({
      where: { id: role.id },
    });

    console.log('✅ Test completed successfully');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCreateRole();
