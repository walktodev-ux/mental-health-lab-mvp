import Link from "next/link";
import { CreateTestForm } from "@/components/admin/create-test-form";
import { requireAdmin } from "@/lib/session";
import { Card } from "@/components/ui/card";

export default async function NewAdminTestPage() {
    await requireAdmin();

    return (
        <div className="space-y-6">
            <Card>
                <Link
                    href="/admin/tests"
                    className="text-sm text-muted transition-colors hover:text-text"
                >
                    ← Назад до тестів
                </Link>

                <h1 className="mt-4 text-2xl font-semibold">Створити тест</h1>
                <p className="mt-1 text-sm text-muted">
                    Додайте питання, варіанти відповідей і діапазони результатів.
                </p>
            </Card>

            <CreateTestForm />
        </div>
    );
}