"use client";

import { useCallback } from "react";
import {
  DiagramModel,
  DefaultLinkModel,
  DefaultNodeModel,
  type DiagramEngine,
} from "@projectstorm/react-diagrams";
import type { PortModel } from "@projectstorm/react-diagrams-core";
import { DefaultPortModel } from "@projectstorm/react-diagrams-defaults";
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

interface LinkOptions {
  label?: string;
  color?: string;
  fromPort?: string;
  toPort?: string;
}

function resolvePort(
  node: DefaultNodeModel,
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

function connect(from: DefaultNodeModel, to: DefaultNodeModel, options: LinkOptions = {}) {
  const { label, color = "#38bdf8", fromPort, toPort } = options;

  const source = resolvePort(from, fromPort, () => from.getOutPorts()[0]);
  const target = resolvePort(to, toPort, () => to.getInPorts()[0]);

  if (!source || !target) {
    return null;
  }

  const link = (source as DefaultPortModel).link(target as DefaultPortModel) as DefaultLinkModel;
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
        position: { x: 120, y: 280 },
        outPorts: ["mensaje"],
      });

      const gateway = createNode({
        name: "Gateway Next.js",
        color: palette.gateway,
        position: { x: 380, y: 200 },
        inPorts: ["webhook"],
        outPorts: ["evento bot", "flow"],
      });

      const bot = createNode({
        name: "Bot Conversacional",
        color: palette.bot,
        position: { x: 640, y: 120 },
        inPorts: ["evento"],
        outPorts: ["payload"],
      });

      const flows = createNode({
        name: "WhatsApp Flows",
        color: palette.flow,
        position: { x: 640, y: 280 },
        inPorts: ["activar"],
        outPorts: ["datos"],
      });

      const orchestrator = createNode({
        name: "n8n Orchestrator",
        color: palette.orchestrator,
        position: { x: 900, y: 200 },
        inPorts: ["payload"],
        outPorts: ["resultado", "evento"],
      });

      const supabase = createNode({
        name: "Supabase",
        color: palette.supabase,
        position: { x: 1160, y: 140 },
        inPorts: ["guardar"],
        outPorts: ["consultar"],
      });

      const analytics = createNode({
        name: "Analytics",
        color: palette.analytics,
        position: { x: 1160, y: 280 },
        inPorts: ["evento"],
      });

      const agent = createNode({
        name: "Agente CRM",
        color: palette.agent,
        position: { x: 900, y: 360 },
        inPorts: ["caso"],
        outPorts: ["respuesta"],
      });

      const whatsapp = createNode({
        name: "WhatsApp API",
        color: palette.whatsapp,
        position: { x: 1160, y: 420 },
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
        connect(client, gateway, { label: "Mensaje" }),
        connect(gateway, bot, { label: "Webhook", fromPort: "evento bot", toPort: "evento" }),
        connect(bot, orchestrator, { label: "Evento limpio", fromPort: "payload", toPort: "payload" }),
        connect(gateway, flows, { label: "Flow", fromPort: "flow", toPort: "activar" }),
        connect(flows, orchestrator, { label: "Datos flow", fromPort: "datos", toPort: "payload" }),
        connect(orchestrator, supabase, { label: "Consultas", fromPort: "resultado", toPort: "guardar" }),
        connect(supabase, orchestrator, { label: "Consultas", fromPort: "consultar", toPort: "payload" }),
        connect(orchestrator, analytics, { label: "Métricas", fromPort: "evento", toPort: "evento" }),
        connect(orchestrator, agent, { label: "Asignación", fromPort: "resultado", toPort: "caso" }),
        connect(agent, whatsapp, { label: "Respuesta", fromPort: "respuesta", toPort: "mensaje" }),
        connect(whatsapp, client, { label: "Mensaje final", fromPort: "al cliente", toPort: "mensaje" }),
      ].filter((link): link is DefaultLinkModel => Boolean(link));

      model.addAll(...nodes, ...links);
      model.setLocked(true);

      return model;
    },
    [],
  );

  const { engine, fitMargin } = useDiagramEngine(buildModel, [], { zoomToFit: false, fitMargin: 80 });

  return <DiagramViewport engine={engine} fitMargin={fitMargin} height="spacious" />;
}




