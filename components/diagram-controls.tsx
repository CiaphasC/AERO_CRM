"use client";

import { useEffect, useState } from "react";
import { Lock, Maximize2, RefreshCcw, Unlock, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EngineController } from "@/lib/diagram/use-diagram-engine";

interface DiagramControlsProps {
  controller: EngineController;
  className?: string;
}

export function DiagramControls({ controller, className }: DiagramControlsProps) {
  const [locked, setLocked] = useState<boolean>(() => controller.isLocked());

  useEffect(() => {
    setLocked(controller.isLocked());
  }, [controller]);

  return (
    <div className={cn("diagram-controls", className)}>
      <button type="button" className="diagram-button" onClick={controller.zoomOut} title="Alejar" aria-label="Alejar diagrama">
        <ZoomOut className="h-4 w-4" />
      </button>
      <button type="button" className="diagram-button" onClick={controller.zoomIn} title="Acercar" aria-label="Acercar diagrama">
        <ZoomIn className="h-4 w-4" />
      </button>
      <button type="button" className="diagram-button" onClick={controller.zoomToFit} title="Ajustar a contenido" aria-label="Ajustar a contenido">
        <Maximize2 className="h-4 w-4" />
      </button>
      <button type="button" className="diagram-button" onClick={controller.resetView} title="Reiniciar vista" aria-label="Reiniciar vista">
        <RefreshCcw className="h-4 w-4" />
      </button>
      <button
        type="button"
        className="diagram-button"
        onClick={() => setLocked(controller.toggleLock())}
        title={locked ? "Desbloquear" : "Bloquear"}
        aria-label={locked ? "Desbloquear diagrama" : "Bloquear diagrama"}
      >
        {locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
      </button>
    </div>
  );
}
