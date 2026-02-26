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
    <nav className="w-full border-b border-[#BB8C67]/30 dark:border-[#876047]/70 bg-[#FFF8F2]/90 dark:bg-[#2A1711]/85 backdrop-blur-md sticky top-0 z-50">
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
              <span className="hidden sm:inline text-[#876047] dark:text-[#D9BCA6] truncate max-w-[160px]">
                {user.email}
              </span>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-[#501F15] dark:text-[#F9EEE6] hover:bg-[#F5ECE4] dark:hover:bg-[#3A2219] transition-colors"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="px-4 py-1.5 rounded-lg text-sm font-medium bg-[#EE4D65] text-white hover:bg-[#D64058] transition-colors"
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
      className="px-3 py-1.5 rounded-lg text-sm font-medium text-[#876047] dark:text-[#D9BCA6] hover:bg-[#F5ECE4] hover:text-[#501F15] dark:hover:bg-[#3A2219] dark:hover:text-[#F9EEE6] transition-colors"
    >
      {children}
    </Link>
  );
}
