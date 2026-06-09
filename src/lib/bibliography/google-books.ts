import type { CslItem } from "./types";
import {
  createStableCslId,
  extractIsbn,
  getGoogleBooksId,
  splitPersonName,
  toCslDate,
} from "./utils";

type GoogleVolume = {
  id: string;
  volumeInfo?: {
    title?: string;
    subtitle?: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    pageCount?: number;
    language?: string;
    canonicalVolumeLink?: string;
    infoLink?: string;
    industryIdentifiers?: {
      type: string;
      identifier: string;
    }[];
  };
};

function getBestIsbn(volume: GoogleVolume): string | undefined {
  const identifiers = volume.volumeInfo?.industryIdentifiers || [];

  return (
    identifiers.find((item) => item.type === "ISBN_13")?.identifier ||
    identifiers.find((item) => item.type === "ISBN_10")?.identifier
  );
}

function mapGoogleVolumeToCsl(volume: GoogleVolume): CslItem {
  const info = volume.volumeInfo || {};
  const isbn = getBestIsbn(volume);

  const title = [info.title, info.subtitle].filter(Boolean).join(": ");

  return {
    id: isbn ? createStableCslId("isbn", isbn) : createStableCslId("google-books", volume.id),
    type: "book",

    title,
    author: info.authors?.map(splitPersonName),

    issued: toCslDate(info.publishedDate),

    ISBN: isbn,
    URL: info.canonicalVolumeLink || info.infoLink,

    publisher: info.publisher,
    abstract: info.description,
    language: info.language,
    "number-of-pages": info.pageCount,
  };
}

async function googleBooksFetch(url: string) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
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

export async function getGoogleBook(input: string): Promise<CslItem | null> {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  const googleBooksId = getGoogleBooksId(input);

  if (googleBooksId) {
    const params = new URLSearchParams();

    if (apiKey) {
      params.set("key", apiKey);
    }

    const json = (await googleBooksFetch(
      `https://www.googleapis.com/books/v1/volumes/${encodeURIComponent(googleBooksId)}?${params.toString()}`,
    )) as GoogleVolume | null;

    return json ? mapGoogleVolumeToCsl(json) : null;
  }

  const isbn = extractIsbn(input);

  if (!isbn) {
    return null;
  }

  const params = new URLSearchParams({
    q: `isbn:${isbn}`,
    maxResults: "1",
    projection: "full",
  });

  if (apiKey) {
    params.set("key", apiKey);
  }

  const json = await googleBooksFetch(
    `https://www.googleapis.com/books/v1/volumes?${params.toString()}`,
  );

  const volume = json?.items?.[0] as GoogleVolume | undefined;

  return volume ? mapGoogleVolumeToCsl(volume) : null;
}