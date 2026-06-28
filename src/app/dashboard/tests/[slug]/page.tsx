import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { submitTestAction } from "./actions";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function TestPassPage({ params }: PageProps) {
  await requireUser();

  const { slug } = await params;

  const test = await prisma.test.findUnique({
    where: {
      slug,
    },
    include: {
      answerOptions: {
        orderBy: {
          order: "asc",
        },
      },
      questions: {
        orderBy: {
          order: "asc",
        },
      },
      ranges: {
        orderBy: {
          minScore: "asc",
        },
      },
      riskRules: true,
    },
  });

  if (!test || !test.isActive) {
    notFound();
  }

  const action = submitTestAction.bind(null, test.slug);

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-3xl font-semibold">{test.title}</h2>

        {test.instruction || test.description && (
          <p className="mt-3 text-sm leading-6 text-muted whitespace-pre-line">
            {test.instruction || test.description}
          </p>
        )}
      </Card>

      <form action={action} className="space-y-4">
        {test.questions.map((question) => (
          <Card key={question.id}>
            <p className="text-sm font-medium text-muted">
              Питання {question.order} з {test.questions.length}
            </p>

            <h3 className="mt-2 text-lg font-semibold">{question.text}</h3>

            <div className="mt-5 grid gap-3">
              {test.answerOptions.map((option) => (
                <label
                  key={option.id}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-black/10 bg-background px-4 py-3 text-sm transition hover:bg-white"
                >
                  <input
                    required
                    type="radio"
                    name={`answer-${question.id}`}
                    value={option.value}
                    className="h-4 w-4"
                  />

                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </Card>
        ))}

        <Card className="flex items-center justify-between">
          <p className="text-sm text-muted">
            Після завершення результат буде збережено в історії.
          </p>

          <Button type="submit">Завершити тест</Button>
        </Card>
      </form>
    </div>
  );
}