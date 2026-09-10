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

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-pink-500 text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
            <Vote className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight gradient-text">UtilitySurvey</span>
            <span className="block text-[10px] uppercase font-semibold tracking-wider text-slate-400 -mt-1">
              Citizen Platform
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/"
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/"
                ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                : "text-slate-300 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            Home Feed
          </Link>

          {isAdmin && (
            <>
              <Link
                href="/admin/dashboard"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith("/admin/dashboard")
                    ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                href="/admin/users"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith("/admin/users")
                    ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Users className="w-4 h-4" />
                Citizens
              </Link>
              <Link
                href="/admin/surveys/new"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === "/admin/surveys/new"
                    ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                New Survey
              </Link>
            </>
          )}
        </nav>

        {/* User Auth Section */}
        <div className="flex items-center gap-3">
          {status === "loading" ? (
            <div className="h-9 w-24 bg-slate-800 animate-pulse rounded-lg" />
          ) : session ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
                <div className="p-1 rounded-full bg-slate-700 text-slate-300">
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <span className="block text-xs font-medium text-slate-200">
                    {session.user?.name || session.user?.email || "Authenticated User"}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-400">
                    {isAdmin ? (
                      <span className="text-amber-400 flex items-center gap-0.5 font-semibold">
                        <Shield className="w-3 h-3" /> ADMIN
                      </span>
                    ) : (
                      <span>CITIZEN</span>
                    )}
                  </span>
                </div>
              </div>

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-rose-400 bg-slate-800/60 hover:bg-rose-500/10 border border-slate-700/50 hover:border-rose-500/30 rounded-lg transition-all"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn("keycloak")}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white gradient-btn rounded-xl shadow-lg shadow-indigo-600/20"
            >
              <LogIn className="w-4 h-4" />
              Sign In with Keycloak
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
