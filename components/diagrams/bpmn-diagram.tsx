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
  event: { base: "#0f1d2f", accent: "#38bdf8" },
  gateway: { base: "#19222f", accent: "#facc15" },
  task: { base: "#101c2b", accent: "#4f46e5" },
  subprocess: { base: "#132033", accent: "#22d3ee" },
  highlight: "#38bdf8",
};

const variantPalette = {
  event: palette.event,
  gateway: palette.gateway,
  task: palette.task,
  subprocess: palette.subprocess,
} as const;

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
      color: options.color ?? variantPalette[options.variant].base,
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

function PortHandle({ port, engine, position, variant }: { port: PortModel | null | undefined; engine: DiagramEngine; position: "left" | "right"; variant: BpmnOptions["variant"] }) {
  if (!port) {
    return null;
  }
  const side = position === "left" ? "-left-3" : "-right-3";
  const accent = palette[variant]?.accent ?? palette.highlight;
  return (
    <PortWidget engine={engine} port={port}>
      <div
        className={cn("absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 bg-slate-950 shadow-[0_0_0_4px_rgba(8,15,28,0.8)]", side)}
        style={{ borderColor: accent, boxShadow: `0 0 0 4px rgba(8,15,28,0.8), 0 0 12px 2px ${accent}44` }}
      />
    </PortWidget>
  );
}
function BpmnNodeWidget({ node, engine }: { node: BpmnNodeModel; engine: DiagramEngine }) {
  const { variant, label, tech } = node.getOptions() as BpmnOptions & {
    color: string;
    inPort: boolean;
    outPort: boolean;
  };

  const variantMeta = {
    event: {
      wrapper: "h-28 w-28",
      render: () => (
        <div className="relative flex h-28 w-28 items-center justify-center">
          <div
            className="absolute inset-0 rounded-full border-4 shadow-[0_0_30px_rgba(56,189,248,0.15)]"
            style={{ borderColor: palette.event.accent, background: "linear-gradient(160deg, rgba(56,189,248,0.18), rgba(8,47,73,0.9))" }}
          />
          <div className="relative flex flex-col items-center gap-2 text-center text-xs font-semibold text-white">
            {tech ? (
              <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/75">
                {tech}
              </span>
            ) : null}
            <span className="text-base font-semibold">{label}</span>
          </div>
        </div>
      ),
    },
    gateway: {
      wrapper: "h-28 w-28",
      render: () => (
        <div className="relative h-28 w-28">
          <div
            className="absolute inset-0 rotate-45 rounded-[22px] border-4 shadow-[0_0_30px_rgba(250,204,21,0.18)]"
            style={{ borderColor: palette.gateway.accent, background: "linear-gradient(150deg, rgba(250,204,21,0.18), rgba(46,34,20,0.95))" }}
          />
          <div className="absolute inset-0 flex rotate-45 items-center justify-center">
            <div className="-rotate-45 flex flex-col items-center gap-2 text-center text-xs font-semibold text-white">
              {tech ? (
                <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/75">
                  {tech}
                </span>
              ) : null}
              <span className="text-base font-semibold">{label}</span>
            </div>
          </div>
        </div>
      ),
    },
    subprocess: {
      wrapper: "w-72",
      render: () => (
        <div
          className="relative w-72 max-w-full overflow-hidden rounded-3xl border border-white/15 bg-slate-950/82 px-6 py-6 text-slate-100 backdrop-blur"
          style={{ boxShadow: `0 25px 55px -18px ${palette.subprocess.accent}26` }}
        >
          <div
            className="absolute inset-1 rounded-3xl border border-dashed border-white/20"
            style={{ boxShadow: "inset 0 0 0 1px rgba(34,211,238,0.18)" }}
          />
          <div className="relative flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/60">Subproceso</span>
              {tech ? (
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-0.5 text-[11px] uppercase tracking-wide text-white/80">
                  {tech}
                </span>
              ) : null}
            </div>
            <h3 className="text-xl font-semibold text-white">{label}</h3>
            <p className="text-sm text-white/75">Agrupa tareas paralelas y control de metricas, inspirado en n8n.</p>
          </div>
        </div>
      ),
    },
    task: {
      wrapper: "w-64",
      render: () => (
        <div
          className="relative w-64 overflow-hidden rounded-2xl border border-white/12 bg-slate-950/86 px-6 py-5 text-slate-100 backdrop-blur"
          style={{ boxShadow: `0 22px 45px -18px ${palette.task.accent}38` }}
        >
          <div
            className="absolute inset-y-0 left-0 w-1 rounded-l-2xl"
            style={{ background: `linear-gradient(180deg, ${palette.task.accent}85, ${palette.task.accent}00)` }}
          />
          <div className="relative flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.2em] text-white/65">
              <span>Tarea</span>
              {tech ? (
                <span className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[10px] text-white/75">{tech}</span>
              ) : null}
            </div>
            <h3 className="text-lg font-semibold text-white">{label}</h3>
          </div>
        </div>
      ),
    },
  } as const;

  const content = variantMeta[variant]?.render() ?? null;
  const inPort = node.getPort("in");
  const outPort = node.getPort("out");

  return (
    <div className={cn("relative flex items-center justify-center", variantMeta[variant]?.wrapper)}>
      {inPort && <PortHandle port={inPort} engine={engine} position="left" variant={variant} />}
      {content}
      {outPort && <PortHandle port={outPort} engine={engine} position="right" variant={variant} />}
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
    const engine = this.engine as DiagramEngine | undefined;
    if (!engine) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("BpmnNodeFactory render attempted without an active diagram engine.");
      }
      return <></>;
    }
    return <BpmnNodeWidget node={event.model} engine={engine} />;
  }
}

function stylizeLink(link: DefaultLinkModel, label?: string, color = palette.highlight) {
  link.setColor(color);
  link.setWidth(2.6);
  link.getOptions().curvyness = 35;
  link.getOptions().selectedColor = color;
  if (label) {
    link.addLabel(label);
  }
  link.setLocked(false);
}

export function BpmnDiagram({ className, frame = "surface" }: BpmnDiagramProps) {
  const buildModel = useCallback((engine: DiagramEngine) => {
    const factory = new BpmnNodeFactory();
    factory.setDiagramEngine(engine);
    engine.getNodeFactories().registerFactory(factory);

    const model = new DiagramModel();

    const inicio = new BpmnNodeModel({
      label: "Mensaje entrante",
      variant: "event",
      tech: "Webhook WhatsApp",
      inPort: false,
      color: palette.event.base,
    });
    inicio.addPort(new DefaultPortModel({ alignment: PortModelAlignment.RIGHT, in: false, name: "out" }));
    inicio.setPosition(80, 260);

    const analisis = new BpmnNodeModel({
      label: "Analizar intención",
      variant: "task",
      tech: "n8n webhook",
      color: palette.task.base,
    });
    analisis.setPosition(280, 260);

    const gateway = new BpmnNodeModel({
      label: "Visa o vuelo?",
      variant: "gateway",
      tech: "Decisión",
      color: palette.gateway.base,
    });
    gateway.setPosition(480, 260);

    const visaDoc = new BpmnNodeModel({
      label: "Obtener info visa",
      variant: "task",
      tech: "Supabase select",
      color: palette.task.base,
    });
    visaDoc.setPosition(680, 140);

    const visaPlantilla = new BpmnNodeModel({
      label: "Enviar plantilla",
      variant: "task",
      tech: "WhatsApp template",
      color: palette.task.base,
    });
    visaPlantilla.setPosition(880, 140);

    const visaFin = new BpmnNodeModel({
      label: "Fin información",
      variant: "event",
      tech: "Usuario informado",
      color: palette.event.base,
      outPort: false,
    });
    visaFin.setPosition(1080, 140);

    const subFlow = new BpmnNodeModel({
      label: "Flow recolección",
      variant: "subprocess",
      tech: "WhatsApp Flow",
      color: palette.subprocess.base,
    });
    subFlow.setPosition(680, 380);

    const validar = new BpmnNodeModel({
      label: "Validar datos",
      variant: "task",
      tech: "n8n function",
      color: palette.task.base,
    });
    validar.setPosition(880, 380);

    const guardar = new BpmnNodeModel({
      label: "Guardar cotización",
      variant: "task",
      tech: "Supabase insert",
      color: palette.task.base,
    });
    guardar.setPosition(1080, 380);

    const asignar = new BpmnNodeModel({
      label: "Asignar agente",
      variant: "task",
      tech: "n8n trigger",
      color: palette.task.base,
    });
    asignar.setPosition(1280, 380);

    const notificar = new BpmnNodeModel({
      label: "Notificar agente",
      variant: "task",
      tech: "Correo/WebSocket",
      color: palette.task.base,
    });
    notificar.setPosition(1480, 380);

    const manual = new BpmnNodeModel({
      label: "Agente responde",
      variant: "task",
      tech: "Next.js UI",
      color: palette.task.base,
    });
    manual.setPosition(1680, 380);

    const vueloFin = new BpmnNodeModel({
      label: "Cliente recibe",
      variant: "event",
      tech: "Cotización enviada",
      color: palette.event.base,
      outPort: false,
    });
    vueloFin.setPosition(1880, 380);

    const metricas = new BpmnNodeModel({
      label: "Subproceso métricas",
      variant: "subprocess",
      tech: "n8n paralelo",
      color: palette.subprocess.base,
    });
    metricas.setPosition(1280, 540);

    const metricasUpdate = new BpmnNodeModel({
      label: "Registrar tiempos",
      variant: "task",
      tech: "Supabase update",
      color: palette.task.base,
    });
    metricasUpdate.setPosition(1480, 540);

    const metricasFin = new BpmnNodeModel({
      label: "Fin métricas",
      variant: "event",
      tech: "Dashboard",
      color: palette.event.base,
      outPort: false,
    });
    metricasFin.setPosition(1680, 540);

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

    allNodes.forEach((node) => node.setLocked(false));

    const connect = (from: BpmnNodeModel, to: BpmnNodeModel, text?: string, color?: string) => {
      const source = from.getPort("out");
      const target = to.getPort("in");
      if (!source || !target) return null;
      const link = (source as DefaultPortModel).link(target as DefaultPortModel) as DefaultLinkModel;
      stylizeLink(link, text, color);
      return link;
    };

    const branchVisaColor = palette.subprocess.accent;
    const branchFlightColor = palette.task.accent;
    const parallelColor = palette.gateway.accent;
    const supabaseAccent = "#34d399";

    const links = [
      connect(inicio, analisis, "Webhook", palette.event.accent),
      connect(analisis, gateway, "Clasifica", palette.gateway.accent),
      connect(gateway, visaDoc, "Rama visa", branchVisaColor),
      connect(visaDoc, visaPlantilla, "Supabase", supabaseAccent),
      connect(visaPlantilla, visaFin, "Plantilla", branchVisaColor),
      connect(gateway, subFlow, "Rama vuelo", branchFlightColor),
      connect(subFlow, validar, "Flow completado", branchFlightColor),
      connect(validar, guardar, "Datos validos", supabaseAccent),
      connect(guardar, asignar, "Supabase id", supabaseAccent),
      connect(asignar, notificar, "Seleccion agente", palette.highlight),
      connect(notificar, manual, "Aviso", palette.highlight),
      connect(manual, vueloFin, "Respuesta", palette.highlight),
      connect(asignar, metricas, "Evento paralelo", parallelColor),
      connect(metricas, metricasUpdate, "Cronometro", parallelColor),
      connect(metricasUpdate, metricasFin, "Dashboard", parallelColor),
    ].filter(Boolean);

    model.addAll(...allNodes, ...(links as DefaultLinkModel[]));
    model.setLocked(false);

    return model;
  }, []);

  const { engine, fitMargin } = useDiagramEngine(buildModel, [], { zoomToFit: true, fitMargin: 120 });

  return <DiagramViewport engine={engine} variant={frame} className={className} fitMargin={fitMargin} height="spacious" />;
}










