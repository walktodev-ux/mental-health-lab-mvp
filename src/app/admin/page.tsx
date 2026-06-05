import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const [usersCount, attemptsCount, newCount, riskCount] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.testAttempt.count(),
    prisma.testAttempt.count({ where: { status: "NEW" } }),
    prisma.testAttempt.count({ where: { hasRiskMarker: true } }),
  ]);

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-3xl font-semibold">Адмінка</h2>
        <p className="mt-3 text-sm text-muted">Автоматизована обробка та аналіз тестів.</p>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <p className="text-sm text-muted">Студенти</p>
          <p className="mt-2 text-3xl font-semibold">{usersCount}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Результати</p>
          <p className="mt-2 text-3xl font-semibold">{attemptsCount}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Нові</p>
          <p className="mt-2 text-3xl font-semibold">{newCount}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Ризикові маркери</p>
          <p className="mt-2 text-3xl font-semibold">{riskCount}</p>
        </Card>
      </div>
    </div>
  );
}
