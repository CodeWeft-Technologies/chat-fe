"use client";
import React from "react";

type Variant = "primary" | "outline" | "danger" | "ghost";
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  asChild?: boolean; // render child element instead of native button
}

const sizeMap = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

const variantMap: Record<Variant, string> = {
  primary: "btn-base btn-primary",
  outline: "btn-base btn-outline",
  danger: "btn-base bg-danger text-white hover:brightness-110",
  ghost: "btn-base bg-transparent hover:bg-black/5 dark:hover:bg-white/10",
};

export function Button({ variant = "primary", size = "md", loading, disabled, iconLeft, iconRight, children, className = "", asChild = false, ...rest }: ButtonProps) {
  const baseClasses = `${variantMap[variant]} ${sizeMap[size]} focus-ring disabled:opacity-50 disabled:cursor-not-allowed ${className}`.trim();

  if (asChild && React.isValidElement(children)) {
    // Merge existing child classNames
    const existing = (children.props as any).className || "";
    const composed = `${existing} ${baseClasses}`.trim();
    // We cannot truly disable non-button elements; simulate via aria-disabled + pointer-events
    const extraProps: Record<string, any> = {};
    if (disabled || loading) {
      extraProps['aria-disabled'] = true;
      extraProps['className'] = `${composed} pointer-events-none opacity-60`; // override composed
    }
    return React.cloneElement(children, {
      ...rest,
      ...extraProps,
      className: extraProps.className || composed,
      children: (
        <span className="flex items-center gap-1">
          {loading && <span className="inline-block w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" aria-hidden />}
          {iconLeft && <span className="flex items-center" aria-hidden>{iconLeft}</span>}
          <span className="truncate">{children.props.children}</span>
          {iconRight && <span className="flex items-center" aria-hidden>{iconRight}</span>}
        </span>
      )
    });
  }

  return (
    <button
      className={baseClasses}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <span className="inline-block w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" aria-hidden />
      )}
      {iconLeft && <span className="flex items-center" aria-hidden>{iconLeft}</span>}
      <span className="truncate">{children}</span>
      {iconRight && <span className="flex items-center" aria-hidden>{iconRight}</span>}
    </button>
  );
}

export default Button;
