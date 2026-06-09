import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cslItemSchema } from "@/lib/bibliography/schema";

export async function GET() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Недостатньо прав" }, { status: 403 });
  }

  const bibliographyItemModel = (prisma as any).bibliographyItem;

  const items = await bibliographyItemModel.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json({ items });
}

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
    const item = cslItemSchema.parse(body.cslJson);

    const bibliographyItemModel = (prisma as any).bibliographyItem;

    const saved = await bibliographyItemModel.create({
      data: {
        id: item.id,
        rawInput: body.rawInput || item.URL || item.DOI || item.ISBN || item.title || "",
        source: "MANUAL",
        cslJson: item as Prisma.InputJsonValue,
        title: item.title || null,
        itemType: item.type,
        doi: item.DOI || null,
        isbn: item.ISBN || null,
        url: item.URL || null,
        createdById: session.user.id,
      },
    });

    return NextResponse.json({ item: saved });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Не вдалося створити джерело",
      },
      { status: 400 },
    );
  }
}