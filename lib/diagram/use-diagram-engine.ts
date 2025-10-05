import { useEffect, useState } from "react";
import createEngine, { DiagramModel, type DiagramEngine } from "@projectstorm/react-diagrams";
import { DeleteItemsAction, PanAndZoomCanvasAction, ZoomCanvasAction } from "@projectstorm/react-canvas-core";

export interface UseDiagramOptions {
  zoomToFit?: boolean;
  fitMargin?: number;
  lockModel?: boolean;
}

export type DiagramBuilder = (engine: DiagramEngine) => DiagramModel;

export interface UseDiagramResult {
  engine: DiagramEngine | null;
  fitMargin: number;
}

type MutableDiagramModel = DiagramModel & {
  setLocked?: (locked: boolean) => void;
  getZoomLevel?: () => number;
  setZoomLevel?: (zoom: number) => void;
  setOffset?: (x: number, y: number) => void;
  isLocked?: () => boolean;
  getNodes?: () => Array<{ setLocked?: (locked: boolean) => void }>;
  getLinks?: () => Array<{ setLocked?: (locked: boolean) => void }>;
};

export interface EngineController {
  zoomIn: () => void;
  zoomOut: () => void;
  zoomToFit: () => void;
  resetView: () => void;
  toggleLock: () => boolean;
  isLocked: () => boolean;
}

export function createConfiguredEngine(): DiagramEngine {
  const engine = createEngine({
    registerDefaultDeleteItemsAction: false,
    registerDefaultPanAndZoomCanvasAction: false,
    registerDefaultZoomCanvasAction: false,
  });

  const actions = engine.getActionEventBus();
  actions.registerAction(new PanAndZoomCanvasAction({ inverseZoom: true }));
  actions.registerAction(new ZoomCanvasAction({ inverseZoom: true }));
  actions.registerAction(new DeleteItemsAction({ keyCodes: [46, 8] }));

  return engine;
}

export function useDiagramEngine(
  builder: DiagramBuilder,
  deps: React.DependencyList,
  options: UseDiagramOptions = {},
): UseDiagramResult {
  const [engine, setEngine] = useState<DiagramEngine | null>(null);
  const fitMargin = options.fitMargin ?? 80;

  useEffect(() => {
    const engineInstance = createConfiguredEngine();
    const model = builder(engineInstance);
    engineInstance.setModel(model);

    if (options.lockModel) {
      const lockable = model as MutableDiagramModel;
      lockable.setLocked?.(true);
      lockable.getNodes?.()?.forEach((node) => node.setLocked?.(true));
      lockable.getLinks?.()?.forEach((link) => link.setLocked?.(true));
    }

    setEngine(engineInstance);

    let rafId: ReturnType<typeof requestAnimationFrame> | null = null;
    let cancelled = false;

    if (options.zoomToFit !== false) {
      const tryZoomToFit = () => {
        if (cancelled) {
          return;
        }

        const canvas = engineInstance.getCanvas();

        if (!canvas) {
          rafId = requestAnimationFrame(tryZoomToFit);
          return;
        }

        engineInstance.zoomToFitNodes({ margin: fitMargin });
        engineInstance.repaintCanvas();
        rafId = null;
      };

      rafId = requestAnimationFrame(tryZoomToFit);
    }

    return () => {
      cancelled = true;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      engineInstance.setModel(new DiagramModel());
      setEngine(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { engine, fitMargin };
}

export function createEngineController(
  engine: DiagramEngine | null,
  { fitMargin = 80 }: { fitMargin?: number } = {},
): EngineController {
  const noop = () => undefined;

  if (!engine) {
    return {
      zoomIn: noop,
      zoomOut: noop,
      zoomToFit: noop,
      resetView: noop,
      toggleLock: () => true,
      isLocked: () => true,
    };
  }

  const getModel = () => engine.getModel() as MutableDiagramModel;

  const changeZoom = (delta: number) => {
    const model = getModel();
    const current = model.getZoomLevel?.() ?? 100;
    const next = Math.min(300, Math.max(30, current + delta));
    model.setZoomLevel?.(next);
    engine.repaintCanvas();
  };

  const toggleLock = () => {
    const model = getModel();
    const current: boolean = model.isLocked?.() ?? false;
    const next = !current;
    model.setLocked?.(next);
    model.getNodes?.()?.forEach((node) => node.setLocked?.(next));
    model.getLinks?.()?.forEach((link) => link.setLocked?.(next));
    engine.repaintCanvas();
    return next;
  };

  return {
    zoomIn: () => changeZoom(15),
    zoomOut: () => changeZoom(-15),
    zoomToFit: () => {
      engine.zoomToFitNodes({ margin: fitMargin });
      engine.repaintCanvas();
    },
    resetView: () => {
      const model = getModel();
      model.setOffset?.(0, 0);
      model.setZoomLevel?.(100);
      engine.repaintCanvas();
    },
    toggleLock,
    isLocked: () => {
      const model = getModel();
      return model.isLocked?.() ?? false;
    },
  };
}
