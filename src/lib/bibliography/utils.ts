import type { CslDate, CslName } from "./types";

export function extractDoi(input: string): string | null {
  const match = input.match(/10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i);

  if (!match) {
    return null;
  }

  return match[0].replace(/[.,;)\]]+$/, "");
}

export function extractIsbn(input: string): string | null {
  const compact = input.replace(/[^0-9Xx]/g, "");

  if (/^\d{13}$/.test(compact)) {
    return compact;
  }

  if (/^\d{9}[\dXx]$/.test(compact)) {
    return compact.toUpperCase();
  }

  return null;
}

export function getGoogleBooksId(input: string): string | null {
  try {
    const url = new URL(input);

    if (!url.hostname.includes("books.google.")) {
      return null;
    }

    return url.searchParams.get("id");
  } catch {
    return null;
  }
}

export function toCslDate(value?: string | number | null): CslDate | undefined {
  if (!value) {
    return undefined;
  }

  const str = String(value).trim();

  const parts = str
    .split("-")
    .map((part) => Number(part))
    .filter((part) => Number.isFinite(part));

  if (!parts.length) {
    return undefined;
  }

  return {
    "date-parts": [parts],
  };
}

export function splitPersonName(name: string): CslName {
  const trimmed = name.trim();

  if (!trimmed) {
    return {};
  }

  const parts = trimmed.split(/\s+/);

  if (parts.length === 1) {
    return {
      literal: trimmed,
    };
  }

  return {
    given: parts.slice(0, -1).join(" "),
    family: parts.at(-1),
  };
}

export function cleanText(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const cleaned = value.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

  return cleaned || undefined;
}

export function createStableCslId(prefix: string, value: string): string {
  return `${prefix}:${value.toLowerCase().replace(/\s+/g, "-")}`;
}