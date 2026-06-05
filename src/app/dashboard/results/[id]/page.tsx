import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { severityClass, severityLabels } from "@/lib/labels";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ResultPage({ params }: PageProps) {
  const user = await requireUser();
  const { id } = await params;

  const attempt = await prisma.testAttempt.findFirst({
    where: {
      id,
      userId: user.id,
    },
    include: {
      test: true,
      answers: {
        include: { question: true },
        orderBy: { question: { order: "asc" } },
      },
    },
  });

  if (!attempt) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Card>
        <p className="text-sm text-muted">{attempt.test.title}</p>
        <h2 className="mt-2 text-3xl font-semibold">{attempt.resultTitle}</h2>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Badge className={severityClass(attempt.severity)}>{severityLabels[attempt.severity]}</Badge>
          <span className="rounded-full bg-background px-3 py-1 text-sm font-medium">
            Результат: {attempt.totalScore}
          </span>
        </div>

        <p className="mt-5 text-sm leading-6 text-muted">{attempt.resultDescription}</p>

        {attempt.recommendation && (
          <p className="mt-4 rounded-xl bg-background p-4 text-sm leading-6">{attempt.recommendation}</p>
        )}

        {attempt.hasRiskMarker && attempt.riskMessage && (
          <div className="mt-4 rounded-xl bg-softRed p-4 text-sm leading-6">
            <strong>Важливий маркер:</strong>
            <p className="mt-2 whitespace-pre-line">{attempt.riskMessage}</p>
          </div>
        )}

        <p className="mt-5 text-xs leading-5 text-muted">
          Тест не є діагнозом і не замінює консультацію фахівця.
        </p>
      </Card>

      <Card>
        <h3 className="text-xl font-semibold">Ваші відповіді</h3>
        <div className="mt-4 space-y-3">
          {attempt.answers.map((answer) => (
            <div key={answer.id} className="rounded-xl border border-black/5 p-4">
              <p className="text-sm font-medium">{answer.question.order}. {answer.question.text}</p>
              <p className="mt-2 text-sm text-muted">Відповідь: {answer.label}</p>
            </div>
          ))}
        </div>
      </Card>

      <Link href="/dashboard/tests" className="inline-block rounded-full bg-text px-5 py-3 text-sm font-medium text-white">
        Повернутися до тестів
      </Link>
    </div>
  );
}
