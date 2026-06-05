"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function ScrollToTop() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: "auto",
            });

            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;

            const scrollContainer = document.querySelector("[data-scroll-container]");

            if (scrollContainer) {
                scrollContainer.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: "auto",
                });
            }
        }, 0);

        return () => window.clearTimeout(timeout);
    }, [pathname, searchParams]);

    return null;
}