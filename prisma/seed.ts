import { PrismaClient, Prisma, ScoringType, Severity, RiskOperator } from "@prisma/client";

const prisma = new PrismaClient();

type TestSeed = {
  title: string;
  slug: string;
  description: string;
  instruction: string;
  scoringType: ScoringType;
  timeMinutes: number;
  options: { label: string; value: number; order: number }[];
  questions: string[];
  ranges: {
    minScore: number;
    maxScore: number;
    title: string;
    description: string;
    recommendation?: string;
    severity: Severity;
  }[];
  riskRules?: {
    questionOrder: number;
    operator: RiskOperator;
    value: number;
    message: string;
    severity: Severity;
  }[];
};

const tests: TestSeed[] = [
  {
    title: "PCL-5",
    slug: "pcl-5",
    description: "Контрольний перелік симптомів ПТСР для DSM-5. Використовується для скринінгу симптомів ПТСР та моніторингу динаміки.",
    instruction: "Нижче наведено перелік проблем, які іноді виникають у людей у відповідь на дуже стресові життєві події. Вкажіть, наскільки сильно кожна з цих проблем турбувала вас протягом останнього місяця.",
    scoringType: ScoringType.SUM,
    timeMinutes: 7,
    options: [
      { label: "0 — Зовсім ні", value: 0, order: 1 },
      { label: "1 — Трохи", value: 1, order: 2 },
      { label: "2 — Помірно", value: 2, order: 3 },
      { label: "3 — Сильно", value: 3, order: 4 },
      { label: "4 — Дуже сильно", value: 4, order: 5 },
    ],
    questions: [
      "Повторювані, нав'язливі та мимовільні неприємні спогади про стресову подію.",
      "Повторювані неприємні сни, зміст та/або емоційне забарвлення яких пов'язані зі стресовою подією.",
      "Раптові відчуття або дії, ніби стресова подія відбувається знову.",
      "Сильний або тривалий психологічний дистрес при нагадуванні про стресову подію.",
      "Виражені фізичні реакції при нагадуванні про стресову подію.",
      "Намагання уникати думок, почуттів або розмов, пов'язаних зі стресовою подією.",
      "Намагання уникати зовнішніх нагадувань, які пов'язані зі стресовою подією.",
      "Нездатність згадати важливі аспекти стресової події.",
      "Стійкі та перебільшені негативні переконання або очікування щодо себе, інших людей чи світу.",
      "Стійкі викривлені звинувачення себе або інших у причинах чи наслідках стресової події.",
      "Стійкі негативні емоційні стани.",
      "Виражене зниження інтересу або участі у важливих справах.",
      "Відчуття відстороненості або відчуженості від інших людей.",
      "Стійка нездатність відчувати позитивні емоції.",
      "Дратівливість та спалахи гніву, що виражаються в агресивній поведінці.",
      "Необачна або саморуйнівна поведінка.",
      "Надмірна настороженість, стан постійної готовності до небезпеки.",
      "Перебільшена реакція на переляк.",
      "Труднощі з концентрацією уваги.",
      "Порушення сну.",
    ],
    ranges: [
      {
        minScore: 0,
        maxScore: 30,
        title: "Симптоми ПТСР не є клінічно значущими",
        description: "Результат не вказує на клінічно значущий рівень симптомів ПТСР за сумарним балом.",
        recommendation: "Результат має розглядатися як скринінговий, а не як діагноз.",
        severity: Severity.LOW,
      },
      {
        minScore: 31,
        maxScore: 33,
        title: "Порогове значення",
        description: "Результат у пороговому діапазоні може свідчити про високу ймовірність наявності ПТСР та потребує клінічного інтерв'ю.",
        recommendation: "Рекомендовано додаткове клінічне інтерв'ю зі спеціалістом.",
        severity: Severity.HIGH,
      },
      {
        minScore: 34,
        maxScore: 80,
        title: "Виражена симптоматика ПТСР",
        description: "Результат свідчить про виражену симптоматику ПТСР за сумарним балом.",
        recommendation: "Рекомендовано професійну оцінку спеціаліста.",
        severity: Severity.CRITICAL,
      },
    ],
  },
  {
    title: "PHQ-9",
    slug: "phq-9",
    description: "Опитувальник здоров'я пацієнта для скринінгу та оцінки тяжкості депресивних симптомів.",
    instruction: "Як часто за останні 2 тижні вас турбували будь-які з наведених нижче проблем?",
    scoringType: ScoringType.SUM,
    timeMinutes: 5,
    options: [
      { label: "0 — Ніколи", value: 0, order: 1 },
      { label: "1 — Кілька днів", value: 1, order: 2 },
      { label: "2 — Більше половини днів", value: 2, order: 3 },
      { label: "3 — Майже щодня", value: 3, order: 4 },
    ],
    questions: [
      "Мало інтересу або задоволення від справ, які зазвичай подобалися.",
      "Почуття пригнічення, депресії або безнадії.",
      "Проблеми із засинанням чи прокиданням вночі, чутливий сон або, навпаки, занадто тривалий сон.",
      "Відчуття втоми або брак енергії.",
      "Поганий апетит або переїдання.",
      "Негативне ставлення до себе: відчуття себе невдахою, почуття провини або відчуття, що ви підвели себе чи свою родину.",
      "Труднощі з концентрацією уваги.",
      "Уповільненість рухів чи мовлення, яку помічають інші люди. Або навпаки — надмірна метушливість чи непосидючість.",
      "Думки про те, що вам було б краще померти або завдати собі шкоди якимось чином.",
    ],
    ranges: [
      {
        minScore: 0,
        maxScore: 4,
        title: "Депресія відсутня або мінімальна",
        description: "Результат відповідає відсутній або мінімальній депресивній симптоматиці.",
        recommendation: "Рекомендовано спостереження за самопочуттям у динаміці.",
        severity: Severity.LOW,
      },
      {
        minScore: 5,
        maxScore: 9,
        title: "Легка депресія",
        description: "Результат відповідає легкому рівню депресивної симптоматики.",
        recommendation: "Рекомендовано спостереження та за потреби консультація фахівця.",
        severity: Severity.MEDIUM,
      },
      {
        minScore: 10,
        maxScore: 14,
        title: "Помірна депресія",
        description: "Результат відповідає помірному рівню депресивної симптоматики.",
        recommendation: "Може знадобитися психотерапія або фармакотерапія після оцінки фахівцем.",
        severity: Severity.HIGH,
      },
      {
        minScore: 15,
        maxScore: 19,
        title: "Помірно тяжка депресія",
        description: "Результат відповідає помірно тяжкій депресивній симптоматиці.",
        recommendation: "Потребує обов'язкового обговорення зі спеціалістом.",
        severity: Severity.CRITICAL,
      },
      {
        minScore: 20,
        maxScore: 27,
        title: "Тяжка депресія",
        description: "Результат відповідає тяжкому рівню депресивної симптоматики.",
        recommendation: "Потрібна професійна допомога та додаткова клінічна оцінка.",
        severity: Severity.CRITICAL,
      },
    ],
    riskRules: [
      {
        questionOrder: 9,
        operator: RiskOperator.GREATER_THAN,
        value: 0,
        message: "Відповідь на 9-те питання PHQ-9 вище 0. Потрібна негайна перевірка суїцидальних ризиків.",
        severity: Severity.CRITICAL,
      },
    ],
  },
  {
    title: "GAD-7",
    slug: "gad-7",
    description: "Шкала генералізованого тривожного розладу для скринінгу та оцінки рівня тривоги.",
    instruction: "Як часто за останні 2 тижні вас турбували будь-які з наведених нижче проблем?",
    scoringType: ScoringType.SUM,
    timeMinutes: 4,
    options: [
      { label: "0 — Ніколи", value: 0, order: 1 },
      { label: "1 — Кілька днів", value: 1, order: 2 },
      { label: "2 — Більше половини днів", value: 2, order: 3 },
      { label: "3 — Майже щодня", value: 3, order: 4 },
    ],
    questions: [
      "Відчуття нервозності, тривожності або напруження.",
      "Нездатність зупинити або контролювати хвилювання.",
      "Надмірне хвилювання з різних причин.",
      "Нездатність розслабитись.",
      "Стурбованість, через яку важко всидіти на місці.",
      "Підвищена роздратованість або дратівливість.",
      "Відчуття страху, ніби може статися щось жахливе.",
    ],
    ranges: [
      {
        minScore: 0,
        maxScore: 4,
        title: "Тривога відсутня або мінімальна",
        description: "Результат відповідає мінімальному рівню тривоги.",
        recommendation: "Рекомендовано спостерігати за самопочуттям у динаміці.",
        severity: Severity.LOW,
      },
      {
        minScore: 5,
        maxScore: 9,
        title: "Легкий рівень тривоги",
        description: "Результат відповідає легкому рівню тривоги.",
        recommendation: "За потреби варто обговорити результат із фахівцем.",
        severity: Severity.MEDIUM,
      },
      {
        minScore: 10,
        maxScore: 14,
        title: "Помірний рівень тривоги",
        description: "Результат відповідає помірному рівню тривоги та є порогом для ймовірного ГТР.",
        recommendation: "Рекомендовано подальше клінічне обстеження.",
        severity: Severity.HIGH,
      },
      {
        minScore: 15,
        maxScore: 21,
        title: "Тяжкий рівень тривоги",
        description: "Результат відповідає тяжкому рівню тривоги.",
        recommendation: "Рекомендовано консультацію спеціаліста.",
        severity: Severity.CRITICAL,
      },
    ],
  },
  {
    title: "BAT-12",
    slug: "bat-12",
    description: "Скорочена версія інструменту оцінки професійного вигорання.",
    instruction: "Наведені нижче твердження стосуються вашого поточного робочого стану. Вкажіть, як часто кожне з них описує ваші відчуття на роботі.",
    scoringType: ScoringType.AVERAGE,
    timeMinutes: 6,
    options: [
      { label: "1 — Ніколи", value: 1, order: 1 },
      { label: "2 — Рідко", value: 2, order: 2 },
      { label: "3 — Іноді", value: 3, order: 3 },
      { label: "4 — Часто", value: 4, order: 4 },
      { label: "5 — Завжди", value: 5, order: 5 },
    ],
    questions: [
      "Наприкінці робочого дня я почуваюся психічно виснаженим(-ою) та спустошеним(-ою).",
      "Після роботи мені важко відновити енергію.",
      "Я почуваюся фізично виснаженим(-ою) через роботу.",
      "На роботі мені важко зацікавитися чим-небудь.",
      "Я відчуваю сильну байдужість або відразу до своєї роботи.",
      "Я цинічно ставлюся до того, що моя робота означає для інших.",
      "На роботі мені важко концентрувати увагу.",
      "Я роблю помилки в роботі, тому що мої думки зайняті іншим.",
      "У мене виникають проблеми із запам'ятовуванням речей на роботі.",
      "На роботі я почуваюся дратівливим(-ою), коли речі йдуть не так, як планувалося.",
      "Я можу неочікувано розплакатися або розізлитися на роботі без вагомої причини.",
      "Я відчуваю себе засмученим(-ою) або розчарованим(-ою) через дрібниці на роботі.",
    ],
    ranges: [
      {
        minScore: 1,
        maxScore: 2.5,
        title: "Зелена зона",
        description: "Рівень вигорання в межах норми.",
        recommendation: "Рекомендовано підтримувати поточний баланс роботи та відпочинку.",
        severity: Severity.LOW,
      },
      {
        minScore: 2.51,
        maxScore: 3,
        title: "Жовта зона",
        description: "Пре-вигорання. Підвищений ризик, наявні перші ознаки деструкції копінг-стратегій.",
        recommendation: "Рекомендовано профілактичні заходи та перегляд режиму навантаження.",
        severity: Severity.HIGH,
      },
      {
        minScore: 3.01,
        maxScore: 5,
        title: "Червона зона",
        description: "Високий ризик або наявне вигорання. Клінічно значущий рівень професійного вигорання.",
        recommendation: "Потрібна професійна психотерапевтична допомога та зміна умов праці або відпочинку.",
        severity: Severity.CRITICAL,
      },
    ],
  },
];

async function main() {
  await prisma.test.deleteMany({
    where: {
      slug: {
        in: tests.map((test) => test.slug),
      },
    },
  });

  for (const testSeed of tests) {
    const test = await prisma.test.create({
      data: {
        title: testSeed.title,
        slug: testSeed.slug,
        description: testSeed.description,
        instruction: testSeed.instruction,
        scoringType: testSeed.scoringType,
        timeMinutes: testSeed.timeMinutes,
        answerOptions: {
          create: testSeed.options,
        },
        questions: {
          create: testSeed.questions.map((text, index) => ({
            text,
            order: index + 1,
          })),
        },
        ranges: {
          create: testSeed.ranges,
        },
      },
      include: {
        questions: true,
      },
    });

    for (const rule of testSeed.riskRules ?? []) {
      const question = test.questions.find((item) => item.order === rule.questionOrder);

      if (!question) {
        throw new Error(`Question ${rule.questionOrder} not found for ${test.slug}`);
      }

      await prisma.riskRule.create({
        data: {
          testId: test.id,
          questionId: question.id,
          operator: rule.operator,
          value: rule.value,
          message: rule.message,
          severity: rule.severity,
        },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed completed");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
