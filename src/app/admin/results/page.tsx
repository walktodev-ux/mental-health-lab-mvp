import Link from "next/link";
import { AttemptStatus, Prisma } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { severityClass, severityLabels, statusLabels } from "@/lib/labels";
import { ResultsFilters } from "@/components/admin/results-filters";

const RESULTS_PER_PAGE = 10;

type PageProps = {
  searchParams: Promise<{
    status?: string;
    test?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: string;
  }>;
};

function isValidStatus(status?: string): status is AttemptStatus {
  return !!status && Object.values(AttemptStatus).includes(status as AttemptStatus);
}

function parsePage(page?: string) {
  const pageNumber = Number(page);

  if (!Number.isInteger(pageNumber) || pageNumber < 1) {
    return 1;
  }

  return pageNumber;
}

function getStartOfDay(date?: string) {
  if (!date) return undefined;

  const parsedDate = new Date(`${date}T00:00:00.000Z`);

  if (Number.isNaN(parsedDate.getTime())) {
    return undefined;
  }

  return parsedDate;
}

function getEndOfDay(date?: string) {
  if (!date) return undefined;

  const parsedDate = new Date(`${date}T23:59:59.999Z`);

  if (Number.isNaN(parsedDate.getTime())) {
    return undefined;
  }

  return parsedDate;
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

function formatScore(score: number) {
  return Number.isInteger(score) ? score : score.toFixed(2);
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

function createQueryString(
  currentParams: {
    status?: string;
    test?: string;
    dateFrom?: string;
    dateTo?: string;
  },
  nextParams: {
    page?: number;
    status?: string;
    test?: string;
    dateFrom?: string;
    dateTo?: string;
  }
) {
  const params = new URLSearchParams();

  const mergedParams = {
    ...currentParams,
    ...nextParams,
  };

  Object.entries(mergedParams).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== "all") {
      params.set(key, String(value));
    }
  });

  const queryString = params.toString();

  return queryString ? `/admin/results?${queryString}` : "/admin/results";
}

export default async function AdminResultsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const status = isValidStatus(params.status) ? params.status : undefined;
  const selectedTest = params.test || "all";
  const dateFrom = params.dateFrom || "";
  const dateTo = params.dateTo || "";
  const currentPage = parsePage(params.page);

  const startDate = getStartOfDay(dateFrom);
  const endDate = getEndOfDay(dateTo);

  const where: Prisma.TestAttemptWhereInput = {
    ...(status ? { status } : {}),
    ...(selectedTest !== "all"
      ? {
        test: {
          slug: selectedTest,
        },
      }
      : {}),
    ...(startDate || endDate
      ? {
        createdAt: {
          ...(startDate ? { gte: startDate } : {}),
          ...(endDate ? { lte: endDate } : {}),
        },
      }
      : {}),
  };

  const [tests, totalResults, attempts] = await Promise.all([
    prisma.test.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        title: "asc",
      },
      select: {
        title: true,
        slug: true,
      },
    }),

    prisma.testAttempt.count({
      where,
    }),

    prisma.testAttempt.findMany({
      where,
      include: {
        user: true,
        test: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (currentPage - 1) * RESULTS_PER_PAGE,
      take: RESULTS_PER_PAGE,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalResults / RESULTS_PER_PAGE));

  const baseQueryParams = {
    status,
    test: selectedTest,
    dateFrom,
    dateTo,
  };

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-3xl font-semibold">Результати тестування</h2>

        <p className="mt-3 text-sm text-muted">
          Тут відображаються автоматично оброблені результати студентів.
        </p>

        <ResultsFilters
          status={status || ""}
          selectedTest={selectedTest}
          dateFrom={dateFrom}
          dateTo={dateTo}
          statusOptions={Object.values(AttemptStatus).map((item) => ({
            value: item,
            label: statusLabels[item],
          }))}
          testOptions={tests.map((test) => ({
            value: test.slug,
            label: test.title,
          }))}
        />
      </Card>

      <Card className="overflow-x-auto">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted">
            Знайдено результатів:{" "}
            <span className="font-medium text-text">{totalResults}</span>
          </p>

          <p className="text-sm text-muted">
            Сторінка{" "}
            <span className="font-medium text-text">{currentPage}</span> з{" "}
            <span className="font-medium text-text">{totalPages}</span>
          </p>
        </div>

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
            {attempts.map((attempt) => {
              const risk = hasAttentionRisk(attempt);

              return (
                <tr key={attempt.id} className="border-b border-black/5">
                  <td className="py-4 pr-4">
                    <p className="font-medium">{attempt.user.name ?? "Без імені"}</p>
                    <p className="text-xs text-muted">{attempt.user.email}</p>
                  </td>

                  <td className="py-4 pr-4">{attempt.test.title}</td>

                  <td className="py-4 pr-4">{formatScore(attempt.totalScore)}</td>

                  <td className="py-4 pr-4">
                    <Badge className={severityClass(attempt.severity)}>
                      {severityLabels[attempt.severity]}
                    </Badge>
                  </td>

                  <td className="py-4 pr-4">
                    {risk ? (
                      <span className="rounded-full bg-softRed px-3 py-1 text-xs text-text">
                        Так
                      </span>
                    ) : (
                      <span className="rounded-full bg-softGreen px-3 py-1 text-xs text-text">
                        Ні
                      </span>
                    )}
                  </td>

                  <td className="py-4 pr-4">{statusLabels[attempt.status]}</td>

                  <td className="py-4 pr-4">{formatDate(attempt.createdAt)}</td>

                  <td className="py-4 pr-4">
                    <Link
                      className="font-medium underline"
                      href={`/admin/results/${attempt.id}`}
                    >
                      Переглянути
                    </Link>
                  </td>
                </tr>
              );
            })}

            {attempts.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-muted">
                  За цими фільтрами результатів немає.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <Link
              href={
                currentPage > 1
                  ? createQueryString(baseQueryParams, { page: currentPage - 1 })
                  : createQueryString(baseQueryParams, { page: 1 })
              }
              className={`rounded-full px-4 py-2 text-sm transition ${currentPage > 1
                ? "bg-background text-text hover:bg-hover"
                : "pointer-events-none bg-background text-muted opacity-50"
                }`}
            >
              Назад
            </Link>

            <div className="flex flex-wrap gap-2">
              {Array.from({ length: totalPages }).map((_, index) => {
                const pageNumber = index + 1;

                return (
                  <Link
                    key={pageNumber}
                    href={createQueryString(baseQueryParams, { page: pageNumber })}
                    className={`h-9 min-w-9 rounded-full px-3 text-center text-sm leading-9 transition ${pageNumber === currentPage
                      ? "bg-text text-white"
                      : "bg-background text-text hover:bg-hover"
                      }`}
                  >
                    {pageNumber}
                  </Link>
                );
              })}
            </div>

            <Link
              href={
                currentPage < totalPages
                  ? createQueryString(baseQueryParams, { page: currentPage + 1 })
                  : createQueryString(baseQueryParams, { page: totalPages })
              }
              className={`rounded-full px-4 py-2 text-sm transition ${currentPage < totalPages
                ? "bg-background text-text hover:bg-hover"
                : "pointer-events-none bg-background text-muted opacity-50"
                }`}
            >
              Далі
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}