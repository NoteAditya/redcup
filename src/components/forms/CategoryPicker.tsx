"use client";

import { useEffect, useRef } from "react";
import { CATEGORIES, MAX_CREATOR_CATEGORIES } from "@/lib/categories";

/** Single category dropdown (brands). Keeps an older free-text value selectable until changed. */
export function CategorySelect({
  id,
  value,
  onChange,
  invalid,
  describedBy,
  selectRef,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  invalid?: boolean;
  describedBy?: string;
  selectRef?: React.Ref<HTMLSelectElement>;
}) {
  const legacy = value && !(CATEGORIES as readonly string[]).includes(value) ? value : null;
  return (
    <select
      ref={selectRef}
      id={id}
      name={id}
      className="field-control"
      value={value}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Choose a category</option>
      {legacy ? <option value={legacy}>{legacy} (current)</option> : null}
      {CATEGORIES.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
  );
}

/**
 * Multi-select category dropdown (creators), up to MAX_CREATOR_CATEGORIES.
 * A disclosure with checkboxes: works with touch, keyboard and screen readers.
 */
export function CategoryMulti({
  id,
  value,
  onChange,
  describedBy,
  max = MAX_CREATOR_CATEGORIES,
}: {
  id: string;
  value: string[];
  onChange: (v: string[]) => void;
  describedBy?: string;
  max?: number;
}) {
  const legacy = value.filter((v) => !(CATEGORIES as readonly string[]).includes(v));
  const options = [...legacy, ...CATEGORIES];
  const full = value.length >= max;
  const ref = useRef<HTMLDetailsElement>(null);
  // Close on a click outside or Escape, like a normal dropdown.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current?.open && !ref.current.contains(e.target as Node)) ref.current.open = false;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && ref.current?.open) ref.current.open = false;
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);
  return (
    <details className="cat-drop" id={id} ref={ref}>
      <summary className="field-control cat-drop-summary" aria-describedby={describedBy}>
        {value.length ? (
          <span className="cat-drop-chips">
            {value.map((v) => (
              <span key={v} className="chip">
                {v}
              </span>
            ))}
          </span>
        ) : (
          <span className="muted">{max >= CATEGORIES.length ? "Choose categories" : `Choose up to ${max} categories`}</span>
        )}
        <span aria-hidden className="cat-drop-caret">▾</span>
      </summary>
      <div className="cat-drop-list" role="group" aria-label="Categories">
        {options.map((c) => {
          const on = value.includes(c);
          return (
            <label key={c} className={on ? "cat-opt is-on" : "cat-opt"}>
              <input
                type="checkbox"
                name={`${id}-${c}`}
                checked={on}
                disabled={!on && full}
                onChange={() => onChange(on ? value.filter((x) => x !== c) : [...value, c])}
              />
              {c}
              {legacy.includes(c) ? <span className="muted"> (current)</span> : null}
            </label>
          );
        })}
      </div>
    </details>
  );
}
