"use client";
import React from "react";
function cx(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  description?: string;
  error?: string;
  wrapperClassName?: string;
}

export function Textarea({ label, description, error, wrapperClassName, className, id, ...rest }: TextareaProps) {
  const uid = React.useId();
  const textareaId = id ?? uid;
  return (
    <div className={cx("space-y-1", wrapperClassName)}>
      {label && (
        <label htmlFor={textareaId} className="block text-xs font-medium text-[var(--text-soft)]">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cx(
          "input-base w-full min-h-[80px] py-2",
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
