import type { DiagramBlueprint } from "@/lib/types/diagram";

const journeyBlueprint: DiagramBlueprint = {
  id: "crm-journey-blueprint",
  lockDiagram: true,
  defaultLinkColor: "#38bdf8",
  defaultLinkWidth: 2,
  defaultCurvyness: 45,
  canvas: {
    height: 760,
  },
  nodes: [
    {
      id: "contact",
      label: "Cliente en WhatsApp",
      color: "#0ea5e9",
      position: { x: 40, y: 220 },
      outPorts: ["mensaje"],
    },
    {
      id: "webhook",
      label: "Webhook Next.js",
      color: "#2563eb",
      position: { x: 260, y: 160 },
      inPorts: ["webhook"],
      outPorts: ["evento limpio"],
    },
    {
      id: "router",
      label: "n8n Router",
      color: "#9333ea",
      position: { x: 500, y: 160 },
      inPorts: ["evento"],
      outPorts: ["visa", "vuelo", "crm"],
    },
    {
      id: "visa-flow",
      label: "WhatsApp Flow Visa",
      color: "#0891b2",
      position: { x: 740, y: 40 },
      inPorts: ["activar"],
      outPorts: ["resumen"],
    },
    {
      id: "flight-flow",
      label: "Formulario Vuelo",
      color: "#0ea5e9",
      position: { x: 740, y: 240 },
      inPorts: ["activar"],
      outPorts: ["solicitud"],
    },
    {
      id: "supabase",
      label: "Supabase CRM",
      color: "#10b981",
      position: { x: 980, y: 200 },
      inPorts: ["guardar"],
      outPorts: ["expediente", "metricas"],
    },
    {
      id: "agent",
      label: "Panel de agentes",
      color: "#6366f1",
      position: { x: 1220, y: 200 },
      inPorts: ["caso"],
      outPorts: ["respuesta"],
    },
    {
      id: "customer-done",
      label: "Cliente informado",
      color: "#f97316",
      position: { x: 1460, y: 200 },
      inPorts: ["mensaje"],
    },
    {
      id: "metrics",
      label: "Panel métricas",
      color: "#facc15",
      position: { x: 980, y: 420 },
      inPorts: ["evento"],
    },
  ],
  links: [
    {
      id: "contact-webhook",
      from: "contact",
      to: "webhook",
      label: "Mensaje entrante",
    },
    {
      id: "webhook-router",
      from: "webhook",
      to: "router",
      label: "Evento normalizado",
    },
    {
      id: "router-visa",
      from: "router",
      to: "visa-flow",
      label: "Requiere visa",
      fromPort: "visa",
    },
    {
      id: "router-flight",
      from: "router",
      to: "flight-flow",
      label: "Busca vuelo",
      fromPort: "vuelo",
    },
    {
      id: "visa-supabase",
      from: "visa-flow",
      to: "supabase",
      label: "Datos validados",
    },
    {
      id: "flight-supabase",
      from: "flight-flow",
      to: "supabase",
      label: "Solicitud completa",
    },
    {
      id: "router-supabase",
      from: "router",
      to: "supabase",
      label: "Actualiza CRM",
      fromPort: "crm",
    },
    {
      id: "supabase-agent",
      from: "supabase",
      to: "agent",
      label: "Caso asignado",
      fromPort: "expediente",
    },
    {
      id: "agent-customer",
      from: "agent",
      to: "customer-done",
      label: "Respuesta humana",
    },
    {
      id: "supabase-metrics",
      from: "supabase",
      to: "metrics",
      label: "Evento registrado",
      fromPort: "metricas",
    },
  ],
};

export async function getJourneyBlueprint(): Promise<DiagramBlueprint> {
  return journeyBlueprint;
}
