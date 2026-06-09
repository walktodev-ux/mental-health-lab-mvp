import type { EnrichedBibliographyResult } from "./types";
import { cslItemSchema } from "./schema";
import { getCrossrefByDoi, searchCrossrefBibliographic } from "./crossref";
import { getGoogleBook } from "./google-books";

export async function enrichBibliographyInput(
  input: string,
): Promise<EnrichedBibliographyResult> {
  const normalizedInput = input.trim();

  const crossrefByDoi = await getCrossrefByDoi(normalizedInput);

  if (crossrefByDoi) {
    return {
      item: cslItemSchema.parse(crossrefByDoi),
      source: "CROSSREF",
      confidence: 0.98,
    };
  }

  const googleBook = await getGoogleBook(normalizedInput);

  if (googleBook) {
    return {
      item: cslItemSchema.parse(googleBook),
      source: "GOOGLE_BOOKS",
      confidence: 0.9,
    };
  }

  const crossrefSearch = await searchCrossrefBibliographic(normalizedInput);

  if (crossrefSearch) {
    return {
      item: cslItemSchema.parse(crossrefSearch),
      source: "CROSSREF",
      confidence: 0.75,
    };
  }

  throw new Error(
    "Не вдалося автоматично зібрати метадані через Crossref або Google Books. OpenAI fallback тимчасово вимкнений.",
  );
}