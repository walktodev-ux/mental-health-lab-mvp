import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: {
      _count: { select: { attempts: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-3xl font-semibold">Студенти</h2>
        <p className="mt-3 text-sm text-muted">Список користувачів із роллю STUDENT.</p>
      </Card>

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-black/10 text-muted">
              <th className="py-3 pr-4">Ім’я</th>
              <th className="py-3 pr-4">Email</th>
              <th className="py-3 pr-4">Тестів</th>
              <th className="py-3 pr-4">Дата реєстрації</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-black/5">
                <td className="py-4 pr-4">{user.name ?? "Без імені"}</td>
                <td className="py-4 pr-4">{user.email}</td>
                <td className="py-4 pr-4">{user._count.attempts}</td>
                <td className="py-4 pr-4">{user.createdAt.toLocaleDateString("uk-UA")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
