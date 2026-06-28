"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  AnswerMode,
  ScoringMode,
  ScoringType,
  Severity,
} from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export type CreateTestState = {
  error?: string;
} | null;

const optionSchema = z.object({
  label: z.string().trim().min(1, "Заповніть текст варіанту відповіді"),
  value: z.coerce.number().int("Значення має бути цілим числом"),
});

const scaleSchema = z.object({
  code: z.string().trim().min(1, "Заповніть код шкали"),
  title: z.string().trim().min(1, "Заповніть назву шкали"),
  description: z.string().trim().optional(),
  multiplier: z.coerce.number(),
});

const questionSchema = z.object({
  text: z.string().trim().min(1, "Заповніть текст питання"),
  scaleCode: z.string().trim().optional(),
  options: z.array(optionSchema).optional().default([]),
});

const resultRangeSchema = z.object({
  scaleCode: z.string().trim().optional(),
  minScore: z.coerce.number(),
  maxScore: z.coerce.number(),
  title: z.string().trim().min(1, "Заповніть назву результату"),
  description: z.string().trim().min(1, "Заповніть опис результату"),
  recommendation: z.string().trim().optional(),
  severity: z.nativeEnum(Severity),
});

const createTestSchema = z.object({
  title: z.string().trim().min(2, "Назва тесту має бути мінімум 2 символи"),
  description: z.string().trim().optional(),
  scoringType: z.nativeEnum(ScoringType),
  scoringMode: z.nativeEnum(ScoringMode),
  answerMode: z.nativeEnum(AnswerMode),
  isActive: z.boolean(),

  sharedOptions: z.array(optionSchema).optional().default([]),
  scales: z.array(scaleSchema).optional().default([]),
  questions: z.array(questionSchema).min(1, "Додайте хоча б одне питання"),
  ranges: z
    .array(resultRangeSchema)
    .min(1, "Додайте хоча б один діапазон результату"),
});

function createSlug(title: string) {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-zа-яіїєґ0-9]+/giu, "-")
    .replace(/^-+|-+$/g, "");

  return `${base || "test"}-${Date.now().toString(36)}`;
}

function normalizeCode(value: string | undefined) {
  return value?.trim().toUpperCase() || "";
}

export async function createTestAction(
  _prevState: CreateTestState,
  formData: FormData
): Promise<CreateTestState> {
  await requireAdmin();

  const payloadValue = formData.get("payload");

  if (typeof payloadValue !== "string") {
    return {
      error: "Дані форми не знайдені.",
    };
  }

  let payload: unknown;

  try {
    payload = JSON.parse(payloadValue);
  } catch {
    return {
      error: "Некоректний формат даних форми.",
    };
  }

  const parsed = createTestSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Перевірте дані форми.",
    };
  }

  const data = parsed.data;

  for (const range of data.ranges) {
    if (range.minScore > range.maxScore) {
      return {
        error:
          "У діапазонах результатів мінімальний бал не може бути більшим за максимальний.",
      };
    }
  }

  if (data.answerMode === "SHARED" && data.sharedOptions.length === 0) {
    return {
      error: "Додайте хоча б один спільний варіант відповіді.",
    };
  }

  if (data.answerMode === "PER_QUESTION") {
    const questionWithoutOptions = data.questions.find(
      (question) => question.options.length === 0
    );

    if (questionWithoutOptions) {
      return {
        error:
          "Для режиму унікальних відповідей кожне питання має мати хоча б один варіант відповіді.",
      };
    }
  }

  const normalizedScales = data.scales.map((scale) => ({
    ...scale,
    code: normalizeCode(scale.code),
  }));

  if (data.scoringMode === "MULTISCALE") {
    if (normalizedScales.length === 0) {
      return {
        error: "Для тесту з кількома шкалами додайте хоча б одну шкалу.",
      };
    }

    const scaleCodes = normalizedScales.map((scale) => scale.code);
    const uniqueScaleCodes = new Set(scaleCodes);

    if (scaleCodes.length !== uniqueScaleCodes.size) {
      return {
        error: "Коди шкал не мають повторюватися.",
      };
    }

    const questionWithoutScale = data.questions.find(
      (question) => !uniqueScaleCodes.has(normalizeCode(question.scaleCode))
    );

    if (questionWithoutScale) {
      return {
        error: "Для кожного питання треба обрати шкалу.",
      };
    }

    const rangeWithoutScale = data.ranges.find(
      (range) => !uniqueScaleCodes.has(normalizeCode(range.scaleCode))
    );

    if (rangeWithoutScale) {
      return {
        error: "Для кожного діапазону результатів треба обрати шкалу.",
      };
    }
  }

  await prisma.$transaction(async (tx) => {
    const test = await tx.test.create({
      data: {
        title: data.title,
        slug: createSlug(data.title),
        description: data.description || "",
        scoringType: data.scoringType,
        scoringMode: data.scoringMode,
        answerMode: data.answerMode,
        isActive: data.isActive,
      },
      select: {
        id: true,
      },
    });

    const createdScales =
      data.scoringMode === "MULTISCALE"
        ? await Promise.all(
            normalizedScales.map((scale) =>
              tx.testScale.create({
                data: {
                  testId: test.id,
                  code: scale.code,
                  title: scale.title,
                  description: scale.description || null,
                  multiplier: scale.multiplier,
                },
                select: {
                  id: true,
                  code: true,
                },
              })
            )
          )
        : [];

    const scaleIdByCode = new Map(
      createdScales.map((scale) => [scale.code, scale.id])
    );

    const createdQuestions = await Promise.all(
      data.questions.map((question, questionIndex) => {
        const scaleCode = normalizeCode(question.scaleCode);

        const scaleId =
          data.scoringMode === "MULTISCALE"
            ? scaleIdByCode.get(scaleCode) ?? null
            : null;

        return tx.question.create({
          data: {
            testId: test.id,
            scaleId,
            text: question.text,
            order: questionIndex + 1,
          },
          select: {
            id: true,
            order: true,
          },
        });
      })
    );

    if (data.answerMode === "SHARED") {
      await tx.answerOption.createMany({
        data: data.sharedOptions.map((option, optionIndex) => ({
          testId: test.id,
          questionId: null,
          label: option.label,
          value: option.value,
          order: optionIndex + 1,
        })),
      });
    }

    if (data.answerMode === "PER_QUESTION") {
      await tx.answerOption.createMany({
        data: data.questions.flatMap((question, questionIndex) => {
          const createdQuestion = createdQuestions.find(
            (item) => item.order === questionIndex + 1
          );

          if (!createdQuestion) {
            return [];
          }

          return question.options.map((option, optionIndex) => ({
            testId: test.id,
            questionId: createdQuestion.id,
            label: option.label,
            value: option.value,
            order: optionIndex + 1,
          }));
        }),
      });
    }

    await tx.testRange.createMany({
      data: data.ranges.map((range) => {
        const scaleCode = normalizeCode(range.scaleCode);

        const scaleId =
          data.scoringMode === "MULTISCALE"
            ? scaleIdByCode.get(scaleCode) ?? null
            : null;

        return {
          testId: test.id,
          scaleId,
          minScore: range.minScore,
          maxScore: range.maxScore,
          title: range.title,
          description: range.description,
          recommendation: range.recommendation || null,
          severity: range.severity,
        };
      }),
    });
  });

  revalidatePath("/admin/tests");
  revalidatePath("/dashboard/tests");

  redirect("/admin/tests");
}