import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { EditTestForm } from "@/components/admin/edit-test-form";
import { Card } from "@/components/ui/card";

type PageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function EditTestPage({ params }: PageProps) {
    await requireAdmin();

    const { id } = await params;

    const test = await prisma.test.findUnique({
        where: {
            id,
        },
        include: {
            answerOptions: {
                where: {
                    questionId: null,
                },
                orderBy: {
                    order: "asc",
                },
            },
            questions: {
                orderBy: {
                    order: "asc",
                },
                include: {
                    answerOptions: {
                        orderBy: {
                            order: "asc",
                        },
                    },
                    scale: true,
                },
            },
            ranges: {
                orderBy: {
                    minScore: "asc",
                },
                include: {
                    scale: true,
                },
            },
            scales: {
                orderBy: {
                    createdAt: "asc",
                },
            },
            _count: {
                select: {
                    attempts: true,
                },
            },
        },
    });

    if (!test) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <Card>
                <Link
                    href="/admin/tests"
                    className="text-sm text-muted transition-colors hover:text-text"
                >
                    ← Назад до тестів
                </Link>

                <h1 className="mt-4 text-2xl font-semibold">Редагувати тест</h1>

                <p className="mt-1 text-sm text-muted">
                    Зміна питань і відповідей може впливати на майбутні проходження тесту.
                </p>

                {test._count.attempts > 0 && (
                    <p className="mt-3 rounded-xl bg-softYellow px-4 py-3 text-sm text-text">
                        Цей тест уже проходили студенти: {test._count.attempts}. Будь
                        обережна зі зміною питань і шкал.
                    </p>
                )}
            </Card>

            <EditTestForm test={test} />
        </div>
    );
}