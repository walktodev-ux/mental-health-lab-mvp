import OpenAI from "openai";
import type { CslItem } from "./types";
import { cslItemSchema } from "./schema";
import { createStableCslId, toCslDate } from "./utils";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const cslJsonOutputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    id: { type: "string" },
    type: {
      type: "string",
      enum: [
        "article",
        "article-journal",
        "book",
        "chapter",
        "paper-conference",
        "webpage",
        "video",
        "post-weblog",
        "report",
        "thesis",
        "dataset",
        "speech",
        "broadcast",
      ],
    },
    title: { type: "string" },

    author: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          given: { type: "string" },
          family: { type: "string" },
          literal: { type: "string" },
        },
      },
    },

    issued: {
      type: "object",
      additionalProperties: false,
      properties: {
        "date-parts": {
          type: "array",
          items: {
            type: "array",
            items: { type: "number" },
          },
        },
      },
    },

    accessed: {
      type: "object",
      additionalProperties: false,
      properties: {
        "date-parts": {
          type: "array",
          items: {
            type: "array",
            items: { type: "number" },
          },
        },
      },
    },

    URL: { type: "string" },
    DOI: { type: "string" },
    ISBN: { type: "string" },
    ISSN: { type: "string" },

    publisher: { type: "string" },
    "publisher-place": { type: "string" },
    "container-title": { type: "string" },
    volume: { type: "string" },
    issue: { type: "string" },
    page: { type: "string" },
    language: { type: "string" },
    abstract: { type: "string" },
  },
  required: ["id", "type", "title"],
};

export async function getOpenAiWebCsl(input: string): Promise<CslItem | null> {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  const today = new Date();
  const accessed = toCslDate(today.toISOString().slice(0, 10));

  const response = await openai.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-5.5",
    tools: [{ type: "web_search" }],
    tool_choice: "required",
    input: [
      {
        role: "system",
        content:
          "You extract bibliographic metadata and return only a valid CSL-JSON item. Do not invent data. If a field is not verified, omit it. Use CSL-JSON field names only.",
      },
      {
        role: "user",
        content: `Find reliable bibliographic metadata for this source and return a CSL-JSON item: ${input}`,
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "csl_json_item",
        strict: false,
        schema: cslJsonOutputSchema,
      },
    },
  });

  const rawText = response.output_text;

  if (!rawText) {
    return null;
  }

  const parsed = JSON.parse(rawText);
  const item = cslItemSchema.parse(parsed);

  return {
    ...item,
    id: item.id || createStableCslId("web", input),
    accessed: item.accessed || accessed,
    URL: item.URL || input,
  };
}