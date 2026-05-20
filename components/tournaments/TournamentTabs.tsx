"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Tab {
  href: string;
  label: string;
  exact?: boolean;
}

export function TournamentTabs({ tabs }: { tabs: Tab[] }) {
  const pathname = usePathname();

  return (
    <nav className="-mb-px flex gap-0 overflow-x-auto" aria-label="Tournament sections">
      {tabs.map((tab) => {
        const isActive = tab.exact
          ? pathname === tab.href
          : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              isActive
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
