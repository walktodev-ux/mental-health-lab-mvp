import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { Card } from "@/components/ui/card";

export default async function AdminTestsPage() {
    await requireAdmin();

    const tests = await prisma.test.findMany({
        orderBy: {
            createdAt: "desc",
        },
        include: {
            _count: {
                select: {
                    questions: true,
                    attempts: true,
                },
            },
        },
    });

    return (
        <div className="space-y-6">
            <Card className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Тести</h1>
                    <p className="mt-1 text-sm text-muted">
                        Створення та перегляд тестів для студентів.
                    </p>
                </div>

                <Link
                    href="/admin/tests/new"
                    className="rounded-full bg-text px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                    Створити тест
                </Link>
            </Card>

            <div className="rounded-xl2 border border-black/5 bg-card shadow-sm">
                {tests.length === 0 ? (
                    <div className="p-6 text-sm text-muted">
                        Поки що немає створених тестів.
                    </div>
                ) : (
                    <div className="divide-y divide-black/5">
                        {tests.map((test) => (
                            <div
                                key={test.id}
                                className="grid gap-4 p-5 md:grid-cols-[1fr_auto]"
                            >
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="font-medium">{test.title}</h2>

                                        <span className="rounded-full bg-hover px-3 py-1 text-xs text-muted">
                                            {test.isActive ? "Активний" : "Неактивний"}
                                        </span>
                                    </div>

                                    {test.description && (
                                        <p className="mt-2 max-w-3xl text-sm text-muted whitespace-pre-line">
                                            {test.description}
                                        </p>
                                    )}

                                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted">
                                        <span>Питань: {test._count.questions}</span>
                                        <span>Проходжень: {test._count.attempts}</span>
                                        <span>
                                            Створено:{" "}
                                            {new Intl.DateTimeFormat("uk-UA").format(test.createdAt)}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/admin/tests/${test.id}/edit`}
                                            className="rounded-full border border-black/10 px-4 py-2 text-sm hover:bg-hover"
                                        >
                                            Редагувати
                                        </Link>

                                        <Link
                                            href={`/dashboard/tests/${test.slug}`}
                                            className="rounded-full border border-black/10 px-4 py-2 text-sm hover:bg-hover"
                                        >
                                            Переглянути
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}