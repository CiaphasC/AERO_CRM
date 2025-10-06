"use client";

import { useCallback } from "react";
import { DiagramModel, DefaultLinkModel, type DiagramEngine } from "@projectstorm/react-diagrams";
import { NodeModel, PortModel, PortModelAlignment, PortWidget } from "@projectstorm/react-diagrams-core";
import type { BasePositionModelOptions } from "@projectstorm/react-canvas-core";
import type { NodeModelGenerics } from "@projectstorm/react-diagrams-core/dist/@types/entities/node/NodeModel";
import { DefaultPortModel } from "@projectstorm/react-diagrams-defaults";
import { DiagramViewport } from "@/components/diagram-viewport";
import { useDiagramEngine } from "@/lib/diagram/use-diagram-engine";
import { AbstractReactFactory } from "@projectstorm/react-canvas-core";
import type { DefaultPortModelOptions } from "@projectstorm/react-diagrams-defaults";
import { Point } from "@projectstorm/geometry";

const palette = {
  client: { base: "#0a1929", accent: "#38bdf8" },
  gateway: { base: "#12223a", accent: "#60a5fa" },
  bot: { base: "#10243a", accent: "#818cf8" },
  flow: { base: "#14304d", accent: "#22d3ee" },
  orchestrator: { base: "#13293d", accent: "#a855f7" },
  supabase: { base: "#102f26", accent: "#34d399" },
  analytics: { base: "#1b2739", accent: "#facc15" },
  agent: { base: "#1d203a", accent: "#7c3aed" },
  whatsapp: { base: "#132c3b", accent: "#38bdf8" },
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

interface ArchitectureNodeOptions {
  name: string;
  color: string;
  accent: string;
  position: { x: number; y: number };
  inPorts?: string[];
  outPorts?: string[];
}

type ArchitectureNodeGenerics = NodeModelGenerics & {
  OPTIONS: ArchitectureNodeOptions;
};

class ArchitectureNodeModel extends NodeModel<ArchitectureNodeGenerics> {
  constructor(options: ArchitectureNodeOptions) {
    const positionPoint = new Point(options.position.x, options.position.y);
    super({
      type: "architecture-node",
      position: positionPoint,
    } as BasePositionModelOptions & ArchitectureNodeOptions);
    this.options = {
      ...this.options,
      name: options.name,
      color: options.color,
      accent: options.accent,
      position: options.position,
      inPorts: options.inPorts ?? [],
      outPorts: options.outPorts ?? [],
    } as never;

    (this.options.inPorts as string[]).forEach((label) =>
      this.addPort(
        new DefaultPortModel({
          in: true,
          name: label,
          alignment: PortModelAlignment.LEFT,
        }),
      ),
    );

    (this.options.outPorts as string[]).forEach((label) =>
      this.addPort(
        new DefaultPortModel({
          in: false,
          name: label,
          alignment: PortModelAlignment.RIGHT,
        }),
      ),
    );

    Object.values(this.getPorts()).forEach((port) => port.setLocked(true));
    this.setPosition(options.position.x, options.position.y);
    this.setSelected(false);
    this.setLocked(false);
  }
}

function ArchitecturePortAnchor({ port, engine, accent, position }: { port: PortModel | null | undefined; engine: DiagramEngine; accent: string; position: "left" | "right" }) {
  if (!port) {
    return null;
  }

  const base = position === "left" ? "-left-9 flex-row-reverse text-right" : "-right-9 text-left";

  return (
    <PortWidget engine={engine} port={port}>
      <div className={`absolute top-1/2 flex -translate-y-1/2 items-center gap-2 ${base}`}>
        <span className="rounded-full border border-white/12 bg-slate-950/85 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/70 shadow-[0_6px_12px_rgba(8,15,28,0.35)]">
          {(port.getOptions() as DefaultPortModelOptions).name}
        </span>
        <span
          className="h-3 w-3 rounded-full border-2 bg-slate-950 shadow-[0_0_0_4px_rgba(8,15,28,0.75)]"
          style={{ borderColor: accent, boxShadow: `0 0 0 4px rgba(8,15,28,0.75), 0 0 12px 2px ${accent}55` }}
        />
      </div>
    </PortWidget>
  );
}

function ArchitectureNodeWidget({ node, engine }: { node: ArchitectureNodeModel; engine: DiagramEngine }) {
  const { name, color, accent, inPorts = [], outPorts = [] } = node.getOptions() as ArchitectureNodeOptions;
  const overlay = `linear-gradient(140deg, ${withAlpha(accent, 0.2)}, ${withAlpha(color, 0.85)})`;

  const ports = Object.values(node.getPorts()) as DefaultPortModel[];
  const leftPorts = ports.filter((port) => (port.getOptions() as DefaultPortModelOptions).alignment === PortModelAlignment.LEFT);
  const rightPorts = ports.filter((port) => (port.getOptions() as DefaultPortModelOptions).alignment === PortModelAlignment.RIGHT);

  return (
    <div className="relative flex items-center">
      {leftPorts.map((port) => (
        <ArchitecturePortAnchor key={port.getID()} port={port} engine={engine} accent={accent} position="left" />
      ))}
      <div className="relative w-64 max-w-sm overflow-hidden rounded-[26px] border border-white/12 bg-slate-950/85 px-6 py-5 text-slate-100 shadow-[0_28px_60px_-24px_rgba(8,13,23,0.65)] backdrop-blur">
        <div className="absolute inset-0" style={{ background: overlay, opacity: 0.92 }} />
        <div
          className="absolute inset-x-5 top-0 h-1 rounded-full"
          style={{ background: `linear-gradient(90deg, ${withAlpha(accent, 0.75)}, transparent)` }}
        />
        <div className="relative flex flex-col gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/65">Nodo</span>
          <h3 className="text-xl font-semibold text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]">{name}</h3>
          <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-wide text-white/75">
            {[...inPorts.map((label) => ({ label, side: "in" })), ...outPorts.map((label) => ({ label, side: "out" }))].map(({ label, side }) => (
              <span
                key={`${side}-${label}`}
                className={`rounded-full border px-2 py-0.5 text-[10px] ${
                  side === "in" ? "border-white/18 bg-white/12" : "border-white/14 bg-white/8"
                }`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
      {rightPorts.map((port) => (
        <ArchitecturePortAnchor key={port.getID()} port={port} engine={engine} accent={accent} position="right" />
      ))}
    </div>
  );
}

interface LinkOptions {
  label?: string;
  color?: string;
  fromPort?: string;
  toPort?: string;
  curvyness?: number;
  width?: number;
}

function resolvePort(
  node: ArchitectureNodeModel,
  preferred: string | undefined,
  fallback: () => PortModel | undefined,
): PortModel | null {
  if (preferred) {
    const namedPort = node.getPort(preferred);
    if (namedPort) {
      return namedPort;
    }
  }

  return fallback() ?? null;
}

function connect(from: ArchitectureNodeModel, to: ArchitectureNodeModel, options: LinkOptions = {}) {
  const { label, color, fromPort, toPort, curvyness, width } = options;

  const source = resolvePort(from, fromPort, () => {
    const ports = Object.values(from.getPorts()) as DefaultPortModel[];
    return ports.find((port) => !(port.getOptions() as DefaultPortModelOptions).in);
  });
  const target = resolvePort(to, toPort, () => {
    const ports = Object.values(to.getPorts()) as DefaultPortModel[];
    return ports.find((port) => (port.getOptions() as DefaultPortModelOptions).in);
  });

  if (!source || !target) {
    return null;
  }

  const link = (source as DefaultPortModel).link(target as DefaultPortModel) as DefaultLinkModel;
  const accent = (from.getOptions() as ArchitectureNodeOptions).accent;
  const strokeColor = color ?? accent;
  const lineWidth = width ?? 2.6;
  link.setColor(strokeColor);
  link.setWidth(lineWidth);
  link.getOptions().curvyness = curvyness ?? 32;
  link.getOptions().selectedColor = strokeColor;
  if (label) {
    link.addLabel(label);
  }
  link.setLocked(false);
  return link;
}

class ArchitectureNodeFactory extends AbstractReactFactory<ArchitectureNodeModel, DiagramEngine> {
  constructor() {
    super("architecture-node");
  }

  generateModel(): ArchitectureNodeModel {
    return new ArchitectureNodeModel({
      name: "Nodo",
      color: "#0f1f33",
      accent: "#38bdf8",
      position: { x: 0, y: 0 },
    });
  }

  generateReactWidget(event: { model: ArchitectureNodeModel }) {
    const engine = this.engine as DiagramEngine | undefined;
    if (!engine) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("ArchitectureNodeFactory render attempted without an active diagram engine.");
      }
      return <></>;
    }
    return <ArchitectureNodeWidget node={event.model} engine={engine} />;
  }
}

function createNode({ name, color, accent, position, inPorts = [], outPorts = [] }: ArchitectureNodeOptions) {
  return new ArchitectureNodeModel({ name, color, accent, position, inPorts, outPorts });
}

export function ArchitectureDiagram() {
  const buildModel = useCallback(
    (engine: DiagramEngine) => {
      const factory = new ArchitectureNodeFactory();
      factory.setDiagramEngine(engine);
      engine.getNodeFactories().registerFactory(factory);

      const model = new DiagramModel();

      const client = createNode({
        name: "Cliente WhatsApp",
        color: palette.client.base,
        accent: palette.client.accent,
        position: { x: 80, y: 320 },
        outPorts: ["mensaje"],
      });

      const gateway = createNode({
        name: "Gateway Next.js",
        color: palette.gateway.base,
        accent: palette.gateway.accent,
        position: { x: 360, y: 240 },
        inPorts: ["webhook"],
        outPorts: ["evento bot", "flow"],
      });

      const bot = createNode({
        name: "Bot Conversacional",
        color: palette.bot.base,
        accent: palette.bot.accent,
        position: { x: 620, y: 150 },
        inPorts: ["evento"],
        outPorts: ["payload"],
      });

      const flows = createNode({
        name: "WhatsApp Flows",
        color: palette.flow.base,
        accent: palette.flow.accent,
        position: { x: 620, y: 360 },
        inPorts: ["activar"],
        outPorts: ["datos"],
      });

      const orchestrator = createNode({
        name: "n8n Orchestrator",
        color: palette.orchestrator.base,
        accent: palette.orchestrator.accent,
        position: { x: 900, y: 260 },
        inPorts: ["payload"],
        outPorts: ["resultado", "evento"],
      });

      const supabase = createNode({
        name: "Supabase",
        color: palette.supabase.base,
        accent: palette.supabase.accent,
        position: { x: 1180, y: 200 },
        inPorts: ["guardar"],
        outPorts: ["consultar"],
      });

      const analytics = createNode({
        name: "Analytics",
        color: palette.analytics.base,
        accent: palette.analytics.accent,
        position: { x: 1180, y: 380 },
        inPorts: ["evento"],
      });

      const agent = createNode({
        name: "Agente CRM",
        color: palette.agent.base,
        accent: palette.agent.accent,
        position: { x: 900, y: 440 },
        inPorts: ["caso"],
        outPorts: ["respuesta"],
      });

      const whatsapp = createNode({
        name: "WhatsApp API",
        color: palette.whatsapp.base,
        accent: palette.whatsapp.accent,
        position: { x: 1180, y: 520 },
        inPorts: ["mensaje"],
        outPorts: ["al cliente"],
      });

      const nodes = [
        client,
        gateway,
        bot,
        flows,
        orchestrator,
        supabase,
        analytics,
        agent,
        whatsapp,
      ];

      const links = [
        connect(client, gateway, { label: "Mensaje", color: palette.client.accent, curvyness: 24 }),
        connect(gateway, bot, {
          label: "Webhook",
          fromPort: "evento bot",
          toPort: "evento",
          color: palette.gateway.accent,
          curvyness: 26,
        }),
        connect(bot, orchestrator, {
          label: "Evento limpio",
          fromPort: "payload",
          toPort: "payload",
          color: palette.bot.accent,
          curvyness: 30,
        }),
        connect(gateway, flows, {
          label: "Flow",
          fromPort: "flow",
          toPort: "activar",
          color: palette.flow.accent,
          curvyness: 32,
        }),
        connect(flows, orchestrator, {
          label: "Datos flow",
          fromPort: "datos",
          toPort: "payload",
          color: palette.flow.accent,
          curvyness: 28,
        }),
        connect(orchestrator, supabase, {
          label: "Persistencia",
          fromPort: "resultado",
          toPort: "guardar",
          color: palette.orchestrator.accent,
          curvyness: 24,
        }),
        connect(supabase, orchestrator, {
          label: "Consultas",
          fromPort: "consultar",
          toPort: "payload",
          color: palette.supabase.accent,
          curvyness: 26,
        }),
        connect(orchestrator, analytics, {
          label: "Metricas",
          fromPort: "evento",
          toPort: "evento",
          color: palette.analytics.accent,
          curvyness: 34,
        }),
        connect(orchestrator, agent, {
          label: "Asignacion",
          fromPort: "resultado",
          toPort: "caso",
          color: palette.orchestrator.accent,
          curvyness: 28,
        }),
        connect(agent, whatsapp, {
          label: "Respuesta",
          fromPort: "respuesta",
          toPort: "mensaje",
          color: palette.agent.accent,
          curvyness: 30,
        }),
        connect(whatsapp, client, {
          label: "Mensaje final",
          fromPort: "al cliente",
          toPort: "mensaje",
          color: palette.whatsapp.accent,
          curvyness: 42,
          width: 2.8,
        }),
      ].filter((link): link is DefaultLinkModel => Boolean(link));

      model.addAll(...nodes, ...links);
      model.setLocked(false);

      return model;
    },
    [],
  );

  const { engine, fitMargin } = useDiagramEngine(buildModel, [], { zoomToFit: false, fitMargin: 80 });

  return <DiagramViewport engine={engine} fitMargin={fitMargin} height="spacious" />;
}






