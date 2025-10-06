"use client";

import { useCallback } from "react";
import { DiagramModel, DefaultLinkModel, type DiagramEngine } from "@projectstorm/react-diagrams";
import { AbstractReactFactory } from "@projectstorm/react-canvas-core";
import { DiagramViewport } from "@/components/diagram-viewport";
import { useDiagramEngine } from "@/lib/diagram/use-diagram-engine";
import type { NodeModelGenerics } from "@projectstorm/react-diagrams-core/dist/@types/entities/node/NodeModel";
import { NodeModel, PortModel, PortModelAlignment, PortWidget } from "@projectstorm/react-diagrams-core";
import { DefaultPortModel } from "@projectstorm/react-diagrams-defaults";
import type { DefaultPortModelOptions } from "@projectstorm/react-diagrams-defaults";

interface ClassOptions {
  name: string;
  fields: string[];
  color: string;
  accent: string;
  position: { x: number; y: number };
}

type ClassConfig = ClassOptions & { type?: string };

type ClassNodeGenerics = NodeModelGenerics & {
  OPTIONS: ClassConfig;
};

const palette = {
  usuario: { base: "#0f172a", accent: "#38bdf8" },
  conversacion: { base: "#1e3a8a", accent: "#60a5fa" },
  flujo: { base: "#0e7490", accent: "#22d3ee" },
  cotizacion: { base: "#0f766e", accent: "#34d399" },
  agente: { base: "#312e81", accent: "#a855f7" },
  mensaje: { base: "#7c2d12", accent: "#f97316" },
} as const;

function withAlpha(hex: string, alpha: number) {
  const sanitized = hex.replace("#", "");
  if (sanitized.length !== 6) {
    return hex;
  }
  const clamped = Math.round(Math.min(Math.max(alpha, 0), 1) * 255);
  const alphaHex = clamped.toString(16).padStart(2, "0");
  return `#${sanitized}${alphaHex}`;
}

class ClassNodeModel extends NodeModel<ClassNodeGenerics> {
  constructor(options: ClassOptions) {
    super({ type: "class-node" });

    this.options = {
      ...this.options,
      name: options.name,
      fields: options.fields,
      color: options.color,
      accent: options.accent,
      position: options.position,
    } as never;

    this.addPort(
      new DefaultPortModel({ in: true, name: "in", alignment: PortModelAlignment.LEFT })
    );
    this.addPort(
      new DefaultPortModel({ in: false, name: "out", alignment: PortModelAlignment.RIGHT })
    );

    Object.values(this.getPorts()).forEach((port) => port.setLocked(true));
    this.setPosition(options.position.x, options.position.y);
    this.setSelected(false);
    this.setLocked(false);
  }

  getFieldList(): string[] {
    return this.options.fields ?? [];
  }
}

function ClassPortAnchor({ port, engine, accent, position }: { port: PortModel | null | undefined; engine: DiagramEngine; accent: string; position: "left" | "right" }) {
  if (!port) {
    return null;
  }
  const isLeft = position === "left";
  const anchorPlacement = isLeft ? "-left-6 flex-row-reverse" : "-right-6";
  const label = ((port.getOptions() as DefaultPortModelOptions).name ?? "").toUpperCase();

  return (
    <PortWidget engine={engine} port={port}>
      <div className={`group absolute top-1/2 flex -translate-y-1/2 items-center gap-2 ${anchorPlacement}`}>
        {isLeft ? (
          <span className="rounded-full border border-white/10 bg-slate-950/70 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em] text-white/65 shadow-[0_6px_16px_rgba(8,13,24,0.6)]">
            {label}
          </span>
        ) : null}
        <span className="relative flex h-4 w-4 items-center justify-center">
          <span
            className="absolute inset-0 rounded-full opacity-70"
            style={{ background: withAlpha(accent, 0.25), boxShadow: `0 10px 22px -14px ${withAlpha(accent, 0.85)}` }}
          />
          <span
            className="relative h-3 w-3 rounded-full border border-white/75 bg-slate-950 transition-transform duration-200 ease-out group-hover:scale-110"
            style={{ background: accent, boxShadow: `0 0 0 2px ${withAlpha(accent, 0.5)}, 0 0 0 5px rgba(8,15,28,0.75)` }}
          />
        </span>
        {!isLeft ? (
          <span className="rounded-full border border-white/10 bg-slate-950/70 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em] text-white/65 shadow-[0_6px_16px_rgba(8,13,24,0.6)]">
            {label}
          </span>
        ) : null}
      </div>
    </PortWidget>
  );
}

function ClassNodeWidget({ node, engine }: { node: ClassNodeModel; engine: DiagramEngine }) {
  const options = node.getOptions() as ClassOptions;
  const overlay = `linear-gradient(140deg, ${withAlpha(options.accent, 0.22)}, ${withAlpha(options.color, 0.82)})`;
  const fields = node.getFieldList();
  const inPort = node.getPort("in");
  const outPort = node.getPort("out");

  const fieldItems = fields.map((field) => {
    const [namePart, ...typeParts] = field.split(":");
    return {
      name: namePart?.trim() || field,
      type: typeParts.join(":").trim(),
      raw: field,
    };
  });
  const initials =
    options.name
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || options.name.slice(0, 2).toUpperCase();
  const accentRibbon = `linear-gradient(180deg, ${withAlpha(options.accent, 0.85)}, ${withAlpha(options.accent, 0.15)})`;

  return (
    <div className="relative flex items-center gap-5">
      <ClassPortAnchor port={inPort} engine={engine} accent={options.accent} position="left" />
      <div className="relative w-64 overflow-hidden rounded-[26px] border border-white/10 bg-slate-950/80 text-slate-100 shadow-[0_24px_46px_-30px_rgba(6,12,32,0.9)] backdrop-blur">
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-95" style={{ background: overlay }} />
          <div className="absolute inset-y-0 left-0 w-[12px]" style={{ background: accentRibbon }} />
          <div className="absolute inset-x-0 top-0 h-20" style={{ background: `linear-gradient(180deg, ${withAlpha(options.color, 0.38)}, transparent)` }} />
        </div>
        <div className="relative flex flex-col gap-4 px-6 py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10">
                <span className="absolute inset-0 rounded-2xl border border-white/15 bg-slate-950/75" style={{ boxShadow: `0 12px 26px -18px ${withAlpha(options.accent, 0.9)}` }} />
                <span
                  className="relative flex h-full w-full items-center justify-center rounded-2xl text-[12px] font-semibold uppercase tracking-[0.2em]"
                  style={{ background: `linear-gradient(135deg, ${withAlpha(options.accent, 0.9)}, ${withAlpha(options.color, 0.45)})`, color: "#fff" }}
                >
                  {initials}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/60">Entidad</span>
                <h3 className="text-lg font-semibold text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.38)]">{options.name}</h3>
              </div>
            </div>
            <span className="rounded-full border border-white/12 bg-white/10 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.22em] text-white/70">
              UML
            </span>
          </div>
          <ul className="flex flex-col gap-1.5">
            {fieldItems.map(({ name, type, raw }) => (
              <li
                key={raw}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/55 px-3 py-2 text-[12px] text-white/85 shadow-[0_14px_28px_-24px_rgba(0,0,0,0.85)]"
              >
                <span className="h-2 w-2 rounded-full shadow-[0_0_0_2px_rgba(8,15,28,0.65)]" style={{ background: options.accent }} />
                <span className="flex-1 font-medium text-white">{name}</span>
                <span className="rounded-full border border-white/12 bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-white/60">
                  {type ? type.toUpperCase() : "DATO"}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-white/45">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: options.accent }} />
            <span>{fields.length} atributos</span>
          </div>
        </div>
      </div>
      <ClassPortAnchor port={outPort} engine={engine} accent={options.accent} position="right" />
    </div>
  );
}


class ClassNodeFactory extends AbstractReactFactory<ClassNodeModel, DiagramEngine> {
  constructor() {
    super("class-node");
  }

  generateModel(): ClassNodeModel {
    return new ClassNodeModel({
      name: "Clase",
      fields: [],
      color: palette.usuario.base,
      accent: palette.usuario.accent,
      position: { x: 0, y: 0 },
    });
  }

  generateReactWidget(event: { model: ClassNodeModel }) {
    const engine = this.engine as DiagramEngine | undefined;
    if (!engine) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("ClassNodeFactory render attempted without an active diagram engine.");
      }
      return <></>;
    }
    return <ClassNodeWidget node={event.model} engine={engine} />;
  }
}

function createNode({ name, fields, paletteKey, position }: { name: string; fields: string[]; paletteKey: keyof typeof palette; position: { x: number; y: number } }) {
  const paletteEntry = palette[paletteKey];
  return new ClassNodeModel({
    name,
    fields,
    color: paletteEntry.base,
    accent: paletteEntry.accent,
    position,
  });
}

export function UmlDiagram() {
  const buildModel = useCallback((engine: DiagramEngine) => {
    const factory = new ClassNodeFactory();
    factory.setDiagramEngine(engine);
    engine.getNodeFactories().registerFactory(factory);

    const model = new DiagramModel();

    const nodes = [
      createNode({
        name: "Usuario",
        fields: ["id: uuid", "wa_id: string", "nombre: string", "fecha_creacion: timestamp"],
        paletteKey: "usuario",
        position: { x: 80, y: 300 },
      }),
      createNode({
        name: "Conversacion",
        fields: ["id: uuid", "usuario_id: uuid", "estado: enum", "fecha_ultima: timestamp"],
        paletteKey: "conversacion",
        position: { x: 320, y: 160 },
      }),
      createNode({
        name: "Mensaje",
        fields: ["id: uuid", "conversacion_id: uuid", "remitente: enum", "contenido: text", "timestamp: timestamptz"],
        paletteKey: "mensaje",
        position: { x: 320, y: 360 },
      }),
      createNode({
        name: "Flujo",
        fields: ["id: uuid", "tipo: enum", "datos: jsonb", "estado: enum", "n8n_workflow_id: string"],
        paletteKey: "flujo",
        position: { x: 560, y: 60 },
      }),
      createNode({
        name: "Cotizacion",
        fields: [
          "id: uuid",
          "usuario_id: uuid",
          "origen: string",
          "destino: string",
          "fecha_salida: date",
          "fecha_regreso: date",
          "pasajeros: int",
          "agente_id: uuid",
          "supabase_record_id: string",
        ],
        paletteKey: "cotizacion",
        position: { x: 560, y: 260 },
      }),
      createNode({
        name: "Agente",
        fields: ["id: uuid", "nombre: string", "especialidad: string", "disponible: boolean", "supabase_user_id: uuid"],
        paletteKey: "agente",
        position: { x: 820, y: 260 },
      }),
    ];
    const [usuario, conversacion, mensaje, flujo, cotizacion, agente] = nodes;

    const connect = (
      from: ClassNodeModel,
      to: ClassNodeModel,
      labelFrom: string,
      labelTo: string,
      note?: string,
      style: { curvyness?: number; width?: number } = {},
    ) => {
      const sourcePort = from.getPort("out") as DefaultPortModel | null;
      const targetPort = to.getPort("in") as DefaultPortModel | null;
      const link = sourcePort && targetPort ? (sourcePort.link(targetPort) as DefaultLinkModel) : null;
      if (!link) return null;

      const accent = (from.getOptions() as ClassOptions).accent;
      const lineWidth = style.width ?? 2.2;
      link.setColor(accent);
      link.setWidth(lineWidth);
      link.getOptions().curvyness = style.curvyness ?? 14;
      link.getOptions().selectedColor = accent;
      link.getOptions().selectedWidth = lineWidth + 0.6;
      link.getOptions().hoverWidth = lineWidth + 0.4;
      link.addLabel(labelFrom);
      link.addLabel(labelTo);
      if (note) {
        link.addLabel(note);
      }
      link.setLocked(false);
      return link;
    };

    const links = [
      connect(usuario, conversacion, "1", "0..*", "Relacion principal", { curvyness: 12 }),
      connect(conversacion, mensaje, "1", "1..*", "Mensajes emitidos", { curvyness: 10 }),
      connect(conversacion, flujo, "1", "0..*", "Flujos n8n", { curvyness: 26, width: 2.2 }),
      connect(usuario, cotizacion, "1", "0..*", "Solicita", { curvyness: 18 }),
      connect(agente, cotizacion, "1", "0..*", "Gestiona", { curvyness: 12 }),
      connect(cotizacion, mensaje, "1", "0..*", "Seguimiento", { curvyness: 18 }),
    ].filter((link): link is DefaultLinkModel => Boolean(link));

    model.addAll(...nodes, ...links);
    model.setLocked(false);

    return model;
  }, []);

  const { engine, fitMargin } = useDiagramEngine(buildModel, [], { zoomToFit: true, fitMargin: 140 });

  return <DiagramViewport engine={engine} fitMargin={fitMargin} height="spacious" />;
}










