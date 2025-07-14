// app/not-found.tsx
export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
      <p className="mt-2 text-gray-600">
        Sorry, the page you are looking for does not exist.
      </p>
      <a href="/" className="mt-4 text-blue-500 underline">
        Go back home
      </a>
    </div>
  );
}
