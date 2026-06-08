"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";

const adminLinks = [
  { href: "/admin", label: "Адмінка" },
  { href: "/admin/results", label: "Результати тестування" },
  { href: "/admin/users", label: "Студенти" },
];

export function Sidebar({ role }: { role: "STUDENT" | "ADMIN" }) {
  const pathname = usePathname();

  const isTestingPage =
    pathname.startsWith("/dashboard/tests") ||
    pathname.startsWith("/dashboard/history");

  const [isTestingOpen, setIsTestingOpen] = useState(isTestingPage);

  useEffect(() => {
    if (isTestingPage) {
      setIsTestingOpen(true);
    }
  }, [isTestingPage]);

  return (
    <aside className="rounded-xl2 border border-black/5 bg-card p-5 shadow-sm">
      <div className="mb-8 rounded-2xl px-4">
        <Link href="/dashboard" className="block">
          <Image
            src="/images/walkto-mhl-logo-black.svg"
            alt="Walkto Mental Health Lab"
            width={180}
            height={60}
            priority
            className="h-auto w-full max-w-[180px]"
          />
        </Link>
      </div>

      <nav className="flex flex-col gap-2">
        <Link
          href="/dashboard"
          className={`rounded-full px-4 py-2 text-sm transition-colors duration-300 hover:bg-hover ${pathname === "/dashboard" ? "bg-hover text-text" : "text-text"
            }`}
        >
          Головна
        </Link>

        <div>
          <button
            type="button"
            onClick={() => setIsTestingOpen((prev) => !prev)}
            className={`flex w-full items-center justify-between rounded-full px-4 py-2 text-left text-sm text-text transition-colors duration-300 hover:bg-hover ${isTestingPage ? "bg-hover" : ""
              }`}
            aria-expanded={isTestingOpen}
          >
            <span>Тестування</span>

            <span
              className={`text-xs transition-transform duration-300 ease-out ${isTestingOpen ? "rotate-180" : "rotate-0"
                }`}
            >
              ▼
            </span>
          </button>

          <div
            className={`grid transition-all duration-300 ease-out ${isTestingOpen
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
              }`}
          >
            <div className="overflow-hidden">
              <div className="mt-2 flex flex-col gap-1 pl-4">
                <Link
                  href="/dashboard/tests"
                  className={`rounded-full px-4 py-2 text-sm transition-colors duration-300 hover:bg-hover ${pathname.startsWith("/dashboard/tests")
                    ? "bg-hover text-text"
                    : "text-muted"
                    }`}
                >
                  Тести
                </Link>

                <Link
                  href="/dashboard/history"
                  className={`rounded-full px-4 py-2 text-sm transition-colors duration-300 hover:bg-hover ${pathname.startsWith("/dashboard/history")
                    ? "bg-hover text-text"
                    : "text-muted"
                    }`}
                >
                  Історія
                </Link>
              </div>
            </div>
          </div>
        </div>

        {role === "ADMIN" && (
          <div className="mt-4 border-t border-black/10 pt-4">
            {adminLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block rounded-full px-4 py-2 text-sm transition-colors duration-300 hover:bg-hover ${pathname === link.href ? "bg-hover text-text" : "text-text"
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      <div className="mt-8">
        <SignOutButton />
      </div>
    </aside>
  );
}