import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: "sm" | "md" | "lg";
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const padMap = { sm: "p-3", md: "p-5", lg: "p-7" } as const;

export function Card({ hover, padding = "md", title, subtitle, actions, className = "", children, ...rest }: CardProps) {
  return (
    <div
      className={`card ${hover ? 'card-hover' : ''} ${padMap[padding]} animate-fade-in ${className}`.trim()}
      {...rest}
    >
      {(title || actions) && (
        <div className="flex items-start justify-between mb-3">
          <div>
            {title && <h3 className="text-sm font-semibold tracking-tight mb-1">{title}</h3>}
            {subtitle && <p className="text-xs text-black/60 dark:text-white/60 leading-relaxed">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export default Card;
