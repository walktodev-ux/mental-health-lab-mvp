import { notFound } from "next/navigation";
import { AttemptStatus } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { severityClass, severityLabels, statusLabels } from "@/lib/labels";
import { updateAttemptAction } from "./actions";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminResultDetailPage({ params }: PageProps) {
  const { id } = await params;

  const attempt = await prisma.testAttempt.findUnique({
    where: { id },
    include: {
      user: true,
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

  const action = updateAttemptAction.bind(null, attempt.id);

  return (
    <div className="space-y-6">
      <Card>
        <p className="text-sm text-muted">{attempt.user.name ?? attempt.user.email}</p>
        <h2 className="mt-2 text-3xl font-semibold">{attempt.test.title}</h2>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Badge className={severityClass(attempt.severity)}>{severityLabels[attempt.severity]}</Badge>
          <span className="rounded-full bg-background px-3 py-1 text-sm font-medium">Бал: {attempt.totalScore}</span>
          <span className="rounded-full bg-background px-3 py-1 text-sm font-medium">{statusLabels[attempt.status]}</span>
        </div>

        <p className="mt-5 text-sm leading-6 text-muted">{attempt.resultDescription}</p>

        {attempt.hasRiskMarker && attempt.riskMessage && (
          <div className="mt-4 rounded-xl bg-softRed p-4 text-sm leading-6">
            <strong>Ризиковий маркер</strong>
            <p className="mt-2 whitespace-pre-line">{attempt.riskMessage}</p>
          </div>
        )}
      </Card>

      <Card>
        <h3 className="text-xl font-semibold">Відповіді</h3>
        <div className="mt-4 space-y-3">
          {attempt.answers.map((answer) => (
            <div key={answer.id} className="rounded-xl border border-black/5 p-4">
              <p className="text-sm font-medium">{answer.question.order}. {answer.question.text}</p>
              <p className="mt-2 text-sm text-muted">Відповідь: {answer.label} · значення {answer.value}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="text-xl font-semibold">Обробка результату</h3>
        <form action={action} className="mt-4 space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Статус</span>
            <select
              name="status"
              defaultValue={attempt.status}
              className="mt-2 w-full rounded-xl border border-black/10 bg-background px-4 py-3 text-sm"
            >
              {Object.values(AttemptStatus).map((status) => (
                <option key={status} value={status}>{statusLabels[status]}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium">Коментар адміністратора</span>
            <textarea
              name="adminComment"
              defaultValue={attempt.adminComment ?? ""}
              rows={5}
              className="mt-2 w-full rounded-xl border border-black/10 bg-background px-4 py-3 text-sm"
              placeholder="Додайте коментар або нотатку щодо результату"
            />
          </label>

          <Button type="submit">Зберегти</Button>
        </form>
      </Card>
    </div>
  );
}
