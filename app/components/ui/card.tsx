import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const padMap = { none: "", sm: "p-3", md: "p-5", lg: "p-7" } as const;

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

export function CardHeader({ className = "", children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`flex flex-col space-y-1.5 p-6 ${className}`.trim()} {...rest}>{children}</div>;
}

export function CardTitle({ className = "", children, ...rest }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={`font-semibold leading-none tracking-tight ${className}`.trim()} {...rest}>{children}</h3>;
}

export function CardDescription({ className = "", children, ...rest }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={`text-sm text-muted-foreground ${className}`.trim()} {...rest}>{children}</p>;
}

export function CardContent({ className = "", children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-6 pt-0 ${className}`.trim()} {...rest}>{children}</div>;
}

export function CardFooter({ className = "", children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`flex items-center p-6 pt-0 ${className}`.trim()} {...rest}>{children}</div>;
}

export default Card;
