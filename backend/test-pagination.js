/**
 * Test script to demonstrate pagination functionality
 * Run this with: node test-pagination.js
 */

const baseUrl = 'http://localhost:8000'; // Adjust this to your server URL

async function testPagination() {
  console.log('🚀 Testing Pagination API\n');

  // Test Books Pagination
  console.log('📚 Testing Books Pagination:');

  try {
    // Test basic pagination
    console.log('1. Basic pagination (page 1, limit 5):');
    let response = await fetch(`${baseUrl}/books?page=1&limit=5`);
    let data = await response.json();
    console.log(`   Found ${data.pagination.totalCount} total books`);
    console.log(
      `   Showing ${data.data.length} books on page ${data.pagination.page}`,
    );
    console.log(`   Has next page: ${data.pagination.hasNext}\n`);

    // Test search functionality
    console.log('2. Search functionality (searching for "harry"):');
    response = await fetch(`${baseUrl}/books?page=1&limit=5&search=harry`);
    data = await response.json();
    console.log(
      `   Found ${data.pagination.totalCount} books matching "harry"`,
    );
    console.log(`   First result: ${data.data[0]?.title || 'No results'}\n`);

    // Test category filtering
    console.log('3. Category filtering:');
    response = await fetch(`${baseUrl}/books/categories`);
    const categories = await response.json();
    console.log(`   Available categories: ${categories.data.join(', ')}\n`);

    // Test Users Pagination
    console.log('👥 Testing Users Pagination:');

    response = await fetch(`${baseUrl}/users?page=1&limit=5`);
    data = await response.json();
    console.log(`   Found ${data.pagination.totalCount} total users`);
    console.log(
      `   Showing ${data.data.length} users on page ${data.pagination.page}`,
    );
    console.log(`   Has next page: ${data.pagination.hasNext}\n`);

    // Test user roles
    response = await fetch(`${baseUrl}/users/roles`);
    const roles = await response.json();
    console.log(
      `   Available roles: ${roles.data.map((r) => r.name).join(', ')}\n`,
    );

    console.log('✅ All pagination tests completed successfully!');
  } catch (error) {
    console.error('❌ Error testing pagination:', error.message);
    console.log(
      '\n💡 Make sure your server is running on http://localhost:3000',
    );
    console.log('   Start the server with: npm run start:dev');
  }
}

// Example usage with different parameters
function printExampleUsage() {
  console.log('\n📖 Example API Usage:');
  console.log('');
  console.log('Books:');
  console.log(
    '  GET /books?page=1&limit=10                     // Basic pagination',
  );
  console.log(
    '  GET /books?page=2&limit=20&search=python       // Search with pagination',
  );
  console.log(
    '  GET /books?category=Science&page=1&limit=15    // Filter by category',
  );
  console.log(
    '  GET /books/categories                          // Get all categories',
  );
  console.log('');
  console.log('Users:');
  console.log(
    '  GET /users?page=1&limit=10                     // Basic pagination',
  );
  console.log(
    '  GET /users?page=2&limit=20&search=john         // Search users',
  );
  console.log(
    '  GET /users?role=Student&page=1&limit=15        // Filter by role',
  );
  console.log(
    '  GET /users/roles                               // Get all roles',
  );
  console.log('');
}

// Run the tests
testPagination();
printExampleUsage();
