import { randomUUID } from "crypto";
import type { CslDate, CslItem, CslName } from "./types";
import { cleanText, createStableCslId, extractDoi } from "./utils";

type CrossrefDate = {
  "date-parts"?: number[][];
};

type CrossrefAuthor = {
  given?: string;
  family?: string;
  name?: string;
};

type CrossrefWork = {
  DOI?: string;
  URL?: string;
  type?: string;
  title?: string[];
  subtitle?: string[];
  author?: CrossrefAuthor[];
  editor?: CrossrefAuthor[];
  issued?: CrossrefDate;
  published?: CrossrefDate;
  "published-print"?: CrossrefDate;
  "published-online"?: CrossrefDate;
  publisher?: string;
  "container-title"?: string[];
  volume?: string;
  issue?: string;
  page?: string;
  ISBN?: string[];
  ISSN?: string[];
  abstract?: string;
};

function mapCrossrefType(type?: string): string {
  switch (type) {
    case "journal-article":
      return "article-journal";
    case "book":
    case "monograph":
      return "book";
    case "book-chapter":
      return "chapter";
    case "proceedings-article":
      return "paper-conference";
    case "posted-content":
      return "article";
    case "report":
      return "report";
    case "dataset":
      return "dataset";
    default:
      return "article";
  }
}

function mapPeople(people?: CrossrefAuthor[]): CslName[] | undefined {
  if (!people?.length) {
    return undefined;
  }

  const mapped: CslName[] = [];

  for (const person of people) {
    if (person.family || person.given) {
      const item: CslName = {};

      if (person.given) {
        item.given = person.given;
      }

      if (person.family) {
        item.family = person.family;
      }

      mapped.push(item);
      continue;
    }

    if (person.name) {
      mapped.push({
        literal: person.name,
      });
    }
  }

  return mapped.length ? mapped : undefined;
}

function normalizeCrossrefDate(date?: CrossrefDate): CslDate | undefined {
  const parts = date?.["date-parts"];

  if (!parts || !Array.isArray(parts) || !parts.length) {
    return undefined;
  }

  const firstRawDate = parts[0];

  if (!firstRawDate || !Array.isArray(firstRawDate)) {
    return undefined;
  }

  const firstDate = firstRawDate.filter((part) => Number.isFinite(part));

  if (!firstDate.length) {
    return undefined;
  }

  return {
    "date-parts": [firstDate],
  };
}

function mapCrossrefWorkToCsl(work: CrossrefWork): CslItem {
  const doi = work.DOI?.trim();

  const item: CslItem = {
    id: doi ? createStableCslId("doi", doi) : randomUUID(),
    type: mapCrossrefType(work.type),
  };

  const title = cleanText(work.title?.[0]);
  const author = mapPeople(work.author);
  const editor = mapPeople(work.editor);
  const issued =
    normalizeCrossrefDate(work.issued) ||
    normalizeCrossrefDate(work["published-print"]) ||
    normalizeCrossrefDate(work["published-online"]) ||
    normalizeCrossrefDate(work.published);

  const publisher = cleanText(work.publisher);
  const containerTitle = cleanText(work["container-title"]?.[0]);
  const abstract = cleanText(work.abstract);

  if (title) item.title = title;
  if (author) item.author = author;
  if (editor) item.editor = editor;
  if (issued) item.issued = issued;

  if (doi) item.DOI = doi;
  if (work.URL) item.URL = work.URL;

  if (publisher) item.publisher = publisher;
  if (containerTitle) item["container-title"] = containerTitle;

  if (work.volume) item.volume = work.volume;
  if (work.issue) item.issue = work.issue;
  if (work.page) item.page = work.page;

  if (work.ISBN?.[0]) item.ISBN = work.ISBN[0];
  if (work.ISSN?.[0]) item.ISSN = work.ISSN[0];

  if (abstract) item.abstract = abstract;

  return item;
}

async function crossrefFetch(url: string) {
  const mailto = process.env.CROSSREF_MAILTO;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": `MentalHealthLab/1.0 (${mailto ? `mailto:${mailto}` : "no-contact"})`,
    },
    next: {
      revalidate: 60 * 60 * 24,
    },
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export async function getCrossrefByDoi(input: string): Promise<CslItem | null> {
  const doi = extractDoi(input);

  if (!doi) {
    return null;
  }

  const params = new URLSearchParams();

  if (process.env.CROSSREF_MAILTO) {
    params.set("mailto", process.env.CROSSREF_MAILTO);
  }

  const url = `https://api.crossref.org/works/${encodeURIComponent(doi)}?${params.toString()}`;
  const json = await crossrefFetch(url);

  const work = json?.message as CrossrefWork | undefined;

  if (!work) {
    return null;
  }

  return mapCrossrefWorkToCsl(work);
}

export async function searchCrossrefBibliographic(input: string): Promise<CslItem | null> {
  const params = new URLSearchParams({
    "query.bibliographic": input,
    rows: "1",
  });

  if (process.env.CROSSREF_MAILTO) {
    params.set("mailto", process.env.CROSSREF_MAILTO);
  }

  const url = `https://api.crossref.org/works?${params.toString()}`;
  const json = await crossrefFetch(url);

  const work = json?.message?.items?.[0] as CrossrefWork | undefined;

  if (!work) {
    return null;
  }

  return mapCrossrefWorkToCsl(work);
}