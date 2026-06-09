import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { bibliographyInputSchema, cslItemSchema } from "@/lib/bibliography/schema";
import { enrichBibliographyInput } from "@/lib/bibliography/enrich";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Недостатньо прав" }, { status: 403 });
  }

  if (!session.user.id) {
    return NextResponse.json({ error: "Користувач не знайдений" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { input } = bibliographyInputSchema.parse(body);

    const result = await enrichBibliographyInput(input);
    const item = cslItemSchema.parse(result.item);

    const bibliographyItemModel = (prisma as any).bibliographyItem;

    const where = item.DOI
      ? {
          doi: item.DOI,
        }
      : {
          id: item.id,
        };

    const saved = await bibliographyItemModel.upsert({
      where,
      create: {
        id: item.id,
        rawInput: input,
        source: result.source,
        cslJson: item as Prisma.InputJsonValue,
        title: item.title || null,
        itemType: item.type,
        doi: item.DOI || null,
        isbn: item.ISBN || null,
        url: item.URL || null,
        createdById: session.user.id,
      },
      update: {
        rawInput: input,
        source: result.source,
        cslJson: item as Prisma.InputJsonValue,
        title: item.title || null,
        itemType: item.type,
        doi: item.DOI || null,
        isbn: item.ISBN || null,
        url: item.URL || null,
      },
    });

    return NextResponse.json({
      item: saved,
      confidence: result.confidence,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Помилка енрічменту",
      },
      { status: 400 },
    );
  }
}