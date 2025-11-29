"use client";
import React from "react";
function cx(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
  wrapperClassName?: string;
}

export function Input({ label, description, error, wrapperClassName, className, id, ...rest }: InputProps) {
  const inputId = id || React.useId();
  return (
    <div className={cx("space-y-1", wrapperClassName)}>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-[var(--text-soft)]">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cx(
          "input-base w-full",
          error && "ring-1 ring-red-500",
          className
        )}
        {...rest}
      />
      {description && !error && (
        <p className="text-[10px] text-[var(--text-soft)] leading-tight">{description}</p>
      )}
      {error && <p className="text-[10px] text-red-600 leading-tight">{error}</p>}
    </div>
  );
}
