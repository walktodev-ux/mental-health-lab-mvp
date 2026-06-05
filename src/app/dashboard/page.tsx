import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { severityClass, severityLabels } from "@/lib/labels";

export default async function DashboardPage() {
  const user = await requireUser();

  const [testsCount, attemptsCount, lastAttempts] = await Promise.all([
    prisma.test.count({ where: { isActive: true } }),
    prisma.testAttempt.count({ where: { userId: user.id } }),
    prisma.testAttempt.findMany({
      where: { userId: user.id },
      include: { test: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  return (
    <div className="space-y-6">
      <Card>
        <p className="text-sm text-muted">Вітаємо, {user.name ?? user.email}</p>
        <h2 className="mt-2 text-3xl font-semibold">Ваш навчальний кабінет</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Тут можна проходити тести, переглядати результати та відстежувати історію.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-muted">Доступні тести</p>
          <p className="mt-2 text-3xl font-semibold">{testsCount}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Пройдено тестів</p>
          <p className="mt-2 text-3xl font-semibold">{attemptsCount}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Наступний крок</p>
          <Link href="/dashboard/tests" className="mt-3 inline-block rounded-full bg-text px-5 py-3 text-sm font-medium text-white">
            Перейти до тестів
          </Link>
        </Card>
      </div>

      <Card>
        <h3 className="text-xl font-semibold">Останні результати</h3>
        <div className="mt-4 space-y-3">
          {lastAttempts.length === 0 && <p className="text-sm text-muted">Результатів ще немає.</p>}

          {lastAttempts.map((attempt) => (
            <Link
              key={attempt.id}
              href={`/dashboard/results/${attempt.id}`}
              className="flex flex-col gap-2 rounded-xl border border-black/5 p-4 hover:bg-background md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-medium">{attempt.test.title}</p>
                <p className="text-sm text-muted">{attempt.createdAt.toLocaleDateString("uk-UA")}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={severityClass(attempt.severity)}>{severityLabels[attempt.severity]}</Badge>
                <span className="text-sm font-medium">{attempt.totalScore} балів</span>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
