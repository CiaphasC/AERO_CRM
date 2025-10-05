import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type DiagramSurfaceVariant = "surface" | "bare";
export type DiagramSurfaceHeight = "standard" | "spacious" | "compact" | "none";

const HEIGHT_PRESETS: Record<Exclude<DiagramSurfaceHeight, "none">, string> = {
  standard: "clamp(500px, 96vh, 940px)",
  spacious: "clamp(560px, 100vh, 1000px)",
  compact: "clamp(420px, 88vh, 780px)",
};

interface DiagramSurfaceProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  variant?: DiagramSurfaceVariant;
  height?: DiagramSurfaceHeight;
}

export function DiagramSurface({
  children,
  className,
  style,
  variant = "surface",
  height = "standard",
}: DiagramSurfaceProps) {
  const baseClass =
    variant === "surface"
      ? "diagram-surface w-full"
      : "relative w-full overflow-hidden";

  const presetStyle =
    height === "none"
      ? undefined
      : {
          height: HEIGHT_PRESETS[height],
        };

  const composedStyle: CSSProperties | undefined = presetStyle
    ? {
        ...presetStyle,
        ...style,
      }
    : (style as CSSProperties | undefined);

  return (
    <div data-diagram-surface={variant} className={cn(baseClass, className)} style={composedStyle}>
      {children}
    </div>
  );
}
