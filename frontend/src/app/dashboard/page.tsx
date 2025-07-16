// This is a placeholder for user role. In a real application, this would come from your authentication system.
let currentUserRole = "student"; // Can be "librarian", "student", or "public"
export default async function DashboardPage() {
  let welcomeMessage = "";
  let description = "";

  switch (currentUserRole) {
    case "librarian":
      welcomeMessage = "Welcome, Librarian!";
      description = "Manage books, users, and library operations.";
      break;
    case "student":
      welcomeMessage = "Welcome, Student!";
      description = "View your borrowed books and explore the catalog.";
      break;
    case "public":
      welcomeMessage = "Welcome to the Library!";
      description = "Browse our extensive collection of books.";
      break;
    default:
      welcomeMessage = "Welcome!";
      description = "Explore the library portal.";
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-8 border border-gray-200 dark:border-slate-700">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        {welcomeMessage}
      </h2>
      <p className="text-gray-700 dark:text-gray-300 text-lg">{description}</p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentUserRole === "librarian" && (
          <>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-300 mb-2">
                Books Overview
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Total Books: 1,250
              </p>
              <p className="text-gray-600 dark:text-gray-400">Available: 980</p>
              <p className="text-gray-600 dark:text-gray-400">Borrowed: 270</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-green-700 dark:text-green-300 mb-2">
                User Statistics
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Total Users: 500
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Active Students: 350
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                New Registrations (Today): 5
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-yellow-700 dark:text-yellow-300 mb-2">
                Recent Activity
              </h3>
              <ul className="text-gray-600 dark:text-gray-400 text-sm space-y-1">
                <li>John Doe borrowed "The Great Gatsby"</li>
                <li>Jane Smith returned "1984"</li>
                <li>New book added: "Dune"</li>
              </ul>
            </div>
          </>
        )}

        {currentUserRole === "student" && (
          <>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-300 mb-2">
                My Borrowed Books
              </h3>
              <ul className="text-gray-600 dark:text-gray-400 text-sm space-y-1">
                <li>"The Lord of the Rings" (Due: 2025-07-20)</li>
                <li>"Pride and Prejudice" (Due: 2025-08-05)</li>
              </ul>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-purple-700 dark:text-purple-300 mb-2">
                Recommendations
              </h3>
              <ul className="text-gray-600 dark:text-gray-400 text-sm space-y-1">
                <li>"To Kill a Mockingbird"</li>
                <li>"The Catcher in the Rye"</li>
              </ul>
            </div>
          </>
        )}

        {currentUserRole === "public" && (
          <>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-300 mb-2">
                Featured Books
              </h3>
              <ul className="text-gray-600 dark:text-gray-400 text-sm space-y-1">
                <li>"The Alchemist" by Paulo Coelho</li>
                <li>
                  "Sapiens: A Brief History of Humankind" by Yuval Noah Harari
                </li>
              </ul>
            </div>
            <div className="bg-teal-50 dark:bg-teal-900/20 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-teal-700 dark:text-teal-300 mb-2">
                New Arrivals
              </h3>
              <ul className="text-gray-600 dark:text-gray-400 text-sm space-y-1">
                <li>"The Midnight Library"</li>
                <li>"Project Hail Mary"</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
