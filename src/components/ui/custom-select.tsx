"use client";

import { useEffect, useRef, useState } from "react";

export type SelectOption = {
    value: string;
    label: string;
};

type CustomSelectProps = {
    label: string;
    name?: string;
    value: string;
    options: SelectOption[];
    onChange?: (value: string) => void;
};

export function CustomSelect({
    label,
    name,
    value,
    options,
    onChange,
}: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const selectedOption =
        options.find((option) => option.value === value) || options[0];

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
            <label className="ml-3 text-xs uppercase tracking-[0.28em] text-muted">
                {label}
            </label>

            {name && <input type="hidden" name={name} value={value} />}

            <div ref={wrapperRef} className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen((prev) => !prev)}
                    className="relative flex h-14 w-full items-center rounded-full border border-black/10 bg-card px-5 pr-12 text-left text-sm text-text shadow-sm outline-none transition hover:border-black/20 hover:bg-hover"
                    aria-expanded={isOpen}
                >
                    <span className="line-clamp-1">{selectedOption?.label}</span>

                    <span
                        className={`pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-xs text-muted transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"
                            }`}
                    >
                        ▼
                    </span>
                </button>

                {isOpen && (
                    <div className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-2xl border border-black/10 bg-card p-1 shadow-xl">
                        {options.map((option) => {
                            const isActive = option.value === value;

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange?.(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`block w-full rounded-xl px-4 py-3 text-left text-sm transition ${isActive
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