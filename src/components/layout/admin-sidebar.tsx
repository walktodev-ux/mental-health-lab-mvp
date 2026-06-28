"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";

const adminLinks = [
    { href: "/admin", label: "Адмінка" },
    { href: "/admin/results", label: "Результати тестування" },
    { href: "/admin/users", label: "Студенти" },
    { href: "/admin/tests", label: "Тести" },
    { href: "/admin/bibliography", label: "Бібліографія" },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="rounded-xl2 border border-black/5 bg-card p-5 shadow-sm">
            <div className="mb-8 rounded-2xl px-4">
                <Link href="/admin" className="block">
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
                {adminLinks.map((link) => {
                    const isActive =
                        pathname === link.href ||
                        (link.href !== "/admin" && pathname.startsWith(link.href));

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`block rounded-full px-4 py-2 text-sm transition-colors duration-300 hover:bg-hover ${isActive ? "bg-hover text-text" : "text-text"
                                }`}
                        >
                            {link.label}
                        </Link>
                    );
                })}

                <div className="mt-4 border-t border-black/10 pt-4">
                    <Link
                        href="/dashboard"
                        className="block rounded-full px-4 py-2 text-sm text-muted transition-colors duration-300 hover:bg-hover hover:text-text"
                    >
                        Перейти в кабінет
                    </Link>
                </div>
            </nav>

            <div className="mt-8">
                <SignOutButton />
            </div>
        </aside>
    );
}