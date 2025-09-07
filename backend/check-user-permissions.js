const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUserPermissions() {
  try {
    // Get all users with their roles and permissions
    const users = await prisma.users.findMany({
      include: {
        userInfoId: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    console.log('=== User Permissions Report ===\n');

    for (const user of users) {
      console.log(`User: ${user.email}`);
      console.log(`Role: ${user.userInfoId?.role?.role || 'No role assigned'}`);

      const permissions = user.userInfoId?.role?.permissions || [];
      console.log(`Permissions (${permissions.length}):`);

      if (permissions.length > 0) {
        permissions.forEach((rp) => {
          console.log(
            `  - ${rp.permission.name}: ${rp.permission.description}`,
          );
        });
      } else {
        console.log('  No permissions assigned');
      }

      console.log('\n' + '='.repeat(50) + '\n');
    }

    // Check if Admin role exists and has MANAGE_PERMISSIONS
    const adminRole = await prisma.userRole.findFirst({
      where: { role: 'Admin' },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    console.log('=== Admin Role Status ===');
    if (adminRole) {
      console.log(
        `Admin role exists with ${adminRole.permissions.length} permissions:`,
      );
      const hasManagePermissions = adminRole.permissions.some(
        (rp) => rp.permission.name === 'MANAGE_PERMISSIONS',
      );
      console.log(`Has MANAGE_PERMISSIONS: ${hasManagePermissions}`);

      if (!hasManagePermissions) {
        console.log('⚠️  Admin role is missing MANAGE_PERMISSIONS!');
      }
    } else {
      console.log('❌ Admin role does not exist!');
    }
  } catch (error) {
    console.error('Error checking user permissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserPermissions();
