import { ArchitectureDiagram } from "@/components/diagrams/architecture-diagram";
import { getArchitectureContent } from "@/lib/data/content";

export default async function ArquitecturaPage() {
  const { layers } = await getArchitectureContent();

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">Diagrama de nodos</h1>
        <p className="max-w-3xl text-slate-300">
          Arquitectura de componentes principales para el CRM con WhatsApp. Los nodos se agrupan por capas y muestran el flujo de datos entre clientes, Next.js, n8n, Supabase y servicios externos.
        </p>
      </header>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {layers.map((layer) => (
          <div key={layer.name} className="rounded-2xl border border-white/15 bg-white/5 p-5 text-sm text-slate-200">
            <h2 className="text-lg font-semibold text-white">{layer.name}</h2>
            <p className="mt-2 text-slate-300">{layer.detail}</p>
          </div>
        ))}
      </section>
      <ArchitectureDiagram />
    </div>
  );
}
