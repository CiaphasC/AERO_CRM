"use client";

import { useCallback } from "react";
import type { ReactElement } from "react";
import { DiagramModel, DefaultLinkModel, type DiagramEngine } from "@projectstorm/react-diagrams";
import { AbstractReactFactory } from "@projectstorm/react-canvas-core";
import { NodeModel, PortModel, PortModelAlignment, PortWidget } from "@projectstorm/react-diagrams-core";
import type { DeserializeEvent } from "@projectstorm/react-canvas-core";
import type { NodeModelGenerics } from "@projectstorm/react-diagrams-core/dist/@types/entities/node/NodeModel";
import { DefaultPortModel } from "@projectstorm/react-diagrams-defaults";
import { DiagramViewport } from "@/components/diagram-viewport";
import { useDiagramEngine } from "@/lib/diagram/use-diagram-engine";
import { cn } from "@/lib/utils";

interface BpmnOptions {
  label: string;
  variant: "event" | "task" | "gateway" | "subprocess";
  tech?: string;
  color?: string;
  inPort?: boolean;
  outPort?: boolean;
}

type BpmnConfig = BpmnOptions & { type?: string };

type BpmnDiagramProps = {
  className?: string;
  frame?: "surface" | "bare";
};

type BpmnNodeGenerics = NodeModelGenerics & {
  OPTIONS: BpmnConfig;
};
const palette = {
  event: "#0c1729",
  gateway: "#1f2937",
  task: "#0f1f33",
  subprocess: "#131f33",
  highlight: "#38bdf8",
};

class BpmnNodeModel extends NodeModel<BpmnNodeGenerics> {
  constructor(options: BpmnOptions) {
    super({
      type: "bpmn-node",
      ...options,
    });

    this.options = {
      ...this.options,
      label: options.label,
      variant: options.variant,
      tech: options.tech,
      color: options.color ?? palette.task,
      inPort: options.inPort ?? true,
      outPort: options.outPort ?? true,
    } as never;

    if (this.options.inPort) {
      this.addPort(
        new DefaultPortModel({
          alignment: PortModelAlignment.LEFT,
          in: true,
          name: "in",
        }),
      );
    }

    if (this.options.outPort) {
      this.addPort(
        new DefaultPortModel({
          alignment: PortModelAlignment.RIGHT,
          in: false,
          name: "out",
        }),
      );
    }
  }

  serialize() {
    return {
      ...super.serialize(),
      label: this.options.label,
      variant: this.options.variant,
      tech: this.options.tech,
      color: this.options.color,
      inPort: this.options.inPort,
      outPort: this.options.outPort,
    };
  }

  deserialize(event: DeserializeEvent<this>): void {
    super.deserialize(event);
    this.options = {
      ...this.options,
      label: event.data.label,
      variant: event.data.variant,
      tech: event.data.tech,
      color: event.data.color,
      inPort: event.data.inPort,
      outPort: event.data.outPort,
    } as never;
  }
}

function PortHandle({ port, engine, position }: { port: PortModel | null | undefined; engine: DiagramEngine; position: "left" | "right" }) {
  if (!port) {
    return null;
  }
  const base = "absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-slate-100 bg-slate-950";
  const side = position === "left" ? "-left-3" : "-right-3";
  return (
    <PortWidget engine={engine} port={port}>
      <div className={cn(base, side)} />
    </PortWidget>
  );
}
function BpmnNodeWidget({ node, engine }: { node: BpmnNodeModel; engine: DiagramEngine }) {
  const { variant, label, tech, color } = node.getOptions() as BpmnOptions & {
    color: string;
    inPort: boolean;
    outPort: boolean;
  };

  const techPill =
    tech && tech.length > 0 ? (
      <span className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-200">
        {tech}
      </span>
    ) : null;

  let content: ReactElement;

  switch (variant) {
    case "event":
      content = (
        <div
          className="flex h-24 w-24 flex-col items-center justify-center gap-2 rounded-full border-4 bg-slate-950/85 text-center text-xs font-semibold text-slate-100 shadow-lg"
          style={{ borderColor: color }}
        >
          {techPill}
          <span>{label}</span>
        </div>
      );
      break;
    case "gateway":
      content = (
        <div className="relative h-28 w-28">
          <div className="absolute inset-0 rotate-45 rounded-lg border-4 border-amber-400/80 bg-slate-950/85 shadow-lg" />
          <div className="absolute inset-0 flex rotate-45 items-center justify-center">
            <div className="-rotate-45 flex flex-col items-center gap-1 text-center text-xs font-semibold text-amber-100">
              {techPill}
              <span>{label}</span>
            </div>
          </div>
        </div>
      );
      break;
    case "subprocess":
      content = (
        <div className="relative flex h-32 w-52 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-white/12 bg-slate-950/85 px-6 text-center text-sm text-slate-100 shadow-xl">
          <div className="absolute inset-3 rounded-2xl border border-white/12" />
          <div className="relative flex flex-col items-center gap-2">
            {techPill}
            <span className="font-semibold">{label}</span>
          </div>
        </div>
      );
      break;
    default:
      content = (
        <div className="flex h-28 w-56 flex-col items-center justify-center gap-2 rounded-xl border border-white/12 bg-slate-950/85 px-6 text-center text-sm text-slate-100 shadow-lg">
          {techPill}
          <span className="font-semibold">{label}</span>
        </div>
      );
  }

  const inPort = node.getPort("in");
  const outPort = node.getPort("out");

  return (
    <div className="relative flex items-center justify-center">
      {inPort && <PortHandle port={inPort} engine={engine} position="left" />}
      {content}
      {outPort && <PortHandle port={outPort} engine={engine} position="right" />}
    </div>
  );
}

class BpmnNodeFactory extends AbstractReactFactory<BpmnNodeModel, DiagramEngine> {
  constructor() {
    super("bpmn-node");
  }

  generateModel(): BpmnNodeModel {
    return new BpmnNodeModel({ label: "Tarea", variant: "task" });
  }

  generateReactWidget(event: { model: BpmnNodeModel }) {
    const engine = this.engine;
  if (!engine) {
      throw new Error("Diagram engine not initialized");
    }
    return <BpmnNodeWidget node={event.model} engine={engine} />;
  }
}

function stylizeLink(link: DefaultLinkModel, label?: string, color = palette.highlight) {
  link.setColor(color);
  link.setWidth(2.1);
  link.getOptions().curvyness = 45;
  if (label) {
    link.addLabel(label);
  }
  link.setLocked(true);
}

export function BpmnDiagram({ className, frame = "surface" }: BpmnDiagramProps) {
  const buildModel = useCallback((engine: DiagramEngine) => {
    engine.getNodeFactories().registerFactory(new BpmnNodeFactory());

    const model = new DiagramModel();

    const inicio = new BpmnNodeModel({
      label: "Mensaje entrante",
      variant: "event",
      tech: "Webhook WhatsApp",
      inPort: false,
      color: palette.event,
    });
    inicio.addPort(new DefaultPortModel({ alignment: PortModelAlignment.RIGHT, in: false, name: "out" }));
    inicio.setPosition(40, 240);

    const analisis = new BpmnNodeModel({
      label: "Analizar intención",
      variant: "task",
      tech: "n8n webhook",
      color: palette.task,
    });
    analisis.setPosition(220, 220);

    const gateway = new BpmnNodeModel({
      label: "Visa o vuelo?",
      variant: "gateway",
      tech: "Decisión",
      color: palette.gateway,
    });
    gateway.setPosition(420, 220);

    const visaDoc = new BpmnNodeModel({
      label: "Obtener info visa",
      variant: "task",
      tech: "Supabase select",
      color: palette.task,
    });
    visaDoc.setPosition(620, 120);

    const visaPlantilla = new BpmnNodeModel({
      label: "Enviar plantilla",
      variant: "task",
      tech: "WhatsApp template",
      color: palette.task,
    });
    visaPlantilla.setPosition(820, 120);

    const visaFin = new BpmnNodeModel({
      label: "Fin información",
      variant: "event",
      tech: "Usuario informado",
      color: palette.event,
      outPort: false,
    });
    visaFin.setPosition(1020, 120);

    const subFlow = new BpmnNodeModel({
      label: "Flow recolección",
      variant: "subprocess",
      tech: "WhatsApp Flow",
      color: palette.subprocess,
    });
    subFlow.setPosition(620, 360);

    const validar = new BpmnNodeModel({
      label: "Validar datos",
      variant: "task",
      tech: "n8n function",
      color: palette.task,
    });
    validar.setPosition(820, 360);

    const guardar = new BpmnNodeModel({
      label: "Guardar cotización",
      variant: "task",
      tech: "Supabase insert",
      color: palette.task,
    });
    guardar.setPosition(1020, 360);

    const asignar = new BpmnNodeModel({
      label: "Asignar agente",
      variant: "task",
      tech: "n8n trigger",
      color: palette.task,
    });
    asignar.setPosition(1220, 360);

    const notificar = new BpmnNodeModel({
      label: "Notificar agente",
      variant: "task",
      tech: "Correo/WebSocket",
      color: palette.task,
    });
    notificar.setPosition(1420, 360);

    const manual = new BpmnNodeModel({
      label: "Agente responde",
      variant: "task",
      tech: "Next.js UI",
      color: palette.task,
    });
    manual.setPosition(1620, 360);

    const vueloFin = new BpmnNodeModel({
      label: "Cliente recibe",
      variant: "event",
      tech: "Cotización enviada",
      color: palette.event,
      outPort: false,
    });
    vueloFin.setPosition(1820, 360);

    const metricas = new BpmnNodeModel({
      label: "Subproceso métricas",
      variant: "subprocess",
      tech: "n8n paralelo",
      color: palette.subprocess,
    });
    metricas.setPosition(1220, 520);

    const metricasUpdate = new BpmnNodeModel({
      label: "Registrar tiempos",
      variant: "task",
      tech: "Supabase update",
      color: palette.task,
    });
    metricasUpdate.setPosition(1420, 520);

    const metricasFin = new BpmnNodeModel({
      label: "Fin métricas",
      variant: "event",
      tech: "Dashboard",
      color: palette.event,
      outPort: false,
    });
    metricasFin.setPosition(1620, 520);

    const allNodes = [
      inicio,
      analisis,
      gateway,
      visaDoc,
      visaPlantilla,
      visaFin,
      subFlow,
      validar,
      guardar,
      asignar,
      notificar,
      manual,
      vueloFin,
      metricas,
      metricasUpdate,
      metricasFin,
    ];

    allNodes.forEach((node) => node.setLocked(true));

    const connect = (from: BpmnNodeModel, to: BpmnNodeModel, text?: string, color?: string) => {
      const source = from.getPort("out");
      const target = to.getPort("in");
      if (!source || !target) return null;
      const link = (source as DefaultPortModel).link(target as DefaultPortModel) as DefaultLinkModel;
      stylizeLink(link, text, color);
      return link;
    };

    const links = [
      connect(inicio, analisis, "Webhook", palette.highlight),
      connect(analisis, gateway, "n8n decide", palette.highlight),
      connect(gateway, visaDoc, "Rama visa", "#22d3ee"),
      connect(visaDoc, visaPlantilla, "Supabase", "#34d399"),
      connect(visaPlantilla, visaFin, "Template", palette.highlight),
      connect(gateway, subFlow, "Rama vuelo", palette.highlight),
      connect(subFlow, validar, "Flow completado", "#22d3ee"),
      connect(validar, guardar, "Datos válidos", "#34d399"),
      connect(guardar, asignar, "Supabase id", "#34d399"),
      connect(asignar, notificar, "Seleccion agente", palette.highlight),
      connect(notificar, manual, "Aviso", palette.highlight),
      connect(manual, vueloFin, "Respuesta", palette.highlight),
      connect(asignar, metricas, "Evento paralelo", "#a855f7"),
      connect(metricas, metricasUpdate, "Cronómetro", "#a855f7"),
      connect(metricasUpdate, metricasFin, "Dashboard", "#a855f7"),
    ].filter(Boolean);

    model.addAll(...allNodes, ...(links as DefaultLinkModel[]));
    model.setLocked(true);

    return model;
  }, []);

  const { engine, fitMargin } = useDiagramEngine(buildModel, [], { zoomToFit: true, fitMargin: 160 });

  return <DiagramViewport engine={engine} variant={frame} className={className} fitMargin={fitMargin} />;
}








