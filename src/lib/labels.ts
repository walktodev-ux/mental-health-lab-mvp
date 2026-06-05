import type { AttemptStatus, Severity } from "@prisma/client";

export const severityLabels: Record<Severity, string> = {
  LOW: "Низький",
  MEDIUM: "Середній",
  HIGH: "Високий",
  CRITICAL: "Критичний",
};

export const statusLabels: Record<AttemptStatus, string> = {
  NEW: "Новий",
  REVIEWED: "Переглянуто",
  NEEDS_DISCUSSION: "Потребує обговорення",
  CLOSED: "Закрито",
};

export function severityClass(severity: Severity) {
  switch (severity) {
    case "LOW":
      return "bg-softGreen text-text";
    case "MEDIUM":
      return "bg-softYellow text-text";
    case "HIGH":
    case "CRITICAL":
      return "bg-softRed text-text";
    default:
      return "bg-gray-100 text-text";
  }
}
