"use client";

import { useCallback } from "react";
import { DiagramModel, DefaultLinkModel, type DiagramEngine } from "@projectstorm/react-diagrams";
import { AbstractReactFactory } from "@projectstorm/react-canvas-core";
import { DiagramViewport } from "@/components/diagram-viewport";
import { useDiagramEngine } from "@/lib/diagram/use-diagram-engine";
import type { NodeModelGenerics } from "@projectstorm/react-diagrams-core/dist/@types/entities/node/NodeModel";
import { NodeModel, PortModel, PortModelAlignment, PortWidget } from "@projectstorm/react-diagrams-core";
import type { DeserializeEvent } from "@projectstorm/react-canvas-core";
import { DefaultPortModel } from "@projectstorm/react-diagrams-defaults";

interface ClassOptions {
  name: string;
  fields: string[];
  color?: string;
}

type ClassConfig = ClassOptions & { type?: string };

type ClassNodeGenerics = NodeModelGenerics & {
  OPTIONS: ClassConfig;
};

class ClassNodeModel extends NodeModel<ClassNodeGenerics> {
  constructor(options: ClassOptions) {
    super({ type: "class-node", ...options });

    this.options = {
      ...this.options,
      name: options.name,
      fields: options.fields,
      color: options.color ?? "#3b82f6",
    } as never;

    this.addPort(
      new DefaultPortModel({
        in: true,
        name: "left",
        alignment: PortModelAlignment.LEFT,
      })
    );

    this.addPort(
      new DefaultPortModel({
        in: false,
        name: "right",
        alignment: PortModelAlignment.RIGHT,
      })
    );
  }

  serialize() {
    return {
      ...super.serialize(),
      name: this.options.name,
      fields: this.options.fields,
      color: this.options.color,
    };
  }

  deserialize(event: DeserializeEvent<this>): void {
    super.deserialize(event);
    this.options = {
      ...this.options,
      name: event.data.name,
      fields: event.data.fields,
      color: event.data.color,
    } as never;
  }
}

function PortDot({
  port,
  engine,
  position,
}: {
  port: PortModel | null | undefined;
  engine: DiagramEngine;
  position: "left" | "right";
}) {
  if (!port) {
    return null;
  }
  const base =
    "absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-slate-100 bg-slate-900";
  const side = position === "left" ? "-left-3" : "-right-3";
  return (
    <PortWidget engine={engine} port={port}>
      <div className={`${base} ${side}`} />
    </PortWidget>
  );
}

function ClassNodeWidget({ node, engine }: { node: ClassNodeModel; engine: DiagramEngine }) {
  const { name, fields, color } = node.getOptions() as ClassOptions & { color: string };
  const left = node.getPort("left");
  const right = node.getPort("right");

  return (
    <div className="relative">
      <PortDot port={left} engine={engine} position="left" />
      <div className="w-64 overflow-hidden rounded-xl border border-white/20 bg-slate-900/90 shadow-xl">
        <div className="bg-slate-800/80 px-4 py-3 text-lg font-semibold text-white" style={{ borderBottom: `2px solid ${color}` }}>
          {name}
        </div>
        <ul className="space-y-1 px-4 py-4 text-sm text-slate-200">
          {fields.map((field) => (
            <li key={field}>{field}</li>
          ))}
        </ul>
      </div>
      <PortDot port={right} engine={engine} position="right" />
    </div>
  );
}

class ClassNodeFactory extends AbstractReactFactory<ClassNodeModel, DiagramEngine> {
  constructor() {
    super("class-node");
  }

  generateModel(): ClassNodeModel {
    return new ClassNodeModel({ name: "Clase", fields: [] });
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

export function UmlDiagram() {
  const buildModel = useCallback((engine: DiagramEngine) => {
    const factory = new ClassNodeFactory();
    factory.setDiagramEngine(engine);
    engine.getNodeFactories().registerFactory(factory);

    const model = new DiagramModel();

    const usuario = new ClassNodeModel({
      name: "Usuario",
      fields: ["id: uuid", "wa_id: string", "nombre: string", "fecha_creacion: timestamp"],
      color: "#38bdf8",
    });
    usuario.setPosition(120, 280);

    const conversacion = new ClassNodeModel({
      name: "Conversación",
      fields: ["id: uuid", "usuario_id: uuid", "estado: enum", "fecha_ultima: timestamp"],
      color: "#3b82f6",
    });
    conversacion.setPosition(420, 160);

    const flujo = new ClassNodeModel({
      name: "Flujo",
      fields: ["id: uuid", "tipo: enum", "datos: jsonb", "estado: enum", "n8n_workflow_id: string"],
      color: "#22d3ee",
    });
    flujo.setPosition(740, 80);

    const cotizacion = new ClassNodeModel({
      name: "Cotización",
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
      color: "#10b981",
    });
    cotizacion.setPosition(740, 320);

    const agente = new ClassNodeModel({
      name: "Agente",
      fields: ["id: uuid", "nombre: string", "especialidad: string", "disponible: boolean", "supabase_user_id: uuid"],
      color: "#a855f7",
    });
    agente.setPosition(1060, 320);

    const mensaje = new ClassNodeModel({
      name: "Mensaje",
      fields: ["id: uuid", "conversacion_id: uuid", "remitente: enum", "contenido: text", "timestamp: timestamptz"],
      color: "#f97316",
    });
    mensaje.setPosition(420, 400);

    const nodes = [usuario, conversacion, flujo, cotizacion, agente, mensaje];
    nodes.forEach((node) => node.setLocked(true));

    const connect = (
      from: ClassNodeModel,
      to: ClassNodeModel,
      labelFrom: string,
      labelTo: string,
      note?: string,
    ) => {
      const sourcePort = from.getPort("right") as DefaultPortModel | null;
      const targetPort = to.getPort("left") as DefaultPortModel | null;
      const link = sourcePort && targetPort ? (sourcePort.link(targetPort) as DefaultLinkModel) : null;
      if (!link) return null;
      link.addLabel(labelFrom);
      link.addLabel(labelTo);
      if (note) {
        link.addLabel(note);
      }
      link.setLocked(true);
      return link;
    };

    const links = [
      connect(usuario, conversacion, "1", "*", "Propietario"),
      connect(conversacion, mensaje, "1", "*", "Composición"),
      connect(conversacion, flujo, "1", "*", "Flujos asociados"),
      connect(usuario, cotizacion, "1", "*", "Solicita"),
      connect(agente, cotizacion, "1", "*", "Gestiona"),
      connect(cotizacion, mensaje, "1", "*", "Mensajes cotización"),
    ].filter((link): link is DefaultLinkModel => Boolean(link));

    model.addAll(...nodes, ...links);
    model.setLocked(true);

    return model;
  }, []);

  const { engine, fitMargin } = useDiagramEngine(buildModel, [], { zoomToFit: false, fitMargin: 80 });

  return <DiagramViewport engine={engine} fitMargin={fitMargin} />;
}









