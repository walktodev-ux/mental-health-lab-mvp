"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { calculateTotalScore, detectRiskMarkers, findResultRange, type AnswerMap } from "@/lib/test-scoring";

export async function submitTestAction(slug: string, formData: FormData) {
  const user = await requireUser();

  const test = await prisma.test.findUnique({
    where: { slug },
    include: {
      questions: { orderBy: { order: "asc" } },
      answerOptions: { orderBy: { order: "asc" } },
      ranges: true,
      riskRules: true,
    },
  });

  if (!test || !test.isActive) {
    throw new Error("Тест не знайдено.");
  }

  const answers: AnswerMap = {};

  for (const question of test.questions) {
    const rawValue = formData.get(`answer-${question.id}`);

    if (rawValue === null) {
      throw new Error("Потрібно відповісти на всі питання.");
    }

    const value = Number(rawValue);

    if (!Number.isFinite(value)) {
      throw new Error("Некоректне значення відповіді.");
    }

    answers[question.id] = value;
  }

  const values = Object.values(answers);
  const totalScore = calculateTotalScore(test.scoringType, values);
  const resultRange = findResultRange(totalScore, test.ranges);

  const riskMarkers = detectRiskMarkers(answers, test.riskRules);
  const hasRiskMarker = riskMarkers.length > 0;
  const riskMessage = riskMarkers.map((item) => item.message).join("\n");

  const optionLabelByValue = new Map(test.answerOptions.map((option) => [option.value, option.label]));

  const attempt = await prisma.testAttempt.create({
    data: {
      userId: user.id,
      testId: test.id,
      totalScore,
      resultTitle: resultRange.title,
      resultDescription: resultRange.description,
      recommendation: resultRange.recommendation,
      severity: hasRiskMarker ? "CRITICAL" : resultRange.severity,
      hasRiskMarker,
      riskMessage: hasRiskMarker ? riskMessage : null,
      answers: {
        create: test.questions.map((question) => ({
          questionId: question.id,
          value: answers[question.id],
          label: optionLabelByValue.get(answers[question.id]) ?? String(answers[question.id]),
        })),
      },
    },
  });

  redirect(`/dashboard/results/${attempt.id}`);
}
