import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/app/api/supabase/server";
import quokkaLogo from "@/app/ui/resources/quokkalogo.svg";

export default async function NavBar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="w-full border-b border-gray-200/60 dark:border-white/10 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto flex justify-between items-center py-3 px-6">
        {/* Brand */}
        <Link
          href="/dashboard"
          className="inline-flex items-center"
          aria-label="Quokka"
        >
          <Image
            src={quokkaLogo}
            alt="Quokka"
            priority
            className="h-10 w-auto"
          />
        </Link>

        {/* Navigation links */}
        <div className="flex items-center gap-1">
          <NavLink href="/dashboard/results">Results</NavLink>
          <NavLink href="/dashboard/favorites">Favorites</NavLink>
          <NavLink href="/dashboard/survey">New Survey</NavLink>
        </div>

        {/* Auth */}
        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <span className="hidden sm:inline text-gray-500 dark:text-gray-400 truncate max-w-[160px]">
                {user.email}
              </span>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="px-4 py-1.5 rounded-lg text-sm font-medium bg-teal-600 text-white hover:bg-teal-700 transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-white/10 dark:hover:text-teal-400 transition-colors"
    >
      {children}
    </Link>
  );
}
