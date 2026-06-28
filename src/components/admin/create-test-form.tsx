"use client";

import { useActionState, useMemo, useState } from "react";
import { createTestAction } from "@/app/admin/tests/actions";
import { CustomSelect } from "@/components/ui/custom-select";

type AnswerMode = "SHARED" | "PER_QUESTION";
type ScoringMode = "TOTAL" | "MULTISCALE";
type ScoringType = "SUM" | "AVERAGE";
type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

type OptionDraft = {
    label: string;
    value: number;
};

type ScaleDraft = {
    code: string;
    title: string;
    description: string;
    multiplier: number;
};

type QuestionDraft = {
    text: string;
    scaleCode: string;
    options: OptionDraft[];
};

type RangeDraft = {
    scaleCode: string;
    minScore: number;
    maxScore: number;
    title: string;
    description: string;
    recommendation: string;
    severity: Severity;
};

function makeDefaultOptions(): OptionDraft[] {
    return [
        { label: "Ніколи", value: 0 },
        { label: "Іноді", value: 1 },
        { label: "Часто", value: 2 },
        { label: "Майже завжди", value: 3 },
    ];
}

function makeDefaultDassScales(): ScaleDraft[] {
    return [
        {
            code: "D",
            title: "Депресія",
            description: "",
            multiplier: 2,
        },
        {
            code: "A",
            title: "Тривожність",
            description: "",
            multiplier: 2,
        },
        {
            code: "S",
            title: "Стрес",
            description: "",
            multiplier: 2,
        },
    ];
}

export function CreateTestForm() {
    const [state, formAction, isPending] = useActionState(createTestAction, null);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [scoringType, setScoringType] = useState<ScoringType>("SUM");
    const [scoringMode, setScoringMode] = useState<ScoringMode>("TOTAL");
    const [answerMode, setAnswerMode] = useState<AnswerMode>("SHARED");
    const [isActive, setIsActive] = useState(true);

    const [sharedOptions, setSharedOptions] = useState<OptionDraft[]>(
        makeDefaultOptions()
    );

    const [scales, setScales] = useState<ScaleDraft[]>(makeDefaultDassScales());

    const [questions, setQuestions] = useState<QuestionDraft[]>([
        {
            text: "",
            scaleCode: "",
            options: makeDefaultOptions(),
        },
    ]);

    const [ranges, setRanges] = useState<RangeDraft[]>([
        {
            scaleCode: "",
            minScore: 0,
            maxScore: 10,
            title: "Низький рівень",
            description: "",
            recommendation: "",
            severity: "LOW",
        },
        {
            scaleCode: "",
            minScore: 11,
            maxScore: 20,
            title: "Середній рівень",
            description: "",
            recommendation: "",
            severity: "MEDIUM",
        },
        {
            scaleCode: "",
            minScore: 21,
            maxScore: 100,
            title: "Високий рівень",
            description: "",
            recommendation: "",
            severity: "HIGH",
        },
    ]);

    const payload = useMemo(() => {
        return JSON.stringify({
            title,
            description,
            scoringType,
            scoringMode,
            answerMode,
            isActive,
            sharedOptions,
            scales: scoringMode === "MULTISCALE" ? scales : [],
            questions,
            ranges,
        });
    }, [
        title,
        description,
        scoringType,
        scoringMode,
        answerMode,
        isActive,
        sharedOptions,
        scales,
        questions,
        ranges,
    ]);

    function addQuestion() {
        setQuestions((prev) => [
            ...prev,
            {
                text: "",
                scaleCode: "",
                options: makeDefaultOptions(),
            },
        ]);
    }

    function removeQuestion(index: number) {
        setQuestions((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
    }

    function updateQuestionText(index: number, value: string) {
        setQuestions((prev) =>
            prev.map((question, itemIndex) =>
                itemIndex === index ? { ...question, text: value } : question
            )
        );
    }

    function updateQuestionScale(index: number, value: string) {
        setQuestions((prev) =>
            prev.map((question, itemIndex) =>
                itemIndex === index ? { ...question, scaleCode: value } : question
            )
        );
    }

    function addSharedOption() {
        setSharedOptions((prev) => [
            ...prev,
            {
                label: "",
                value: prev.length,
            },
        ]);
    }

    function removeSharedOption(index: number) {
        setSharedOptions((prev) =>
            prev.filter((_, itemIndex) => itemIndex !== index)
        );
    }

    function updateSharedOption(
        index: number,
        field: keyof OptionDraft,
        value: string
    ) {
        setSharedOptions((prev) =>
            prev.map((option, itemIndex) =>
                itemIndex === index
                    ? {
                        ...option,
                        [field]: field === "value" ? Number(value) : value,
                    }
                    : option
            )
        );
    }

    function addQuestionOption(questionIndex: number) {
        setQuestions((prev) =>
            prev.map((question, itemIndex) =>
                itemIndex === questionIndex
                    ? {
                        ...question,
                        options: [
                            ...question.options,
                            {
                                label: "",
                                value: question.options.length,
                            },
                        ],
                    }
                    : question
            )
        );
    }

    function removeQuestionOption(questionIndex: number, optionIndex: number) {
        setQuestions((prev) =>
            prev.map((question, itemIndex) =>
                itemIndex === questionIndex
                    ? {
                        ...question,
                        options: question.options.filter(
                            (_, currentOptionIndex) => currentOptionIndex !== optionIndex
                        ),
                    }
                    : question
            )
        );
    }

    function updateQuestionOption(
        questionIndex: number,
        optionIndex: number,
        field: keyof OptionDraft,
        value: string
    ) {
        setQuestions((prev) =>
            prev.map((question, itemIndex) => {
                if (itemIndex !== questionIndex) {
                    return question;
                }

                return {
                    ...question,
                    options: question.options.map((option, currentOptionIndex) =>
                        currentOptionIndex === optionIndex
                            ? {
                                ...option,
                                [field]: field === "value" ? Number(value) : value,
                            }
                            : option
                    ),
                };
            })
        );
    }

    function addScale() {
        setScales((prev) => [
            ...prev,
            {
                code: "",
                title: "",
                description: "",
                multiplier: 1,
            },
        ]);
    }

    function removeScale(index: number) {
        setScales((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
    }

    function updateScale<K extends keyof ScaleDraft>(
        index: number,
        field: K,
        value: ScaleDraft[K]
    ) {
        setScales((prev) =>
            prev.map((scale, itemIndex) =>
                itemIndex === index ? { ...scale, [field]: value } : scale
            )
        );
    }

    function addRange() {
        setRanges((prev) => [
            ...prev,
            {
                scaleCode: "",
                minScore: 0,
                maxScore: 0,
                title: "",
                description: "",
                recommendation: "",
                severity: "LOW",
            },
        ]);
    }

    function removeRange(index: number) {
        setRanges((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
    }

    function updateRange<K extends keyof RangeDraft>(
        index: number,
        field: K,
        value: RangeDraft[K]
    ) {
        setRanges((prev) =>
            prev.map((range, itemIndex) =>
                itemIndex === index ? { ...range, [field]: value } : range
            )
        );
    }

    return (
        <form action={formAction} className="space-y-6">
            <input type="hidden" name="payload" value={payload} />

            {state?.error && (
                <div className="rounded-xl2 border border-softRed bg-softRed/40 px-4 py-3 text-sm text-text">
                    {state.error}
                </div>
            )}

            <section className="rounded-xl2 border border-black/5 bg-card p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold">Основна інформація</h2>

                <div className="grid gap-4">
                    <label className="grid gap-2">
                        <span className="ml-3 text-xs uppercase tracking-[0.28em] text-muted">
                            Назва тесту
                        </span>
                        <input
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            className="h-14 rounded-full border border-black/10 bg-card px-5 text-sm text-text shadow-sm outline-none transition hover:border-black/20 hover:bg-hover"
                            placeholder="Наприклад: DASS-21"
                        />
                    </label>

                    <label className="grid gap-2">
                        <span className="ml-3 text-xs uppercase tracking-[0.28em] text-muted">
                            Опис
                        </span>
                        <textarea
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            className="min-h-28 rounded-2xl border border-black/10 bg-card px-5 py-4 text-sm text-text shadow-sm outline-none transition hover:border-black/20 hover:bg-hover"
                            placeholder="Короткий опис тесту для студентів"
                        />
                    </label>

                    <div className="grid gap-4 md:grid-cols-2 items-end">
                        <CustomSelect
                            label="Тип підрахунку балів"
                            value={scoringType}
                            onChange={(value) => setScoringType(value as ScoringType)}
                            options={[
                                { value: "SUM", label: "Сума балів" },
                                { value: "AVERAGE", label: "Середнє значення" },
                            ]}
                        />

                        <CustomSelect
                            label="Тип результату"
                            value={scoringMode}
                            onChange={(value) => setScoringMode(value as ScoringMode)}
                            options={[
                                { value: "TOTAL", label: "Один загальний результат" },
                                { value: "MULTISCALE", label: "Кілька шкал" },
                            ]}
                        />

                        <CustomSelect
                            label="Варіанти відповідей"
                            value={answerMode}
                            onChange={(value) => setAnswerMode(value as AnswerMode)}
                            options={[
                                { value: "SHARED", label: "Однакові для всіх питань" },
                                {
                                    value: "PER_QUESTION",
                                    label: "Унікальні для кожного питання",
                                },
                            ]}
                        />

                        <label className="flex h-14 items-center gap-3 rounded-full border border-black/10 bg-card px-5 text-sm text-text shadow-sm transition hover:border-black/20 hover:bg-hover">
                            <input
                                type="checkbox"
                                checked={isActive}
                                onChange={(event) => setIsActive(event.target.checked)}
                            />
                            <span>Активний тест</span>
                        </label>
                    </div>
                </div>
            </section>

            {answerMode === "SHARED" && (
                <section className="rounded-xl2 border border-black/5 bg-card p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between gap-4">
                        <h2 className="text-lg font-semibold">
                            Варіанти відповідей для всього тесту
                        </h2>

                        <button
                            type="button"
                            onClick={addSharedOption}
                            className="rounded-full bg-text px-4 py-2 text-sm text-white transition-opacity hover:opacity-90"
                        >
                            Додати варіант
                        </button>
                    </div>

                    <div className="space-y-3">
                        {sharedOptions.map((option, optionIndex) => (
                            <div
                                key={optionIndex}
                                className="grid gap-3 md:grid-cols-[1fr_120px_auto]"
                            >
                                <input
                                    value={option.label}
                                    onChange={(event) =>
                                        updateSharedOption(optionIndex, "label", event.target.value)
                                    }
                                    className="h-14 rounded-full border border-black/10 bg-card px-5 text-sm text-text shadow-sm outline-none transition hover:border-black/20 hover:bg-hover"
                                    placeholder="Текст відповіді"
                                />

                                <input
                                    type="number"
                                    value={option.value}
                                    onChange={(event) =>
                                        updateSharedOption(optionIndex, "value", event.target.value)
                                    }
                                    className="h-14 rounded-full border border-black/10 bg-card px-5 text-sm text-text shadow-sm outline-none transition hover:border-black/20 hover:bg-hover"
                                    placeholder="Бал"
                                />

                                {sharedOptions.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeSharedOption(optionIndex)}
                                        className="rounded-full border border-black/10 px-3 py-2 text-xs text-muted hover:bg-hover"
                                    >
                                        Видалити
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {scoringMode === "MULTISCALE" && (
                <section className="rounded-xl2 border border-black/5 bg-card p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between gap-4">
                        <h2 className="text-lg font-semibold">Шкали</h2>

                        <button
                            type="button"
                            onClick={addScale}
                            className="rounded-full bg-text px-4 py-2 text-sm text-white transition-opacity hover:opacity-90"
                        >
                            Додати шкалу
                        </button>
                    </div>

                    <div className="space-y-4">
                        {scales.map((scale, scaleIndex) => (
                            <div
                                key={scaleIndex}
                                className="grid gap-3 rounded-xl border border-black/10 bg-white p-4 md:grid-cols-[100px_1fr_120px_auto]"
                            >
                                <input
                                    value={scale.code}
                                    onChange={(event) =>
                                        updateScale(
                                            scaleIndex,
                                            "code",
                                            event.target.value.toUpperCase()
                                        )
                                    }
                                    className="h-14 rounded-full border border-black/10 bg-card px-5 text-sm text-text shadow-sm outline-none transition hover:border-black/20 hover:bg-hover"
                                    placeholder="D"
                                />

                                <input
                                    value={scale.title}
                                    onChange={(event) =>
                                        updateScale(scaleIndex, "title", event.target.value)
                                    }
                                    className="h-14 rounded-full border border-black/10 bg-card px-5 text-sm text-text shadow-sm outline-none transition hover:border-black/20 hover:bg-hover"
                                    placeholder="Депресія"
                                />

                                <input
                                    type="number"
                                    value={scale.multiplier}
                                    onChange={(event) =>
                                        updateScale(
                                            scaleIndex,
                                            "multiplier",
                                            Number(event.target.value)
                                        )
                                    }
                                    className="h-14 rounded-full border border-black/10 bg-card px-5 text-sm text-text shadow-sm outline-none transition hover:border-black/20 hover:bg-hover"
                                    placeholder="Множник"
                                />

                                {scales.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeScale(scaleIndex)}
                                        className="rounded-full border border-black/10 px-3 py-2 text-xs text-muted hover:bg-hover"
                                    >
                                        Видалити
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section className="rounded-xl2 border border-black/5 bg-card p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-4">
                    <h2 className="text-lg font-semibold">Питання</h2>

                    <button
                        type="button"
                        onClick={addQuestion}
                        className="rounded-full bg-text px-4 py-2 text-sm text-white transition-opacity hover:opacity-90"
                    >
                        Додати питання
                    </button>
                </div>

                <div className="space-y-4">
                    {questions.map((question, questionIndex) => (
                        <div
                            key={questionIndex}
                            className="rounded-xl border border-black/10 bg-white p-4"
                        >
                            <div className="mb-4 flex items-start justify-between gap-4">
                                <div className="grid flex-1 gap-4">
                                    <label className="grid gap-2">
                                        <span className="ml-3 text-xs uppercase tracking-[0.28em] text-muted">
                                            Питання {questionIndex + 1}
                                        </span>
                                        <textarea
                                            value={question.text}
                                            onChange={(event) =>
                                                updateQuestionText(questionIndex, event.target.value)
                                            }
                                            className="min-h-20 rounded-2xl border border-black/10 bg-card px-5 py-4 text-sm text-text shadow-sm outline-none transition hover:border-black/20 hover:bg-hover"
                                            placeholder="Введіть текст питання"
                                        />
                                    </label>

                                    {scoringMode === "MULTISCALE" && (
                                        <CustomSelect
                                            label="Шкала"
                                            value={question.scaleCode}
                                            onChange={(value) =>
                                                updateQuestionScale(questionIndex, value)
                                            }
                                            options={[
                                                { value: "", label: "Оберіть шкалу" },
                                                ...scales.map((scale) => ({
                                                    value: scale.code,
                                                    label: `${scale.code || "—"} - ${scale.title || "Без назви"
                                                        }`,
                                                })),
                                            ]}
                                        />
                                    )}
                                </div>

                                {questions.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeQuestion(questionIndex)}
                                        className="rounded-full border border-black/10 px-3 py-2 text-xs text-muted hover:bg-hover"
                                    >
                                        Видалити
                                    </button>
                                )}
                            </div>

                            {answerMode === "PER_QUESTION" && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium">Варіанти відповідей</p>

                                        <button
                                            type="button"
                                            onClick={() => addQuestionOption(questionIndex)}
                                            className="rounded-full border border-black/10 px-3 py-2 text-xs hover:bg-hover"
                                        >
                                            Додати варіант
                                        </button>
                                    </div>

                                    {question.options.map((option, optionIndex) => (
                                        <div
                                            key={optionIndex}
                                            className="grid gap-3 md:grid-cols-[1fr_120px_auto]"
                                        >
                                            <input
                                                value={option.label}
                                                onChange={(event) =>
                                                    updateQuestionOption(
                                                        questionIndex,
                                                        optionIndex,
                                                        "label",
                                                        event.target.value
                                                    )
                                                }
                                                className="h-14 rounded-full border border-black/10 bg-card px-5 text-sm text-text shadow-sm outline-none transition hover:border-black/20 hover:bg-hover"
                                                placeholder="Текст відповіді"
                                            />

                                            <input
                                                type="number"
                                                value={option.value}
                                                onChange={(event) =>
                                                    updateQuestionOption(
                                                        questionIndex,
                                                        optionIndex,
                                                        "value",
                                                        event.target.value
                                                    )
                                                }
                                                className="h-14 rounded-full border border-black/10 bg-card px-5 text-sm text-text shadow-sm outline-none transition hover:border-black/20 hover:bg-hover"
                                                placeholder="Бал"
                                            />

                                            {question.options.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeQuestionOption(questionIndex, optionIndex)
                                                    }
                                                    className="rounded-full border border-black/10 px-3 py-2 text-xs text-muted hover:bg-hover"
                                                >
                                                    Видалити
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            <section className="rounded-xl2 border border-black/5 bg-card p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-4">
                    <h2 className="text-lg font-semibold">Діапазони результатів</h2>

                    <button
                        type="button"
                        onClick={addRange}
                        className="rounded-full bg-text px-4 py-2 text-sm text-white transition-opacity hover:opacity-90"
                    >
                        Додати діапазон
                    </button>
                </div>

                <div className="space-y-4">
                    {ranges.map((range, rangeIndex) => (
                        <div
                            key={rangeIndex}
                            className="rounded-xl border border-black/10 bg-white p-4"
                        >
                            <div className="mb-4 flex items-center justify-between gap-4">
                                <p className="text-sm font-medium">
                                    Діапазон {rangeIndex + 1}
                                </p>

                                {ranges.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeRange(rangeIndex)}
                                        className="rounded-full border border-black/10 px-3 py-2 text-xs text-muted hover:bg-hover"
                                    >
                                        Видалити
                                    </button>
                                )}
                            </div>

                            <div className="grid gap-4">
                                {scoringMode === "MULTISCALE" && (
                                    <CustomSelect
                                        label="Шкала"
                                        value={range.scaleCode}
                                        onChange={(value) =>
                                            updateRange(rangeIndex, "scaleCode", value)
                                        }
                                        options={[
                                            { value: "", label: "Оберіть шкалу" },
                                            ...scales.map((scale) => ({
                                                value: scale.code,
                                                label: `${scale.code || "—"} - ${scale.title || "Без назви"
                                                    }`,
                                            })),
                                        ]}
                                    />
                                )}

                                <div className="grid gap-4 md:grid-cols-3">
                                    <label className="grid gap-2">
                                        <span className="ml-3 text-xs uppercase tracking-[0.28em] text-muted">
                                            Мін. бал
                                        </span>
                                        <input
                                            type="number"
                                            value={range.minScore}
                                            onChange={(event) =>
                                                updateRange(
                                                    rangeIndex,
                                                    "minScore",
                                                    Number(event.target.value)
                                                )
                                            }
                                            className="h-14 rounded-full border border-black/10 bg-card px-5 text-sm text-text shadow-sm outline-none transition hover:border-black/20 hover:bg-hover"
                                        />
                                    </label>

                                    <label className="grid gap-2">
                                        <span className="ml-3 text-xs uppercase tracking-[0.28em] text-muted">
                                            Макс. бал
                                        </span>
                                        <input
                                            type="number"
                                            value={range.maxScore}
                                            onChange={(event) =>
                                                updateRange(
                                                    rangeIndex,
                                                    "maxScore",
                                                    Number(event.target.value)
                                                )
                                            }
                                            className="h-14 rounded-full border border-black/10 bg-card px-5 text-sm text-text shadow-sm outline-none transition hover:border-black/20 hover:bg-hover"
                                        />
                                    </label>

                                    <CustomSelect
                                        label="Рівень"
                                        value={range.severity}
                                        onChange={(value) =>
                                            updateRange(rangeIndex, "severity", value as Severity)
                                        }
                                        options={[
                                            { value: "LOW", label: "Низький" },
                                            { value: "MEDIUM", label: "Середній" },
                                            { value: "HIGH", label: "Високий" },
                                            { value: "CRITICAL", label: "Критичний" },
                                        ]}
                                    />
                                </div>

                                <label className="grid gap-2">
                                    <span className="ml-3 text-xs uppercase tracking-[0.28em] text-muted">
                                        Назва результату
                                    </span>
                                    <input
                                        value={range.title}
                                        onChange={(event) =>
                                            updateRange(rangeIndex, "title", event.target.value)
                                        }
                                        className="h-14 rounded-full border border-black/10 bg-card px-5 text-sm text-text shadow-sm outline-none transition hover:border-black/20 hover:bg-hover"
                                        placeholder="Наприклад: Помірний рівень"
                                    />
                                </label>

                                <label className="grid gap-2">
                                    <span className="ml-3 text-xs uppercase tracking-[0.28em] text-muted">
                                        Опис результату
                                    </span>
                                    <textarea
                                        value={range.description}
                                        onChange={(event) =>
                                            updateRange(rangeIndex, "description", event.target.value)
                                        }
                                        className="min-h-24 rounded-2xl border border-black/10 bg-card px-5 py-4 text-sm text-text shadow-sm outline-none transition hover:border-black/20 hover:bg-hover"
                                    />
                                </label>

                                <label className="grid gap-2">
                                    <span className="ml-3 text-xs uppercase tracking-[0.28em] text-muted">
                                        Рекомендація
                                    </span>
                                    <textarea
                                        value={range.recommendation}
                                        onChange={(event) =>
                                            updateRange(
                                                rangeIndex,
                                                "recommendation",
                                                event.target.value
                                            )
                                        }
                                        className="min-h-24 rounded-2xl border border-black/10 bg-card px-5 py-4 text-sm text-text shadow-sm outline-none transition hover:border-black/20 hover:bg-hover"
                                    />
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isPending}
                    className="rounded-full bg-text px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isPending ? "Створення..." : "Створити тест"}
                </button>
            </div>
        </form>
    );
}