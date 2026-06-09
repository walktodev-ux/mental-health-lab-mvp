import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    test?: string | string[];
  }>;
};

function getSearchValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getSeverityLabel(severity: string) {
  const labels: Record<string, string> = {
    LOW: "Низький",
    MEDIUM: "Середній",
    HIGH: "Високий",
    CRITICAL: "Критичний",
  };

  return labels[severity] || severity;
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    NEW: "Новий",
    REVIEWED: "Переглянуто",
    NEEDS_DISCUSSION: "Потребує обговорення",
    CLOSED: "Закрито",
  };

  return labels[status] || status;
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

export default async function AdminStudentPage({
  params,
  searchParams,
}: PageProps) {
  await requireAdmin();

  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const selectedTest = getSearchValue(resolvedSearchParams?.test) || "all";

  const student = await prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
    },
  });

  if (!student) {
    notFound();
  }

  const allAttempts = await prisma.testAttempt.findMany({
    where: {
      userId: id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      test: {
        select: {
          title: true,
          slug: true,
        },
      },
    },
  });

  const attempts = await prisma.testAttempt.findMany({
    where: {
      userId: id,
      ...(selectedTest !== "all"
        ? {
          test: {
            slug: selectedTest,
          },
        }
        : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      test: {
        select: {
          title: true,
          slug: true,
        },
      },
    },
  });

  const testsMap = new Map<
    string,
    {
      title: string;
      slug: string;
      count: number;
    }
  >();

  for (const attempt of allAttempts) {
    const current = testsMap.get(attempt.test.slug);

    testsMap.set(attempt.test.slug, {
      title: attempt.test.title,
      slug: attempt.test.slug,
      count: current ? current.count + 1 : 1,
    });
  }

  const tests = Array.from(testsMap.values());

  const totalAttempts = allAttempts.length;
  const riskAttempts = allAttempts.filter(hasAttentionRisk).length;
  const latestAttempt = allAttempts[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl2 border border-black/5 bg-card p-6 shadow-sm">
        <Link
          href="/admin/users"
          className="text-sm text-muted transition hover:text-text"
        >
          ← Назад до студентів
        </Link>

        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-muted">
            Дашборд студента
          </p>

          <h1 className="mt-2 text-3xl font-semibold text-text">
            {student.name || "Без імені"}
          </h1>

          <p className="mt-2 text-sm text-muted">{student.email}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl2 border border-black/5 bg-card p-5 shadow-sm">
          <p className="text-sm text-muted">Усього тестувань</p>
          <p className="mt-2 text-3xl font-semibold text-text">
            {totalAttempts}
          </p>
        </div>

        <div className="rounded-xl2 border border-black/5 bg-card p-5 shadow-sm">
          <p className="text-sm text-muted">Потребують уваги</p>
          <p className="mt-2 text-3xl font-semibold text-text">
            {riskAttempts}
          </p>
        </div>

        <div className="rounded-xl2 border border-black/5 bg-card p-5 shadow-sm">
          <p className="text-sm text-muted">Останній тест</p>
          <p className="mt-2 text-lg font-semibold text-text">
            {latestAttempt?.test.title || "Ще немає"}
          </p>
          {latestAttempt && (
            <p className="mt-1 text-xs text-muted">
              {formatDate(latestAttempt.createdAt)}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-xl2 border border-black/5 bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-text">Фільтр по тестах</p>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/admin/users/${student.id}`}
              className={`rounded-full px-4 py-2 text-sm transition ${selectedTest === "all"
                  ? "bg-text text-white"
                  : "bg-background text-text hover:bg-hover"
                }`}
            >
              Усі
              <span className="ml-2 text-xs opacity-70">{totalAttempts}</span>
            </Link>

            {tests.map((test) => (
              <Link
                key={test.slug}
                href={`/admin/users/${student.id}?test=${test.slug}`}
                className={`rounded-full px-4 py-2 text-sm transition ${selectedTest === test.slug
                    ? "bg-text text-white"
                    : "bg-background text-text hover:bg-hover"
                  }`}
              >
                {test.title}
                <span className="ml-2 text-xs opacity-70">{test.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl2 border border-black/5 bg-card shadow-sm">
        <div className="border-b border-black/5 p-5">
          <h2 className="text-xl font-semibold text-text">
            Тестування студента
          </h2>
          <p className="mt-1 text-sm text-muted">
            Результати відфільтровані по вибраному тесту.
          </p>
        </div>

        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-card text-xs uppercase tracking-[0.18em] text-muted">
            <tr>
              <th className="px-5 py-4">Тест</th>
              <th className="px-5 py-4">Бал</th>
              <th className="px-5 py-4">Рівень</th>
              <th className="px-5 py-4">Ризик</th>
              <th className="px-5 py-4">Статус</th>
              <th className="px-5 py-4">Дата</th>
              <th className="px-5 py-4">Дія</th>
            </tr>
          </thead>

          <tbody>
            {attempts.map((attempt) => {
              const hasRisk = hasAttentionRisk(attempt);

              return (
                <tr key={attempt.id} className="border-t border-black/5">
                  <td className="px-5 py-4 font-medium text-text">
                    {attempt.test.title}
                  </td>

                  <td className="px-5 py-4 text-text">
                    {Number.isInteger(attempt.totalScore)
                      ? attempt.totalScore
                      : attempt.totalScore.toFixed(2)}
                  </td>

                  <td className="px-5 py-4 text-muted">
                    {getSeverityLabel(attempt.severity)}
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
                    {getStatusLabel(attempt.status)}
                  </td>

                  <td className="px-5 py-4 text-muted">
                    {formatDate(attempt.createdAt)}
                  </td>

                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/results/${attempt.id}`}
                      className="rounded-full bg-text px-4 py-2 text-xs text-white transition hover:opacity-80"
                    >
                      Переглянути
                    </Link>
                  </td>
                </tr>
              );
            })}

            {attempts.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-muted">
                  Для цього фільтра результатів немає.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

