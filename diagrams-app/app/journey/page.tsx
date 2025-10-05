import { JourneyDiagram } from "@/components/diagrams/journey-diagram";
import { getJourneyContent } from "@/lib/data/content";
import { getJourneyBlueprint } from "@/lib/data/journey";

export default async function JourneyPage() {
  const [content, blueprint] = await Promise.all([
    getJourneyContent(),
    getJourneyBlueprint(),
  ]);

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">Journey del usuario</h1>
        <p className="max-w-3xl text-slate-300">
          Flujo conversacional completo desde el primer mensaje hasta el cierre del caso. Cada nodo destaca la tecnologia principal que interviene y mantiene visibles las plataformas clave: WhatsApp, Next.js, n8n y Supabase.
        </p>
      </header>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {content.phases.map((phase) => (
          <div key={phase.title} className={`rounded-2xl border bg-white/5 p-5 text-sm text-slate-200 ${phase.color}`}>
            <h2 className="text-lg font-semibold text-white">{phase.title}</h2>
            <p className="mt-2 text-slate-200/80">{phase.description}</p>
          </div>
        ))}
      </section>
      <JourneyDiagram blueprint={blueprint} />
    </div>
  );
}
