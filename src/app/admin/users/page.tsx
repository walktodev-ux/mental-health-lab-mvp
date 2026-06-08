import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { Card } from "@/components/ui/card";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function hasAttentionRisk(attempt: {
  hasRiskMarker: boolean;
  severity: string;
}) {
  return (
    attempt.hasRiskMarker ||
    attempt.severity === "HIGH" ||
    attempt.severity === "CRITICAL"
  );
}

export default async function AdminUsersPage() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    where: {
      role: "STUDENT",
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      attempts: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          severity: true,
          hasRiskMarker: true,
          createdAt: true,
          test: {
            select: {
              title: true,
            },
          },
        },
      },
      _count: {
        select: {
          attempts: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <p className="text-sm uppercase tracking-[0.24em] text-muted">
          Адмінка
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-text">Студенти</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Натисніть на студента, щоб відкрити його дашборд з тестуваннями,
          фільтрами по тестах і результатами.
        </p>
      </Card>

      <div className="overflow-hidden rounded-xl2 border border-black/5 bg-card shadow-sm">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-card text-xs uppercase tracking-[0.18em] text-muted">
            <tr>
              <th className="px-5 py-4">Студент</th>
              <th className="px-5 py-4">Email</th>
              <th className="px-5 py-4">Тестів пройдено</th>
              <th className="px-5 py-4">Останній тест</th>
              <th className="px-5 py-4">Ризик</th>
              <th className="px-5 py-4">Дата</th>
              <th className="px-5 py-4">Дія</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => {
              const latestAttempt = user.attempts[0];
              const hasRisk = user.attempts.some(hasAttentionRisk);

              return (
                <tr key={user.id} className="border-t border-black/5">
                  <td className="px-5 py-4 font-medium text-text">
                    {user.name || "Без імені"}
                  </td>

                  <td className="px-5 py-4 text-muted">{user.email}</td>

                  <td className="px-5 py-4 text-text">
                    {user._count.attempts}
                  </td>

                  <td className="px-5 py-4 text-muted">
                    {latestAttempt?.test.title || "Ще не проходив"}
                  </td>

                  <td className="px-5 py-4">
                    {hasRisk ? (
                      <span className="rounded-full bg-softRed px-3 py-1 text-xs text-text">
                        Так
                      </span>
                    ) : (
                      <span className="rounded-full bg-softGreen px-3 py-1 text-xs text-text">
                        Ні
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-4 text-muted">
                    {latestAttempt ? formatDate(latestAttempt.createdAt) : "—"}
                  </td>

                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="rounded-full bg-text px-4 py-2 text-xs text-white transition hover:opacity-80"
                    >
                      Відкрити
                    </Link>
                  </td>
                </tr>
              );
            })}

            {users.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-muted">
                  Студентів поки немає.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
