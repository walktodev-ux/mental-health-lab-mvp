import type { Metadata } from "next";
import "./globals.css";
import { ScrollToTop } from "@/components/layout/scroll-to-top";

export const metadata: Metadata = {
  title: "Mental Health Lab",
  description: "Кабінет для навчання студентів-психологів",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <body>
        <ScrollToTop />
        {children}
      </body>
    </html>
  );
}
