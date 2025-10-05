export type IconName =
  | "route"
  | "workflow"
  | "network"
  | "share2"
  | "gitBranch"
  | "calendarCheck";

export interface DiagramLinkItem {
  href: string;
  label: string;
  icon: IconName;
}

export interface HighlightSection {
  title: string;
  description: string;
  href: string;
  icon: IconName;
  accent: string;
}

export interface HomeContent {
  diagramLinks: DiagramLinkItem[];
  highlights: string[];
  sections: HighlightSection[];
}

export interface ArchitectureLayer {
  name: string;
  detail: string;
}

export interface ArchitectureContent {
  layers: ArchitectureLayer[];
}

export interface BpmnLegendItem {
  label: string;
  detail: string;
}

export interface BpmnContent {
  legend: BpmnLegendItem[];
}

export interface JourneyPhase {
  title: string;
  description: string;
  color: string;
}

export interface JourneyContent {
  phases: JourneyPhase[];
}

export interface CalendarEvent {
  title: string;
  day: number;
  color: string;
}

export interface CalendarContent {
  events: CalendarEvent[];
  monthTitle: string;
  modeLabel: string;
  summary: string;
  ctaLabel: string;
}

export interface ContentEnvelope<T> {
  slug: string;
  data: T;
}

const homeContent: HomeContent = {
  diagramLinks: [
    { href: "/journey", label: "Journey conversacional", icon: "route" },
    { href: "/bpmn", label: "Mapa BPMN", icon: "workflow" },
    { href: "/arquitectura", label: "Arquitectura técnica", icon: "network" },
    { href: "/uml", label: "Modelo de clases", icon: "share2" },
    { href: "/secuencia", label: "Secuencia tiempo real", icon: "gitBranch" },
    { href: "/calendario", label: "Agenda de agentes", icon: "calendarCheck" },
  ],
  highlights: [
    "Bots Next.js",
    "Flows Meta",
    "Orquestación n8n",
    "Persistencia Supabase",
    "Dashboards métricos",
    "Atención humana",
  ],
  sections: [
    {
      title: "Journey conversacional",
      description:
        "Secuencia de contacto desde el primer mensaje hasta la respuesta del agente, destacando a cada plataforma involucrada.",
      href: "/journey",
      icon: "route",
      accent: "from-sky-500/10 via-transparent to-transparent",
    },
    {
      title: "Mapa operativo BPMN",
      description:
        "Tareas automatizadas y manuales que conforman el flujo entre WhatsApp, n8n y Supabase con ramificaciones claras.",
      href: "/bpmn",
      icon: "workflow",
      accent: "from-indigo-500/10 via-transparent to-transparent",
    },
    {
      title: "Arquitectura de nodos",
      description:
        "Componentes esenciales del stack con conexiones bloqueadas para comprender el paso de datos entre servicios.",
      href: "/arquitectura",
      icon: "network",
      accent: "from-cyan-500/10 via-transparent to-transparent",
    },
    {
      title: "Modelo de clases",
      description:
        "Relaciones entre usuarios, conversaciones, flujos y cotizaciones para respaldar la automatización en producción.",
      href: "/uml",
      icon: "share2",
      accent: "from-emerald-500/10 via-transparent to-transparent",
    },
    {
      title: "Secuencia de mensajes",
      description:
        "Intercambios ordenados en el tiempo entre WhatsApp, el bot, n8n y el agente humano para auditar interacciones.",
      href: "/secuencia",
      icon: "gitBranch",
      accent: "from-amber-500/10 via-transparent to-transparent",
    },
    {
      title: "Agenda y productividad",
      description:
        "Resumen mensual con eventos clave y accesos rápidos para coordinar el seguimiento de los casos en el CRM.",
      href: "/calendario",
      icon: "calendarCheck",
      accent: "from-rose-500/10 via-transparent to-transparent",
    },
  ],
};

const architectureContent: ArchitectureContent = {
  layers: [
    {
      name: "Canal de entrada",
      detail: "WhatsApp Business y plantillas oficiales activan el viaje conversacional del viajero.",
    },
    {
      name: "Gateway web",
      detail: "Next.js recibe webhooks, limpia datos y coordina con el orquestador de automatizaciones.",
    },
    {
      name: "Orquestación",
      detail: "n8n enruta casos entre flows, bases de datos y agentes disponibles con reglas dinámicas.",
    },
    {
      name: "Persistencia",
      detail: "Supabase almacena clientes, cotizaciones y métricas con funciones para reportes.",
    },
    {
      name: "Experiencia del agente",
      detail: "Panel en React que muestra agenda, historial de mensajes y atajos para plantillas.",
    },
    {
      name: "Analítica",
      detail: "Dashboards consolidan SLAs, conversiones y productividad por agente.",
    },
  ],
};

const bpmnContent: BpmnContent = {
  legend: [
    {
      label: "Entrada",
      detail: "Eventos que nacen del webhook de WhatsApp y disparan la automatización.",
    },
    {
      label: "Tareas automáticas",
      detail: "Pasos ejecutados por n8n para consultar datos, decidir ramas y notificar.",
    },
    {
      label: "Subprocesos",
      detail: "WhatsApp Flows y n8n encapsulan formularios para recolectar datos confiables.",
    },
    {
      label: "Intervención humana",
      detail: "Asignación del caso al agente cuando se requiere respuesta personalizada.",
    },
  ],
};

const journeyContent: JourneyContent = {
  phases: [
    {
      title: "Descubrimiento",
      description: "El viajero inicia chat y recibe respuestas automáticas con opciones guiadas.",
      color: "border-sky-400/30",
    },
    {
      title: "Calificación",
      description: "Flows y n8n recopilan los datos necesarios para clasificar la solicitud.",
      color: "border-emerald-400/30",
    },
    {
      title: "Producción",
      description: "Supabase y el panel del agente generan cotizaciones listas para enviar.",
      color: "border-indigo-400/30",
    },
    {
      title: "Seguimiento",
      description: "El equipo monitorea métricas y agenda para asegurar tiempos de respuesta.",
      color: "border-amber-400/30",
    },
  ],
};

const calendarContent: CalendarContent = {
  events: [
    { title: "Reunión con aerolínea", day: 3, color: "border-sky-400/50 bg-sky-500/15" },
    { title: "Entrega cotizaciones grupales", day: 9, color: "border-emerald-400/40 bg-emerald-500/15" },
    { title: "Capacitación agentes", day: 17, color: "border-indigo-400/40 bg-indigo-500/15" },
    { title: "Cierre KPI mensual", day: 28, color: "border-amber-400/40 bg-amber-500/15" },
  ],
  monthTitle: "Octubre 2024",
  modeLabel: "Modo colaborativo",
  summary:
    "Consolida hitos comerciales, capacitaciones y entregables críticos para coordinar la atención en WhatsApp.",
  ctaLabel: "Crear nuevo evento",
};

const contentLoaders = {
  home: async () => homeContent,
  journey: async () => journeyContent,
  bpmn: async () => bpmnContent,
  arquitectura: async () => architectureContent,
  calendario: async () => calendarContent,
};

export async function getHomeContent(): Promise<HomeContent> {
  return contentLoaders.home();
}

export async function getArchitectureContent(): Promise<ArchitectureContent> {
  return contentLoaders.arquitectura();
}

export async function getBpmnContent(): Promise<BpmnContent> {
  return contentLoaders.bpmn();
}

export async function getJourneyContent(): Promise<JourneyContent> {
  return contentLoaders.journey();
}

export async function getCalendarContent(): Promise<CalendarContent> {
  return contentLoaders.calendario();
}

export type ContentSlug = keyof typeof contentLoaders;

export function isContentSlug(value: string): value is ContentSlug {
  return Object.prototype.hasOwnProperty.call(contentLoaders, value);
}

export const availableContentSlugs = Object.keys(contentLoaders) as ContentSlug[];

export async function getContentBySlug(slug: string) {
  if (!isContentSlug(slug)) {
    return null;
  }
  const loader = contentLoaders[slug];
  const data = await loader();
  return { slug, data } as ContentEnvelope<Awaited<ReturnType<typeof loader>>>;
}
