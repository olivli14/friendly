import Link from "next/link";
import { createClient } from "@/app/api/supabase/server";

export default async function NavBar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="w-full max-w-4xl mx-auto mb-8 flex justify-between items-center py-4 px-6 bg-white/90 dark:bg-black/50 rounded-xl shadow-md">
      <div className="flex gap-6">
        <Link href="/dashboard" className="font-semibold text-blue-600 hover:underline">Home</Link>
        <Link href="/dashboard/results" className="font-semibold text-blue-600 hover:underline">Results</Link>
        <Link href="/dashboard/favorites" className="font-semibold text-blue-600 hover:underline">Favorites</Link>
      </div>
      <div className="flex items-center gap-4 text-sm">
        {user ? (
          <>
            <span className="text-gray-700 dark:text-gray-200">{user.email}</span>
            <form action="/auth/signout" method="post">
              <button type="submit" className="font-semibold text-blue-600 hover:underline">
                Sign out
              </button>
            </form>
          </>
        ) : (
          <Link href="/login" className="font-semibold text-blue-600 hover:underline">
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
} 