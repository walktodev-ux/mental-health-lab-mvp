import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";

const studentLinks = [
  { href: "/dashboard", label: "Головна" },
  { href: "/dashboard/tests", label: "Тести" },
  { href: "/dashboard/history", label: "Історія" },
];

const adminLinks = [
  { href: "/admin", label: "Адмінка" },
  { href: "/admin/results", label: "Результати" },
  { href: "/admin/users", label: "Студенти" },
];

export function Sidebar({ role }: { role: "STUDENT" | "ADMIN" }) {
  return (
    <aside className="rounded-xl2 bg-white p-5">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.28em] text-muted">Mental Health Lab</p>
        <h1 className="mt-2 text-2xl font-semibold text-text">Walkto</h1>
      </div>

      <nav className="flex flex-col gap-2">
        {studentLinks.map((link) => (
          <Link key={link.href} href={link.href} className="rounded-full px-4 py-2 text-sm text-text hover:bg-background">
            {link.label}
          </Link>
        ))}

        {role === "ADMIN" && (
          <div className="mt-4 border-t border-black/10 pt-4">
            {adminLinks.map((link) => (
              <Link key={link.href} href={link.href} className="block rounded-full px-4 py-2 text-sm text-text hover:bg-background">
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
