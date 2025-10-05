"use client";

import { useCallback } from "react";
import { DiagramModel, DefaultLinkModel, type DiagramEngine } from "@projectstorm/react-diagrams";
import { AbstractReactFactory } from "@projectstorm/react-canvas-core";
import { DiagramViewport } from "@/components/diagram-viewport";
import { useDiagramEngine } from "@/lib/diagram/use-diagram-engine";
import { NodeModel, PortModelAlignment, PortWidget } from "@projectstorm/react-diagrams-core";
import type { NodeModelGenerics } from "@projectstorm/react-diagrams-core/dist/@types/entities/node/NodeModel";
import { DefaultPortModel } from "@projectstorm/react-diagrams-defaults";
import type { DefaultPortModelOptions } from "@projectstorm/react-diagrams-defaults";

interface LifelineOptions {
  label: string;
  height?: number;
}

interface EventOptions {
  id: string;
  offset: number;
  side: "left" | "right";
}

type LifelineConfig = LifelineOptions & { type?: string };

type LifelineNodeGenerics = NodeModelGenerics & {
  OPTIONS: LifelineConfig;
};

class LifelineNodeModel extends NodeModel<LifelineNodeGenerics> {
  constructor(options: LifelineOptions) {
    super({ type: "lifeline", ...options });
    this.options = {
      ...this.options,
      label: options.label,
      height: options.height ?? 640,
    } as never;
  }

  addEvent(event: EventOptions) {
    const port = new DefaultPortModel({
      in: event.side === "left",
      name: event.id,
      alignment: event.side === "left" ? PortModelAlignment.LEFT : PortModelAlignment.RIGHT,
    });
    const options = port.getOptions() as DefaultPortModelOptions & { extras?: { offset?: number } };
    options.extras = { ...(options.extras ?? {}), offset: event.offset };
    this.addPort(port);
    return port;
  }
}

function LifelineWidget({ node, engine }: { node: LifelineNodeModel; engine: DiagramEngine }) {
  const { label, height } = node.getOptions() as LifelineOptions & { height: number };
  const ports = Object.values(node.getPorts());

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 rounded-full border border-white/20 bg-slate-800/80 px-5 py-2 text-sm font-semibold text-white shadow">
        {label}
      </div>
      <div className="relative flex w-1 justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-600/60 to-slate-700/20" style={{ height }} />
        <div className="relative" style={{ height }}>
          {ports.map((port) => {
            const portOptions = port.getOptions() as DefaultPortModelOptions & { extras?: { offset?: number } };
            const offset = typeof portOptions.extras?.offset === "number" ? portOptions.extras.offset : 20;
            const side: "left" | "right" = port.getOptions().alignment === PortModelAlignment.LEFT ? "left" : "right";
            return (
              <PortWidget key={port.getID()} engine={engine} port={port}>
                <div
                  className="absolute h-3 w-3 rounded-full border-2 border-slate-100 bg-slate-950"
                  style={{ top: offset, [side]: "-18px" as never }}
                />
              </PortWidget>
            );
          })}
        </div>
      </div>
    </div>
  );
}

class LifelineFactory extends AbstractReactFactory<LifelineNodeModel, DiagramEngine> {
  constructor() {
    super("lifeline");
  }

  generateModel(): LifelineNodeModel {
    return new LifelineNodeModel({ label: "Actor" });
  }

  generateReactWidget(event: { model: LifelineNodeModel }) {
    const engine = this.engine as DiagramEngine | undefined;
    if (!engine) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("LifelineFactory render attempted without an active diagram engine.");
      }
      return <></>;
    }
    return <LifelineWidget node={event.model} engine={engine} />;
  }
}

export function SequenceDiagram() {
  const buildModel = useCallback((engine: DiagramEngine) => {
    const factory = new LifelineFactory();
    factory.setDiagramEngine(engine);
    engine.getNodeFactories().registerFactory(factory);

    const model = new DiagramModel();

    const createLifelineNode = ({ name, position, height }: { name: string; position: { x: number; y: number }; height?: number }) => {
      const node = new LifelineNodeModel({ label: name, height });
      node.setPosition(position.x, position.y);
      node.setSelected(false);
      node.setLocked(true);
      return node;
    };

    const createMessage = (() => {
      let offset = 40;
      return (
        from: LifelineNodeModel,
        to: LifelineNodeModel,
        label: string,
        color = "#38bdf8",
      ): DefaultLinkModel | null => {
        const currentOffset = offset;
        offset += 48;
        const fromPort = from.addEvent({ id: `${from.getID()}-out-${currentOffset}`, offset: currentOffset, side: "right" });
        const toPort = to.addEvent({ id: `${to.getID()}-in-${currentOffset}`, offset: currentOffset, side: "left" });
        if (!fromPort || !toPort) {
          return null;
        }
        const link = (fromPort as DefaultPortModel).link(toPort as DefaultPortModel) as DefaultLinkModel;
        link.setColor(color);
        link.setWidth(1.6);
        link.getOptions().curvyness = 35;
        if (label) {
          link.addLabel(label);
        }
        link.setLocked(true);
        return link;
      };
    })();

    const user = createLifelineNode({ name: "Usuario", position: { x: 40, y: 80 } });
    const whatsapp = createLifelineNode({ name: "WhatsApp API", position: { x: 220, y: 80 } });
    const next = createLifelineNode({ name: "Next.js Bot", position: { x: 400, y: 80 } });
    const n8n = createLifelineNode({ name: "n8n", position: { x: 580, y: 80 } });
    const supabase = createLifelineNode({ name: "Supabase", position: { x: 760, y: 80 } });
    const agent = createLifelineNode({ name: "Agente", position: { x: 940, y: 80 } });
    const gds = createLifelineNode({ name: "GDS", position: { x: 1120, y: 80 } });

    const lifelines = [user, whatsapp, next, n8n, supabase, agent, gds];
    lifelines.forEach((node) => node.setLocked(true));

    const messages = [
      createMessage(user, whatsapp, "Mensaje inicial"),
      createMessage(whatsapp, next, "POST webhook"),
      createMessage(next, n8n, "Evento limpio"),
      createMessage(n8n, supabase, "Persistir"),
      createMessage(supabase, n8n, "Respuesta"),
      createMessage(n8n, agent, "Asignar caso"),
      createMessage(agent, gds, "Búsqueda vuelos"),
      createMessage(gds, agent, "Opciones"),
      createMessage(agent, whatsapp, "Plantilla"),
      createMessage(whatsapp, user, "Mensaje final"),
    ].filter((link): link is DefaultLinkModel => Boolean(link));

    model.addAll(...lifelines, ...messages);
    model.setLocked(true);

    return model;
  }, []);

  const { engine, fitMargin } = useDiagramEngine(buildModel, [], { zoomToFit: true, fitMargin: 120 });

  return <DiagramViewport engine={engine} fitMargin={fitMargin} />;
}







