"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { Vote, LayoutDashboard, Users, PlusCircle, LogIn, LogOut, Shield, User as UserIcon } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const roles = session?.roles || [];
  const isAdmin = roles.includes("ROLE_ADMIN") || roles.includes("ADMIN");

  const handleLogout = async () => {
    const idToken = session?.idToken;
    await signOut({ redirect: false });

    const issuer = process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER || "http://localhost:8080/realms/my-ecosystem";
    const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "survey-frontend";
    const postLogoutRedirectUri = encodeURIComponent(window.location.origin);

    let logoutUrl = `${issuer}/protocol/openid-connect/logout?post_logout_redirect_uri=${postLogoutRedirectUri}&client_id=${clientId}`;
    if (idToken) {
      logoutUrl += `&id_token_hint=${idToken}`;
    }

    window.location.href = logoutUrl;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-2 rounded-lg bg-zinc-800 text-zinc-100 border border-zinc-700">
            <Vote className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-zinc-100">UtilitySurvey</span>
            <span className="block text-[10px] uppercase font-mono tracking-wider text-zinc-500 -mt-1">
              Citizen Platform
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/"
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              pathname === "/"
                ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
          >
            Home Feed
          </Link>

          {isAdmin && (
            <>
              <Link
                href="/admin/dashboard"
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  pathname.startsWith("/admin/dashboard")
                    ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
              </Link>
              <Link
                href="/admin/users"
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  pathname.startsWith("/admin/users")
                    ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Citizens
              </Link>
              <Link
                href="/admin/surveys/new"
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  pathname === "/admin/surveys/new"
                    ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5 text-zinc-300" />
                New Survey
              </Link>
            </>
          )}
        </nav>

        {/* User Auth Section */}
        <div className="flex items-center gap-3">
          {status === "loading" ? (
            <div className="h-8 w-20 bg-zinc-900 animate-pulse rounded-lg border border-zinc-800" />
          ) : session ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800">
                <div className="p-1 rounded-md bg-zinc-800 text-zinc-400">
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <span className="block text-xs font-medium text-zinc-200">
                    {session.user?.name || session.user?.email || "Authenticated User"}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-zinc-500">
                    {isAdmin ? (
                      <span className="text-zinc-300 flex items-center gap-0.5 font-semibold">
                        <Shield className="w-3 h-3 text-zinc-400" /> ADMIN
                      </span>
                    ) : (
                      <span>CITIZEN</span>
                    )}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-100 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn("keycloak")}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs btn-primary rounded-lg"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
