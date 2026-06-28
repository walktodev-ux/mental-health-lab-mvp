import { Sidebar } from "@/components/layout/sidebar";
import { requireUser } from "@/lib/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="min-h-screen bg-background text-text">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-[280px_1fr] gap-6 p-6">
        <Sidebar role={user.role as "STUDENT" | "ADMIN"} />

        <main className="min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}