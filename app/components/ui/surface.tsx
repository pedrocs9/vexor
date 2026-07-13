import type { HTMLAttributes, ReactNode } from "react";

type SurfaceProps = HTMLAttributes<HTMLElement> & {
  as?: "div" | "section" | "aside";
  children: ReactNode;
  padded?: boolean;
};

export default function Surface({
  as: Component = "div",
  children,
  className = "",
  padded = false,
  ...props
}: SurfaceProps) {
  return (
    <Component
      className={`v-surface ${padded ? "v-surface--padded" : ""} ${className}`.trim()}
      {...props}
    >
      {children}
    </Component>
  );
}
