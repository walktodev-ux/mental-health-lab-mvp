import type { RiskOperator, ScoringType, Severity } from "@prisma/client";

export type AnswerMap = Record<string, number>;

export type ScoringQuestion = {
  id: string;
  order: number;
};

export type ScoringRange = {
  minScore: number;
  maxScore: number;
  title: string;
  description: string;
  recommendation: string | null;
  severity: Severity;
};

export type ScoringRiskRule = {
  questionId: string;
  operator: RiskOperator;
  value: number | null;
  message: string;
  severity: Severity;
};

export function calculateTotalScore(scoringType: ScoringType, values: number[]) {
  const sum = values.reduce((acc, value) => acc + value, 0);

  if (scoringType === "AVERAGE") {
    return Number((sum / values.length).toFixed(2));
  }

  return sum;
}

export function findResultRange(score: number, ranges: ScoringRange[]) {
  const range = ranges.find(
    (item) => score >= item.minScore && score <= item.maxScore
  );

  if (!range) {
    throw new Error("Не знайдено діапазон результату для цього тесту.");
  }

  return range;
}

function compare(value: number, operator: RiskOperator, expected: number) {
  switch (operator) {
    case "EQUAL":
      return value === expected;
    case "NOT_EQUAL":
      return value !== expected;
    case "GREATER_THAN":
      return value > expected;
    case "GREATER_OR_EQUAL":
      return value >= expected;
    case "LESS_THAN":
      return value < expected;
    case "LESS_OR_EQUAL":
      return value <= expected;
    default:
      return false;
  }
}

export function detectRiskMarkers(
  answers: AnswerMap,
  riskRules: ScoringRiskRule[]
) {
  return riskRules
    .filter((rule) => {
      if (rule.value === null) {
        return false;
      }

      const answerValue = answers[rule.questionId];

      return (
        typeof answerValue === "number" &&
        compare(answerValue, rule.operator, rule.value)
      );
    })
    .map((rule) => ({
      message: rule.message,
      severity: rule.severity,
      questionId: rule.questionId,
    }));
}
