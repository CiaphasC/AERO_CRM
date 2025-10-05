"use client";

import type { CSSProperties } from "react";
import { CanvasWidget } from "@projectstorm/react-canvas-core";
import type { DiagramEngine } from "@projectstorm/react-diagrams";
import { DiagramControls } from "@/components/diagram-controls";
import { DiagramSurface, type DiagramSurfaceHeight, type DiagramSurfaceVariant } from "@/components/diagram-surface";
import { cn } from "@/lib/utils";
import { createEngineController } from "@/lib/diagram/use-diagram-engine";

interface DiagramViewportProps {
  variant?: DiagramSurfaceVariant;
  engine: DiagramEngine | null;
  className?: string;
  height?: DiagramSurfaceHeight;
  fitMargin?: number;
  showControls?: boolean;
  surfaceStyle?: CSSProperties;
  emptyMessage?: string;
}

export function DiagramViewport({
  engine,
  variant = "surface",
  className,
  height = "standard",
  fitMargin = 80,
  showControls = true,
  surfaceStyle,
  emptyMessage = "Generando vista del diagrama...",
}: DiagramViewportProps) {
  const controller = createEngineController(engine, { fitMargin });

  return (
    <DiagramSurface variant={variant} height={height} className={cn("diagram-viewport", className)} style={surfaceStyle}>
      {!engine ? (
        <div className="diagram-placeholder">{emptyMessage}</div>
      ) : (
        <>
          <CanvasWidget className="diagram-canvas" engine={engine} />
          {showControls ? <DiagramControls controller={controller} className="diagram-controls" /> : null}
        </>
      )}
    </DiagramSurface>
  );
}








