import type { ReactNode } from "react";

type PageHeaderProps = {
  actions?: ReactNode;
  accent?: boolean;
  className?: string;
  context?: string;
  description: ReactNode;
  title: ReactNode;
};

export default function PageHeader({
  accent = false,
  actions,
  className = "",
  context,
  description,
  title,
}: PageHeaderProps) {
  return (
    <header className={`v-page-header ${accent ? "v-page-header--accent" : ""} ${className}`.trim()}>
      <div>
        {context && <p className="v-page-header__eyebrow">{context}</p>}
        <h1 className="v-page-header__title">{title}</h1>
        <p className="v-page-header__description">{description}</p>
      </div>
      {actions && <div className="v-page-header__actions">{actions}</div>}
    </header>
  );
}
