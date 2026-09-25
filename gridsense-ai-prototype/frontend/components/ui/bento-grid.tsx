import React from "react";

export interface BentoGridProps {
  className?: string;
  children?: React.ReactNode;
}

export function BentoGrid({ className, children }: BentoGridProps) {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-fr ${
        className || ""
      }`}
    >
      {children}
    </div>
  );
}

export interface BentoGridItemProps {
  className?: string;
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  onClick?: () => void;
  children?: React.ReactNode;
}

export function BentoGridItem({
  className,
  title,
  description,
  header,
  icon,
  badge,
  onClick,
  children,
}: BentoGridItemProps) {
  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5 transition-all duration-300 hover:border-[var(--border-hover)] hover:-translate-y-1 after:pointer-events-none after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_top_right,rgba(168,32,32,0.08),transparent_70%)] after:opacity-0 group-hover:after:opacity-100 after:transition-opacity flex flex-col justify-between ${
        onClick ? "cursor-pointer" : ""
      } ${className || ""}`}
    >
      {/* Top accent subtle line that appears on hover */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--accent)]/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {header && <div className="mb-3 w-full">{header}</div>}

      <div className="flex-1 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            {icon && (
              <div className="text-[var(--text-tertiary)] transition-colors duration-200 group-hover:text-[var(--accent)]">
                {icon}
              </div>
            )}
            <div className="font-heading font-medium text-sm text-[var(--text-primary)]">
              {title}
            </div>
          </div>
          {badge && <div>{badge}</div>}
        </div>

        {description && (
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {description}
          </p>
        )}

        {children && <div className="mt-3">{children}</div>}
      </div>
    </div>
  );
}
