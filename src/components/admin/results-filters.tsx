"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CustomSelect,
  type SelectOption,
} from "@/components/ui/custom-select";

type ResultsFiltersProps = {
  status: string;
  selectedTest: string;
  dateFrom: string;
  dateTo: string;
  statusOptions: SelectOption[];
  testOptions: SelectOption[];
};

function DateField({
  label,
  name,
  value,
}: {
  label: string;
  name: string;
  value: string;
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="ml-3 text-xs uppercase tracking-[0.28em] text-muted"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type="date"
        defaultValue={value}
        className="h-14 w-full rounded-full border border-black/10 bg-card px-5 pr-12 text-sm text-text shadow-sm outline-none transition hover:border-black/20 hover:bg-hover"
      />
    </div>
  );
}

export function ResultsFilters({
  status,
  selectedTest,
  dateFrom,
  dateTo,
  statusOptions,
  testOptions,
}: ResultsFiltersProps) {
  const [currentStatus, setCurrentStatus] = useState(status);
  const [currentTest, setCurrentTest] = useState(selectedTest);

  return (
    <form className="mt-6 grid gap-5 md:grid-cols-4" action="/admin/results">
      <CustomSelect
        label="Статус"
        name="status"
        value={currentStatus}
        onChange={setCurrentStatus}
        options={[{ value: "", label: "Усі статуси" }, ...statusOptions]}
      />

      <CustomSelect
        label="Тест"
        name="test"
        value={currentTest}
        onChange={setCurrentTest}
        options={[{ value: "all", label: "Усі тести" }, ...testOptions]}
      />

      <DateField label="Дата від" name="dateFrom" value={dateFrom} />

      <DateField label="Дата до" name="dateTo" value={dateTo} />

      <div className="flex flex-wrap gap-3 md:col-span-4">
        <button
          type="submit"
          className="rounded-full bg-text px-5 py-3 text-sm text-white transition hover:opacity-80"
        >
          Застосувати фільтри
        </button>

        <Link
          href="/admin/results"
          className="rounded-full bg-background px-5 py-3 text-sm text-text transition hover:bg-hover"
        >
          Скинути
        </Link>
      </div>
    </form>
  );
}