import Link from "next/link";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function TestsPage() {
  await requireUser();

  const tests = await prisma.test.findMany({
    where: { isActive: true },
    include: { questions: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-3xl font-semibold">Тести</h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          Оберіть тест для проходження. Результати зберігаються в історії.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {tests.map((test) => (
          <Card key={test.id} className="flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-semibold">{test.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted whitespace-pre-line">{test.description}</p>
            </div>

            <div className="mt-6 flex items-center justify-between gap-4">
              <p className="text-sm text-muted">
                {test.questions.length} питань
                {test.timeMinutes ? ` · ${test.timeMinutes} хв` : ""}
              </p>
              <Link href={`/dashboard/tests/${test.slug}`} className="rounded-full bg-text px-5 py-3 text-sm font-medium text-white">
                Почати
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
