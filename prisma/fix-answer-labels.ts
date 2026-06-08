import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const tests = [
  {
    slug: "pcl-5",
    options: [
      { label: "Зовсім ні", value: 0, order: 1 },
      { label: "Трохи", value: 1, order: 2 },
      { label: "Помірно", value: 2, order: 3 },
      { label: "Сильно", value: 3, order: 4 },
      { label: "Дуже сильно", value: 4, order: 5 },
    ],
  },
  {
    slug: "phq-9",
    options: [
      { label: "Ніколи", value: 0, order: 1 },
      { label: "Кілька днів", value: 1, order: 2 },
      { label: "Більше половини днів", value: 2, order: 3 },
      { label: "Майже щодня", value: 3, order: 4 },
    ],
  },
  {
    slug: "gad-7",
    options: [
      { label: "Ніколи", value: 0, order: 1 },
      { label: "Кілька днів", value: 1, order: 2 },
      { label: "Більше половини днів", value: 2, order: 3 },
      { label: "Майже щодня", value: 3, order: 4 },
    ],
  },
  {
    slug: "bat-12",
    options: [
      { label: "Ніколи", value: 1, order: 1 },
      { label: "Рідко", value: 2, order: 2 },
      { label: "Іноді", value: 3, order: 3 },
      { label: "Часто", value: 4, order: 4 },
      { label: "Завжди", value: 5, order: 5 },
    ],
  },
];

async function main() {
  for (const item of tests) {
    const test = await prisma.test.findUnique({
      where: { slug: item.slug },
      select: { id: true, title: true },
    });

    if (!test) {
      console.log(`Тест не знайдено: ${item.slug}`);
      continue;
    }

    await prisma.answerOption.deleteMany({
      where: { testId: test.id },
    });

    await prisma.answerOption.createMany({
      data: item.options.map((option) => ({
        testId: test.id,
        label: option.label,
        value: option.value,
        order: option.order,
      })),
    });

    console.log(`Оновлено: ${test.title}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

