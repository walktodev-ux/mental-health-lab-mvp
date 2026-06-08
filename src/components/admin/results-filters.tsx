"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type SelectOption = {
  value: string;
  label: string;
};

type CustomSelectProps = {
  label: string;
  name: string;
  value: string;
  options: SelectOption[];
};

type ResultsFiltersProps = {
  status: string;
  selectedTest: string;
  dateFrom: string;
  dateTo: string;
  statusOptions: SelectOption[];
  testOptions: SelectOption[];
};

function CustomSelect({ label, name, value, options }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption =
    options.find((option) => option.value === selectedValue) || options[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="space-y-2">
      <label className="text-xs uppercase tracking-[0.28em] text-muted">
        {label}
      </label>

      <input type="hidden" name={name} value={selectedValue} />

      <div ref={wrapperRef} className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="relative flex h-14 w-full items-center rounded-full border border-black/10 bg-card px-5 pr-12 text-left text-sm text-text shadow-sm outline-none transition hover:border-black/20 hover:bg-hover"
          aria-expanded={isOpen}
        >
          <span className="line-clamp-1">{selectedOption.label}</span>

          <span
            className={`pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-xs text-muted transition-transform duration-300 ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          >
            ▼
          </span>
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-2xl border border-black/10 bg-card p-1 shadow-xl">
            {options.map((option) => {
              const isActive = option.value === selectedValue;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setSelectedValue(option.value);
                    setIsOpen(false);
                  }}
                  className={`block w-full rounded-xl px-4 py-3 text-left text-sm transition ${
                    isActive
                      ? "bg-text text-white"
                      : "text-text hover:bg-hover"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

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
        className="text-xs uppercase tracking-[0.28em] text-muted"
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
  return (
    <form className="mt-6 grid gap-5 md:grid-cols-4" action="/admin/results">
      <CustomSelect
        label="Статус"
        name="status"
        value={status}
        options={[{ value: "", label: "Усі статуси" }, ...statusOptions]}
      />

      <CustomSelect
        label="Тест"
        name="test"
        value={selectedTest}
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

