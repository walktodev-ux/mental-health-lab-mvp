export type CslName = {
  given?: string;
  family?: string;
  literal?: string;
};

export type CslDate = {
  "date-parts": number[][];
};

export type CslItem = {
  id: string;
  type: string;

  title?: string;
  author?: CslName[];
  editor?: CslName[];
  issued?: CslDate;
  accessed?: CslDate;

  URL?: string;
  DOI?: string;
  ISBN?: string;
  ISSN?: string;

  publisher?: string;
  "publisher-place"?: string;
  "container-title"?: string;
  volume?: string;
  issue?: string;
  page?: string;
  edition?: string;
  language?: string;
  abstract?: string;
  "number-of-pages"?: string | number;

  [key: string]: unknown;
};

export type EnrichedBibliographyResult = {
  item: CslItem;
  source: "CROSSREF" | "GOOGLE_BOOKS" | "OPENAI_WEB" | "MANUAL";
  confidence: number;
};