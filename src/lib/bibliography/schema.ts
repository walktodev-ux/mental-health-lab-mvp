import { z } from "zod";

export const cslNameSchema = z.object({
  given: z.string().optional(),
  family: z.string().optional(),
  literal: z.string().optional(),
});

export const cslDateSchema = z.object({
  "date-parts": z.array(z.array(z.number())),
});

export const cslItemSchema = z
  .object({
    id: z.string().min(1),
    type: z.string().min(1),
    title: z.string().optional(),

    author: z.array(cslNameSchema).optional(),
    editor: z.array(cslNameSchema).optional(),

    issued: cslDateSchema.optional(),
    accessed: cslDateSchema.optional(),

    URL: z.string().optional(),
    DOI: z.string().optional(),
    ISBN: z.string().optional(),
    ISSN: z.string().optional(),

    publisher: z.string().optional(),
    "publisher-place": z.string().optional(),
    "container-title": z.string().optional(),
    volume: z.string().optional(),
    issue: z.string().optional(),
    page: z.string().optional(),
    edition: z.string().optional(),
    language: z.string().optional(),
    abstract: z.string().optional(),
    "number-of-pages": z.union([z.string(), z.number()]).optional(),
  })
  .passthrough();

export const bibliographyInputSchema = z.object({
  input: z.string().trim().min(1, "Вставте DOI, ISBN, посилання або назву джерела"),
});
