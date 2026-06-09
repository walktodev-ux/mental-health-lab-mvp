"use client";

import { useEffect, useState } from "react";
import type { CslItem } from "@/lib/bibliography/types";
import { CitationBlock } from "./CitationBlock";

type BibliographyRecord = {
    id: string;
    rawInput: string;
    source: string;
    title: string | null;
    itemType: string | null;
    doi: string | null;
    isbn: string | null;
    url: string | null;
    cslJson: CslItem;
};

export function BibliographyManager() {
    const [input, setInput] = useState("");
    const [items, setItems] = useState<BibliographyRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function loadItems() {
        const response = await fetch("/api/admin/bibliography");
        const data = await response.json();

        if (response.ok) {
            setItems(data.items);
        }
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/admin/bibliography/enrich", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ input }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Помилка");
            }

            setInput("");
            await loadItems();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Помилка");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadItems();
    }, []);

    return (
        <div className="space-y-8">
            <form onSubmit={handleSubmit} className="space-y-3 bg-card rounded-xl border p-4">
                <label className="block text-sm font-medium">
                    Додати джерело
                </label>

                <textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Вставте DOI, ISBN, посилання на книгу/статтю/YouTube або назву джерела"
                    className="min-h-28 w-full rounded-md border p-3 text-sm"
                />

                {error ? <p className="text-sm text-red-600">{error}</p> : null}

                <button
                    type="submit"
                    disabled={loading}
                    className="rounded-md bg-text px-4 py-2 text-sm text-white disabled:opacity-50"
                >
                    {loading ? "Обробка..." : "Зібрати метадані"}
                </button>
            </form>

            <div className="space-y-4">
                {items.map((item) => (
                    <article key={item.id} className="rounded-xl bg-card border p-4">
                        <div className="mb-3 flex flex-wrap gap-2 text-xs text-gray-500">
                            <span>{item.source}</span>
                            {item.itemType ? <span>{item.itemType}</span> : null}
                            {item.doi ? <span>DOI: {item.doi}</span> : null}
                            {item.isbn ? <span>ISBN: {item.isbn}</span> : null}
                        </div>

                        <CitationBlock items={[item.cslJson]} template="apa" />

                        <details className="mt-3">
                            <summary className="cursor-pointer text-xs text-gray-500">
                                CSL-JSON
                            </summary>

                            <pre className="mt-2 overflow-auto rounded-md bg-gray-100 p-3 text-xs">
                                {JSON.stringify(item.cslJson, null, 2)}
                            </pre>
                        </details>
                    </article>
                ))}
            </div>
        </div>
    );
}