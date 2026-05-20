import Link from "next/link";

export function Nav() {
  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/tournaments" className="flex items-center gap-2 font-bold text-gray-900">
              <span className="text-xl">⚽</span>
              <span className="hidden sm:block">Football Manager</span>
            </Link>
            <div className="hidden sm:flex items-center gap-6">
              <Link
                href="/tournaments"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Tournaments
              </Link>
              <Link
                href="/teams"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Teams
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
              Demo mode — read only
            </span>
            <Link
              href="/login"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              Sign in
            </Link>
          </div>

          {/* Mobile menu */}
          <div className="sm:hidden">
            <details className="relative">
              <summary className="cursor-pointer list-none p-2 rounded-lg hover:bg-gray-100">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </summary>
              <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg z-50">
                <Link href="/tournaments" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  Tournaments
                </Link>
                <Link href="/teams" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  Teams
                </Link>
              </div>
            </details>
          </div>
        </div>
      </div>
    </nav>
  );
}
