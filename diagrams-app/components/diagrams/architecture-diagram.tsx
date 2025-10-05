"use client";

import { useCallback } from "react";
import { DiagramModel, DefaultLinkModel, DefaultNodeModel, type DiagramEngine } from "@projectstorm/react-diagrams";
import { DiagramViewport } from "@/components/diagram-viewport";
import { useDiagramEngine } from "@/lib/diagram/use-diagram-engine";

const palette = {
  client: "#0b1628",
  gateway: "#102235",
  bot: "#0f2a3f",
  flow: "#12324d",
  orchestrator: "#0f2a3f",
  supabase: "#123226",
  analytics: "#1f2937",
  agent: "#1e1f3b",
  whatsapp: "#102b3a",
};

type NodeOptions = {
  name: string;
  color: string;
  position: { x: number; y: number };
  inPorts?: string[];
  outPorts?: string[];
};

function createNode({ name, color, position, inPorts = [], outPorts = [] }: NodeOptions) {
  const node = new DefaultNodeModel({ name, color });
  inPorts.forEach((label) => node.addInPort(label));
  outPorts.forEach((label) => node.addOutPort(label));
  node.setPosition(position.x, position.y);
  node.setSelected(false);
  node.setLocked(true);
  Object.values(node.getPorts()).forEach((port) => port.setLocked(true));
  return node;
}

function connect(
  from: DefaultNodeModel,
  to: DefaultNodeModel,
  label?: string,
  color = "#38bdf8",
) {
  const source = from.getOutPorts()[0];
  const target = to.getInPorts()[0];
  if (!source || !target) {
    return null;
  }
  const link = source.link(target) as DefaultLinkModel;
  link.setColor(color);
  link.setWidth(2);
  link.getOptions().curvyness = 45;
  if (label) {
    link.addLabel(label);
  }
  link.setLocked(true);
  return link;
}

export function ArchitectureDiagram() {
  const buildModel = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (engine: DiagramEngine) => {
    const model = new DiagramModel();

    const client = createNode({
      name: "Cliente WhatsApp",
      color: palette.client,
      position: { x: 80, y: 320 },
      outPorts: ["mensaje"],
    });

    const gateway = createNode({
      name: "Gateway Next.js",
      color: palette.gateway,
      position: { x: 340, y: 200 },
      inPorts: ["webhook"],
      outPorts: ["evento bot", "flow"],
    });

    const bot = createNode({
      name: "Bot Conversacional",
      color: palette.bot,
      position: { x: 600, y: 120 },
      inPorts: ["evento"],
      outPorts: ["payload"],
    });

    const flows = createNode({
      name: "WhatsApp Flows",
      color: palette.flow,
      position: { x: 600, y: 320 },
      inPorts: ["activar"],
      outPorts: ["datos"],
    });

    const orchestrator = createNode({
      name: "n8n Orchestrator",
      color: palette.orchestrator,
      position: { x: 860, y: 220 },
      inPorts: ["payload"],
      outPorts: ["resultado", "evento"],
    });

    const supabase = createNode({
      name: "Supabase",
      color: palette.supabase,
      position: { x: 1120, y: 180 },
      inPorts: ["guardar"],
      outPorts: ["consultar"],
    });

    const analytics = createNode({
      name: "Analytics",
      color: palette.analytics,
      position: { x: 1120, y: 360 },
      inPorts: ["evento"],
    });

    const agent = createNode({
      name: "Agente CRM",
      color: palette.agent,
      position: { x: 860, y: 420 },
      inPorts: ["caso"],
      outPorts: ["respuesta"],
    });

    const whatsapp = createNode({
      name: "WhatsApp API",
      color: palette.whatsapp,
      position: { x: 1120, y: 520 },
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
      connect(client, gateway, "Mensaje"),
      connect(gateway, bot, "Webhook"),
      connect(bot, orchestrator, "Evento limpio"),
      connect(gateway, flows, "Flow"),
      connect(flows, orchestrator, "Datos flow"),
      connect(orchestrator, supabase, "Persistencia"),
      connect(supabase, orchestrator, "Consultas"),
      connect(orchestrator, analytics, "Metricas"),
      connect(orchestrator, agent, "Asignacion"),
      connect(agent, whatsapp, "Respuesta"),
      connect(whatsapp, client, "Mensaje final"),
    ].filter((link): link is DefaultLinkModel => Boolean(link));

    model.addAll(...nodes, ...links);
    model.setLocked(true);

    return model;
  }, []);

  const { engine, fitMargin } = useDiagramEngine(buildModel, [], { zoomToFit: true, fitMargin: 90 });

  return <DiagramViewport engine={engine} fitMargin={fitMargin} />;
}




