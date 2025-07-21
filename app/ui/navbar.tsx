import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="w-full max-w-4xl mx-auto mb-8 flex justify-between items-center py-4 px-6 bg-white/90 dark:bg-black/50 rounded-xl shadow-md">
      <div className="flex gap-6">
        <Link href="/dashboard" className="font-semibold text-blue-600 hover:underline">Home</Link>
        <Link href="/dashboard/favorites" className="font-semibold text-blue-600 hover:underline">Favorites</Link>
        <Link href="/dashboard/results" className="font-semibold text-blue-600 hover:underline">Results</Link>
      </div>
    </nav>
  );
} 