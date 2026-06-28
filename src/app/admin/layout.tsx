import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { requireAdmin } from "@/lib/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-background text-text">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-[280px_1fr] gap-6 p-6">
        <AdminSidebar />

        <main className="min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
