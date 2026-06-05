"use server";

import { AttemptStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export async function updateAttemptAction(attemptId: string, formData: FormData) {
  const admin = await requireAdmin();

  const status = formData.get("status");
  const adminComment = formData.get("adminComment");

  if (!status || !Object.values(AttemptStatus).includes(status as AttemptStatus)) {
    throw new Error("Некоректний статус.");
  }

  await prisma.testAttempt.update({
    where: { id: attemptId },
    data: {
      status: status as AttemptStatus,
      adminComment: typeof adminComment === "string" ? adminComment : null,
      reviewedById: admin.id,
      reviewedAt: new Date(),
    },
  });

  revalidatePath(`/admin/results/${attemptId}`);
  revalidatePath("/admin/results");
}
