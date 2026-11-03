"use client";

import { useId, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from "react";

type Common = {
  label: string;
  hint?: string;
  error?: string | null;
  required?: boolean;
  className?: string;
  id?: string;
};

export function Field({
  label,
  hint,
  error,
  required,
  className,
  id: idProp,
  children,
}: Common & { children: (ids: { id: string; describedBy?: string }) => React.ReactNode }) {
  const gen = useId();
  const id = idProp || gen;
  const hintId = `${id}-hint`;
  const errId = `${id}-err`;
  const describedBy = [hint && !error ? hintId : null, error ? errId : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={`field ${error ? "is-invalid" : ""} ${className || ""}`}>
      <label className="field-label" htmlFor={id}>
        {label}
        {required ? (
          <span className="field-req" aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
      </label>
      {children({ id, describedBy })}
      <p className="field-helper" id={error ? errId : hintId} role={error ? "alert" : undefined}>
        {error || hint || " "}
      </p>
    </div>
  );
}

export function TextField(
  props: Common &
    Omit<InputHTMLAttributes<HTMLInputElement>, "aria-invalid" | "aria-describedby" | "aria-required">,
) {
  const { label, hint, error, required, className, id, name, ...rest } = props;
  const stableId = id || (typeof name === "string" ? name : undefined);
  return (
    <Field label={label} hint={hint} error={error} required={required} className={className} id={stableId}>
      {({ id: fid, describedBy }) => (
        <input
          id={fid}
          name={name}
          className="field-control"
          aria-invalid={error ? true : undefined}
          aria-required={required || undefined}
          aria-describedby={describedBy}
          required={required}
          {...rest}
        />
      )}
    </Field>
  );
}

export function TextAreaField(
  props: Common &
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "aria-invalid" | "aria-describedby" | "aria-required">,
) {
  const { label, hint, error, required, className, id, name, ...rest } = props;
  const stableId = id || (typeof name === "string" ? name : undefined);
  return (
    <Field label={label} hint={hint} error={error} required={required} className={className} id={stableId}>
      {({ id: fid, describedBy }) => (
        <textarea
          id={fid}
          name={name}
          className="field-control field-textarea"
          aria-invalid={error ? true : undefined}
          aria-required={required || undefined}
          aria-describedby={describedBy}
          required={required}
          {...rest}
        />
      )}
    </Field>
  );
}

export function SelectField(
  props: Common &
    Omit<SelectHTMLAttributes<HTMLSelectElement>, "aria-invalid" | "aria-describedby" | "aria-required"> & {
      options: { value: string; label: string }[];
    },
) {
  const { label, hint, error, required, className, id, name, options, ...rest } = props;
  const stableId = id || (typeof name === "string" ? name : undefined);
  return (
    <Field label={label} hint={hint} error={error} required={required} className={className} id={stableId}>
      {({ id: fid, describedBy }) => (
        <select
          id={fid}
          name={name}
          className="field-control"
          aria-invalid={error ? true : undefined}
          aria-required={required || undefined}
          aria-describedby={describedBy}
          required={required}
          {...rest}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}
