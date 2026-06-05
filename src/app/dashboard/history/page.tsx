import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { severityClass, severityLabels } from "@/lib/labels";

export default async function HistoryPage() {
  const user = await requireUser();

  const attempts = await prisma.testAttempt.findMany({
    where: { userId: user.id },
    include: { test: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-3xl font-semibold">Історія тестів</h2>
        <p className="mt-3 text-sm text-muted">Усі ваші попередні результати.</p>
      </Card>

      <Card>
        <div className="space-y-3">
          {attempts.length === 0 && <p className="text-sm text-muted">Історія поки порожня.</p>}

          {attempts.map((attempt) => (
            <Link
              key={attempt.id}
              href={`/dashboard/results/${attempt.id}`}
              className="flex flex-col gap-2 rounded-xl border border-black/5 p-4 hover:bg-background md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-medium">{attempt.test.title}</p>
                <p className="text-sm text-muted">{attempt.createdAt.toLocaleString("uk-UA")}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={severityClass(attempt.severity)}>{severityLabels[attempt.severity]}</Badge>
                <span className="text-sm font-medium">{attempt.totalScore}</span>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
