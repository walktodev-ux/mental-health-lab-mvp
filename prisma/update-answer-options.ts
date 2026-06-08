import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Option = {
  label: string;
  value: number;
};

const pcl5Options: Option[] = [
  { label: "Зовсім ні", value: 0 },
  { label: "Трохи", value: 1 },
  { label: "Помірно", value: 2 },
  { label: "Сильно", value: 3 },
  { label: "Дуже сильно", value: 4 },
];

const phq9Options: Option[] = [
  { label: "Ніколи", value: 0 },
  { label: "Кілька днів", value: 1 },
  { label: "Більше половини днів", value: 2 },
  { label: "Майже щодня", value: 3 },
];

const gad7Options: Option[] = [
  { label: "Ніколи", value: 0 },
  { label: "Кілька днів", value: 1 },
  { label: "Більше половини днів", value: 2 },
  { label: "Майже щодня", value: 3 },
];

const bat12Options: Option[] = [
  { label: "Ніколи", value: 1 },
  { label: "Рідко", value: 2 },
  { label: "Іноді", value: 3 },
  { label: "Часто", value: 4 },
  { label: "Завжди", value: 5 },
];

async function replaceAnswerOptions(slug: string, options: Option[]) {
  const test = await prisma.test.findUnique({
    where: { slug },
    select: { id: true, title: true },
  });

  if (!test) {
    console.log(`Тест не знайдено: ${slug}`);
    return;
  }

  await prisma.answerOption.deleteMany({
    where: {
      testId: test.id,
    },
  });

  await prisma.answerOption.createMany({
    data: options.map((option, index) => ({
      testId: test.id,
      label: option.label,
      value: option.value,
      order: index + 1,
    })),
  });

  console.log(`Оновлено варіанти відповідей для тесту: ${test.title}`);
}

async function main() {
  await replaceAnswerOptions("pcl-5", pcl5Options);
  await replaceAnswerOptions("phq-9", phq9Options);
  await replaceAnswerOptions("gad-7", gad7Options);
  await replaceAnswerOptions("bat-12", bat12Options);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

