"use client";

import { useMemo } from "react";
import { Cite } from "@citation-js/core";
import "@citation-js/plugin-csl";
import type { CslItem } from "@/lib/bibliography/types";

type CitationBlockProps = {
    items: CslItem[];
    template?: "apa" | string;
    lang?: string;
};

export function CitationBlock({
    items,
    template = "apa",
    lang = "uk-UA",
}: CitationBlockProps) {
    const html = useMemo(() => {
        try {
            const cite = new Cite(items);

            return cite.format("bibliography", {
                format: "html",
                template,
                lang,
            });
        } catch (error) {
            console.error(error);
            return "";
        }
    }, [items, template, lang]);

    if (!html) {
        return <p>Не вдалося згенерувати цитування.</p>;
    }

    return (
        <div
            className="space-y-2 text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}