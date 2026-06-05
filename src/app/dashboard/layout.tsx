import { Sidebar } from "@/components/layout/sidebar";
import { requireUser } from "@/lib/session";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <main className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-6 md:grid-cols-[280px_1fr]">
      <Sidebar role={user.role} />
      <section>{children}</section>
    </main>
  );
}
