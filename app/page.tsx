import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  GitBranch,
  Network,
  Route,
  Share2,
  Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getHomeContent, type IconName } from "@/lib/data/content";

const iconMap: Record<IconName, LucideIcon> = {
  route: Route,
  workflow: Workflow,
  network: Network,
  share2: Share2,
  gitBranch: GitBranch,
  calendarCheck: CalendarCheck,
};

export default async function Home() {
  const { diagramLinks, sections, highlights } = await getHomeContent();

  return (
    <div className="space-y-16">
      <section className="grid gap-10 rounded-[32px] border border-white/10 bg-[#05070f]/95 px-8 py-12 shadow-[0_24px_80px_-40px_rgba(8,12,21,0.9)] backdrop-blur lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:px-12 lg:py-14">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#0b1320] px-4 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-slate-200">
            WhatsApp Business Platform
          </span>
          <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
            CRM conversacional para agencias de viaje con bots y asesores humanos.
          </h1>
          <p className="text-base text-slate-300 sm:text-lg">
            Documentacion visual de Airbridge Labs: captura por WhatsApp, clasificacion en n8n, persistencia en Supabase y atencion en una interfaz Next.js. Cada diagrama explica decisiones tecnicas listas para produccion.
          </p>
          <div className="flex flex-wrap gap-2 pt-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
            {highlights.map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/10 bg-[#080c15] px-3 py-1 text-[11px] text-slate-200"
              >
                {item}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 pt-4">
            {diagramLinks.map((link) => {
              const Icon = iconMap[link.icon];
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#080d17] px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-sky-400/40 hover:text-white"
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="grid gap-4 rounded-3xl border border-white/8 bg-[#080d17]/90 p-6 text-sm text-slate-300">
          <h2 className="text-lg font-semibold text-white">Lo que veras en cada diagrama</h2>
          <ul className="grid gap-3">
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-sky-400" />
              <div>
                <p className="font-medium text-white">Captura y clasificacion</p>
                <p className="text-slate-400">
                  Webhooks oficiales de WhatsApp, bots en Next.js y workflows de n8n para decidir entre visa o vuelo.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <div>
                <p className="font-medium text-white">Persistencia y metricas</p>
                <p className="text-slate-400">
                  Esquema de Supabase para contactos, cotizaciones, metricas de tiempos y control de agentes disponibles.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-indigo-400" />
              <div>
                <p className="font-medium text-white">Experiencia del agente</p>
                <p className="text-slate-400">
                  Interfaces React con actualizaciones en tiempo real, agendas y entregables listos para responder al viajero.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {sections.map((section) => {
          const Icon = iconMap[section.icon];
          return (
            <Link
              key={section.href}
              href={section.href}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#070b13]/95 p-6 transition hover:border-sky-400/35 hover:shadow-[0_20px_60px_-35px_rgba(56,189,248,0.4)]"
            >
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${section.accent}`} />
              <div className="relative flex h-full flex-col gap-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-[#0c121e]">
                    <Icon className="h-5 w-5 text-white" aria-hidden />
                  </span>
                  <ArrowRight className="ml-auto h-5 w-5 text-slate-300 transition group-hover:translate-x-1" aria-hidden />
                </div>
                <h2 className="text-xl font-semibold text-white">{section.title}</h2>
                <p className="text-sm text-slate-300">{section.description}</p>
              </div>
            </Link>
          );
        })}
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#070b13]/90 p-8 text-sm text-slate-300">
        <h3 className="text-lg font-semibold text-white">Politicas y precios actuales</h3>
        <p className="mt-3 text-slate-400">
          Meta diferencia conversaciones iniciadas por la empresa o por el usuario. Las respuestas proactivas usan plantillas aprobadas y WhatsApp Flows garantiza formularios seguros dentro del chat. Supabase concentra contactos, adjuntos y metricas de cada caso, mientras n8n gobierna reglas, webhooks y notificaciones para asignar agentes disponibles.
        </p>
      </section>
    </div>
  );
}


