import Link from "next/link";
import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  className?: string;
  href?: string;
  icon?: ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  variant?: ButtonVariant;
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({
  children,
  className = "",
  href,
  icon,
  isLoading = false,
  loadingText,
  type = "button",
  variant = "secondary",
  disabled,
  ...props
}, ref) {
  const classes = `v-btn v-btn--${variant} ${className}`.trim();
  const content = (
    <>
      {isLoading ? <span className="v-btn__spinner" aria-hidden="true" /> : icon}
      <span>{isLoading && loadingText ? loadingText : children}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button ref={ref} type={type} className={classes} disabled={disabled || isLoading} aria-busy={isLoading || undefined} {...props}>
      {content}
    </button>
  );
});

export default Button;
