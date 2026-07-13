import type { ReactNode } from "react";

type EmptyStateProps = {
  actions?: ReactNode;
  className?: string;
  description: string;
  title: string;
};

export default function EmptyState({
  actions,
  className = "",
  description,
  title,
}: EmptyStateProps) {
  return (
    <div className={`v-empty-state ${className}`.trim()}>
      <h3 className="v-empty-state__title">{title}</h3>
      <p className="v-empty-state__description">{description}</p>
      {actions && <div className="v-empty-state__actions">{actions}</div>}
    </div>
  );
}
