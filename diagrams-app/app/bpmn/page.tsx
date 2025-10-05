import { DiagramSurface } from "@/components/diagram-surface";
import { BpmnDiagram } from "@/components/diagrams/bpmn-diagram";
import { getBpmnContent } from "@/lib/data/content";

export default async function BpmnPage() {
  const { legend } = await getBpmnContent();

  return (
    <div className="space-y-14 xl:space-y-16">
      <header className="grid gap-8 rounded-[36px] border border-white/12 bg-white/[0.04] px-6 py-10 shadow-[0_42px_120px_-70px_rgba(9,20,45,0.75)] sm:px-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] xl:px-16">
        <div className="space-y-6 text-balance">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-sky-200">
            Mapa operativo
          </span>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold text-white md:text-5xl">BPMN simplificado</h1>
            <p className="max-w-3xl text-base text-slate-300 md:text-lg">
              Diagrama operativo de n8n y Next.js siguiendo la notacion BPMN. Incluye ramas para solicitudes de visa,
              subprocesos para cotizacion de vuelo y un carril paralelo que actualiza metricas en Supabase.
            </p>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-6 rounded-3xl border border-white/12 bg-white/[0.06] p-6 text-sm text-slate-200 shadow-[0_28px_90px_-60px_rgba(8,18,45,0.55)] sm:p-7">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">Insight de uso</p>
            <p className="text-base text-slate-200">
              El flujo mantiene bloqueos para preservar el layout y facilita entender la ruta de WhatsApp hacia agentes y
              automatizaciones sin perder contexto operacional.
            </p>
          </div>
          <ul className="grid gap-2 text-xs text-slate-400">
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-sky-400" />
              Nodos bloqueados resaltan el storytelling operativo.
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Conexiones anotadas evidencian responsables y sistemas.
            </li>
          </ul>
        </div>
      </header>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {legend.map((item) => (
          <article
            key={item.label}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-sm text-slate-200 shadow-[0_24px_80px_-60px_rgba(10,20,45,0.55)] transition hover:border-sky-400/40 hover:bg-white/[0.06]"
          >
            <h2 className="text-lg font-semibold text-white">{item.label}</h2>
            <p className="mt-2 text-slate-300">{item.detail}</p>
          </article>
        ))}
      </section>

      <section>
        <DiagramSurface>
          <BpmnDiagram />
        </DiagramSurface>
      </section>
    </div>
  );
}





