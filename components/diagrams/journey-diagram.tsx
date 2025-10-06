"use client";

import { useCallback, useMemo } from "react";
import { DiagramModel, DefaultLinkModel, type DiagramEngine } from "@projectstorm/react-diagrams";
import { AbstractReactFactory } from "@projectstorm/react-canvas-core";
import type { NodeModelGenerics } from "@projectstorm/react-diagrams-core/dist/@types/entities/node/NodeModel";
import { NodeModel, PortModel, PortModelAlignment, PortWidget } from "@projectstorm/react-diagrams-core";
import { DefaultPortModel } from "@projectstorm/react-diagrams-defaults";
import type { DefaultPortModelOptions } from "@projectstorm/react-diagrams-defaults";
import { DiagramViewport } from "@/components/diagram-viewport";
import { useDiagramEngine } from "@/lib/diagram/use-diagram-engine";
import type { DiagramBlueprint, DiagramLinkBlueprint, DiagramNodeBlueprint } from "@/lib/types/diagram";

interface JourneyDiagramProps {
  blueprint: DiagramBlueprint;
}

interface JourneyNodeOptions {
  label: string;
  subtitle?: string;
  color: string;
  accent: string;
  inPorts: string[];
  outPorts: string[];
}

type JourneyNodeGenerics = NodeModelGenerics & {
  OPTIONS: JourneyNodeOptions;
};

function withAlpha(hex: string, alpha: number) {
  const sanitized = hex.replace("#", "");
  if (sanitized.length !== 6) {
    return hex;
  }
  const clamped = Math.round(Math.min(Math.max(alpha, 0), 1) * 255);
  const alphaHex = clamped.toString(16).padStart(2, "0");
  return `#${sanitized}${alphaHex}`;
}

class JourneyNodeModel extends NodeModel<JourneyNodeGenerics> {
  constructor(options: JourneyNodeOptions) {
    super({ type: "journey-node", ...options });

    this.options = {
      ...this.options,
      label: options.label,
      subtitle: options.subtitle,
      color: options.color,
      accent: options.accent,
      inPorts: options.inPorts,
      outPorts: options.outPorts,
    } as never;

    const totalIn = options.inPorts.length || 1;
    const totalOut = options.outPorts.length || 1;

    options.inPorts.forEach((name, index) => {
      const port = new DefaultPortModel({
        in: true,
        name,
        alignment: PortModelAlignment.LEFT,
      });
      const portOptions = port.getOptions() as DefaultPortModelOptions & { extras?: { index: number; total: number } };
      portOptions.extras = { index, total: totalIn };
      port.setLocked(true);
      this.addPort(port);
    });

    options.outPorts.forEach((name, index) => {
      const port = new DefaultPortModel({
        in: false,
        name,
        alignment: PortModelAlignment.RIGHT,
      });
      const portOptions = port.getOptions() as DefaultPortModelOptions & { extras?: { index: number; total: number } };
      portOptions.extras = { index, total: totalOut };
      port.setLocked(true);
      this.addPort(port);
    });
  }
}

function JourneyPortAnchor({ port, engine }: { port: PortModel | null | undefined; engine: DiagramEngine }) {
  if (!port) {
    return null;
  }
  const options = port.getOptions() as DefaultPortModelOptions & { extras?: { index?: number; total?: number } };
  const { alignment, name } = options;
  const isLeft = alignment === PortModelAlignment.LEFT;
  const total = options.extras?.total ?? 1;
  const index = options.extras?.index ?? 0;
  const topPercentage = total === 1 ? 50 : (index / (total - 1)) * 100;
  const container = `absolute top-1/2 flex -translate-y-1/2 items-center gap-2 ${
    isLeft ? "-left-6 flex-row-reverse text-right" : "-right-6 text-left"
  }`;

  return (
    <PortWidget engine={engine} port={port}>
      <div className={container} style={{ top: `${topPercentage}%` }}>
        <span className="rounded-full border border-white/20 bg-slate-900/85 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/80 shadow-lg backdrop-blur">
          {name}
        </span>
        <span className="h-3 w-3 rounded-full border-2 border-white/80 bg-slate-950 shadow-[0_0_0_3px_rgba(10,16,30,0.9)]" />
      </div>
    </PortWidget>
  );
}

function JourneyNodeWidget({ node, engine }: { node: JourneyNodeModel; engine: DiagramEngine }) {
  const options = node.getOptions() as JourneyNodeOptions;
  const ports = Object.values(node.getPorts()) as DefaultPortModel[];
  const inPorts = ports.filter((port) => port.getOptions().in);
  const outPorts = ports.filter((port) => !port.getOptions().in);
  const accentOverlay = `linear-gradient(145deg, ${withAlpha(options.accent, 0.35)}, ${withAlpha(options.color, 0.9)})`;

  return (
    <div className="relative flex items-center">
      {inPorts.map((port) => (
        <JourneyPortAnchor key={port.getID()} port={port} engine={engine} />
      ))}
      <div className="relative w-64 overflow-hidden rounded-2xl border border-white/15 bg-slate-950/80 p-5 text-slate-100 shadow-[0_25px_50px_-12px_rgba(15,23,42,0.65)] backdrop-blur">
        <div className="absolute inset-0" style={{ background: accentOverlay, opacity: 0.92 }} />
        <div className="relative flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">Etapa</span>
            <h3 className="text-xl font-semibold text-white drop-shadow-sm">{options.label}</h3>
          </div>
          {options.subtitle ? (
            <p className="text-sm leading-relaxed text-white/80">{options.subtitle}</p>
          ) : null}
          {(options.inPorts.length > 0 || options.outPorts.length > 0) && (
            <div className="mt-1 flex flex-wrap gap-2 text-[11px] font-medium text-white/75">
              {options.inPorts.map((label) => (
                <span
                  key={`in-${label}`}
                  className="rounded-full border border-white/20 bg-white/15 px-2 py-0.5 uppercase tracking-wide text-[10px] text-white/85"
                >
                  ← {label}
                </span>
              ))}
              {options.outPorts.map((label) => (
                <span
                  key={`out-${label}`}
                  className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5 uppercase tracking-wide text-[10px] text-white/85"
                >
                  {label} →
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      {outPorts.map((port) => (
        <JourneyPortAnchor key={port.getID()} port={port} engine={engine} />
      ))}
    </div>
  );
}

class JourneyNodeFactory extends AbstractReactFactory<JourneyNodeModel, DiagramEngine> {
  constructor() {
    super("journey-node");
  }

  generateModel(): JourneyNodeModel {
    return new JourneyNodeModel({
      label: "Nodo",
      subtitle: undefined,
      color: "#38bdf8",
      accent: "#0ea5e9",
      inPorts: [],
      outPorts: [],
    });
  }

  generateReactWidget(event: { model: JourneyNodeModel }) {
    const engine = this.engine as DiagramEngine | undefined;
    if (!engine) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("JourneyNodeFactory render attempted without an active diagram engine.");
      }
      return <></>;
    }
    return <JourneyNodeWidget node={event.model} engine={engine} />;
  }
}

function createNode(definition: DiagramNodeBlueprint) {
  const node = new JourneyNodeModel({
    label: definition.label,
    subtitle: definition.subtitle,
    color: definition.color,
    accent: definition.accent ?? definition.color,
    inPorts: definition.inPorts ?? [],
    outPorts: definition.outPorts ?? [],
  });
  node.setPosition(definition.position.x, definition.position.y);
  node.setLocked(definition.locked ?? true);
  node.setSelected(false);
  return node;
}

function resolvePort(node: JourneyNodeModel, preferred: string | undefined, fallback: () => PortModel | undefined): PortModel | null {
  if (preferred) {
    const byName = node.getPort(preferred);
    if (byName) {
      return byName;
    }
  }
  const candidate = fallback();
  return candidate ?? null;
}

function connectLink(
  definition: DiagramLinkBlueprint,
  nodes: Map<string, JourneyNodeModel>,
  defaults: { color: string; width: number; curvyness: number },
) {
  const from = nodes.get(definition.from);
  const to = nodes.get(definition.to);
  if (!from || !to) {
    return null;
  }

  const source = resolvePort(from, definition.fromPort, () => {
    const ports = Object.values(from.getPorts()) as DefaultPortModel[];
    return ports.find((port) => !(port.getOptions() as DefaultPortModelOptions).in);
  });
  const target = resolvePort(to, definition.toPort, () => {
    const ports = Object.values(to.getPorts()) as DefaultPortModel[];
    return ports.find((port) => (port.getOptions() as DefaultPortModelOptions).in);
  });

  if (!source || !target) {
    return null;
  }

  const link = (source as DefaultPortModel).link(target as DefaultPortModel) as DefaultLinkModel;
  link.setColor(definition.color ?? defaults.color);
  link.setWidth(definition.width ?? defaults.width);
  link.getOptions().curvyness = definition.curvyness ?? defaults.curvyness;
  if (definition.label) {
    link.addLabel(definition.label);
  }
  link.setLocked(definition.locked ?? true);
  return link;
}

export function JourneyDiagram({ blueprint }: JourneyDiagramProps) {
  const surfaceStyle = useMemo(() => {
    const canvasHeight = blueprint.canvas?.height ?? 600;
    const verticalPadding = 100;
    const computedHeight = canvasHeight + verticalPadding;

    return {
      height: `${computedHeight}px`,
      minHeight: `${computedHeight}px`,
    } as const;
  }, [blueprint.canvas?.height]);

  const buildModel = useCallback(
    (engine: DiagramEngine) => {
      const factory = new JourneyNodeFactory();
      factory.setDiagramEngine(engine);
      engine.getNodeFactories().registerFactory(factory);

      const model = new DiagramModel();
      const nodeMap = new Map<string, JourneyNodeModel>();

      const nodeModels = blueprint.nodes.map((nodeDef) => {
        const node = createNode(nodeDef);
        nodeMap.set(nodeDef.id, node);
        return node;
      });

      const defaults = {
        color: blueprint.defaultLinkColor ?? "#38bdf8",
        width: blueprint.defaultLinkWidth ?? 2.1,
        curvyness: blueprint.defaultCurvyness ?? 40,
      };

      const linkModels = blueprint.links
        .map((linkDef) => connectLink(linkDef, nodeMap, defaults))
        .filter((link): link is DefaultLinkModel => Boolean(link));

      model.addAll(...nodeModels, ...linkModels);
      model.setLocked(blueprint.lockDiagram ?? true);

      return model;
    },
    [blueprint],
  );

  const { engine, fitMargin } = useDiagramEngine(buildModel, [blueprint], {
    zoomToFit: false,
    fitMargin: 80,
  });

  return (
    <DiagramViewport
      engine={engine}
      height="none"
      surfaceStyle={surfaceStyle}
      fitMargin={fitMargin}
      emptyMessage="Preparando blueprint de journey..."
    />
  );
}
