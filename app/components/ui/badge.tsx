import type { HTMLAttributes, ReactNode } from "react";

type BadgeVariant = "neutral" | "success" | "warning" | "danger" | "info";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  variant?: BadgeVariant;
};

export default function Badge({
  children,
  className = "",
  variant = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span className={`v-badge v-badge--${variant} ${className}`.trim()} {...props}>
      {children}
    </span>
  );
}
