import Link from "next/link";
import { AttemptStatus } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { severityClass, severityLabels, statusLabels } from "@/lib/labels";

type PageProps = {
  searchParams: Promise<{
    status?: AttemptStatus;
  }>;
};

export default async function AdminResultsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = params.status;

  const attempts = await prisma.testAttempt.findMany({
    where: status ? { status } : undefined,
    include: {
      user: true,
      test: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-3xl font-semibold">Результати тестів</h2>
        <p className="mt-3 text-sm text-muted">Тут відображаються автоматично оброблені результати студентів.</p>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link className="rounded-full bg-background px-4 py-2 text-sm" href="/admin/results">Усі</Link>
          {Object.values(AttemptStatus).map((item) => (
            <Link key={item} className="rounded-full bg-background px-4 py-2 text-sm" href={`/admin/results?status=${item}`}>
              {statusLabels[item]}
            </Link>
          ))}
        </div>
      </Card>

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-black/10 text-muted">
              <th className="py-3 pr-4">Студент</th>
              <th className="py-3 pr-4">Тест</th>
              <th className="py-3 pr-4">Бал</th>
              <th className="py-3 pr-4">Рівень</th>
              <th className="py-3 pr-4">Ризик</th>
              <th className="py-3 pr-4">Статус</th>
              <th className="py-3 pr-4">Дата</th>
              <th className="py-3 pr-4">Дія</th>
            </tr>
          </thead>
          <tbody>
            {attempts.map((attempt) => (
              <tr key={attempt.id} className="border-b border-black/5">
                <td className="py-4 pr-4">
                  <p className="font-medium">{attempt.user.name ?? "Без імені"}</p>
                  <p className="text-xs text-muted">{attempt.user.email}</p>
                </td>
                <td className="py-4 pr-4">{attempt.test.title}</td>
                <td className="py-4 pr-4">{attempt.totalScore}</td>
                <td className="py-4 pr-4">
                  <Badge className={severityClass(attempt.severity)}>{severityLabels[attempt.severity]}</Badge>
                </td>
                <td className="py-4 pr-4">{attempt.hasRiskMarker ? "Так" : "Ні"}</td>
                <td className="py-4 pr-4">{statusLabels[attempt.status]}</td>
                <td className="py-4 pr-4">{attempt.createdAt.toLocaleDateString("uk-UA")}</td>
                <td className="py-4 pr-4">
                  <Link className="font-medium underline" href={`/admin/results/${attempt.id}`}>
                    Переглянути
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
