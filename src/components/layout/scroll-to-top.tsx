"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });

      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      const scrollContainer = document.querySelector<HTMLElement>(
        "[data-scroll-container]"
      );

      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: 0,
          left: 0,
          behavior: "auto",
        });
      }
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [pathname]);

  return null;
}

