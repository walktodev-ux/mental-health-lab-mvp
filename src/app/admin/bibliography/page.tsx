import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { BibliographyManager } from "@/components/bibliography/BibliographyManager";

export default async function AdminBibliographyPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    if (session.user.role !== "ADMIN") {
        redirect("/");
    }

    return (
        <main className="mx-auto max-w-5xl space-y-6 p-6">
            <div className="rounded-xl2 border border-black/5 bg-card p-5 shadow-sm">
                <h1 className="text-2xl font-semibold">Бібліографія</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Додавайте DOI, ISBN, посилання або нестандартні джерела. Система
                    зберігає універсальний CSL-JSON і рендерить список літератури у APA 7.
                </p>
            </div>

            <BibliographyManager />
        </main>
    );
}