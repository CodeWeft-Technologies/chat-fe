"use client";
import React from "react";
function cx(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  description?: string;
  error?: string;
  options?: Option[];
  wrapperClassName?: string;
}

export function Select({ label, description, error, options, wrapperClassName, className, id, children, ...rest }: SelectProps) {
  const selectId = id || React.useId();
  return (
    <div className={cx("space-y-1", wrapperClassName)}>
      {label && (
        <label htmlFor={selectId} className="block text-xs font-medium text-[var(--text-soft)]">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cx(
          "input-base w-full appearance-none bg-[var(--surface)]",
          error && "ring-1 ring-red-500",
          className
        )}
        {...rest}
      >
        {options?.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
        {children}
      </select>
      {description && !error && (
        <p className="text-[10px] text-[var(--text-soft)] leading-tight">{description}</p>
      )}
      {error && <p className="text-[10px] text-red-600 leading-tight">{error}</p>}
    </div>
  );
}
