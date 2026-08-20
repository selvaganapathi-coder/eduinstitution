"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/institution", label: "Overview" },
  { href: "/institution/profile", label: "Profile" },
];

export function InstitutionNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Institution navigation" className="flex flex-wrap gap-1 border-b border-[#e1e5e3]">
      {links.map((link) => {
        const active = link.href === "/institution"
          ? pathname === "/institution"
          : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`border-b-2 px-3 py-3 text-sm font-medium transition ${
              active
                ? "border-[#1a73e8] text-[#1a73e8]"
                : "border-transparent text-[#5f6368] hover:border-[#dadce0] hover:text-[#202124]"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
