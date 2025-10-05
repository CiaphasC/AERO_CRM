import { UmlDiagram } from "@/components/diagrams/uml-diagram";

export default function UmlPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">Diagrama de clases</h1>
        <p className="max-w-3xl text-slate-300">
          Modelo de entidades clave del CRM conversacional. Incluye cardinalidades entre usuarios, conversaciones, flujos, cotizaciones, agentes y mensajes.
        </p>
      </header>
      <UmlDiagram />
      <section className="rounded-2xl border border-white/15 bg-white/5 p-6 text-sm text-slate-200">
        <h2 className="text-lg font-semibold text-white">Lectura rapida</h2>
        <ul className="mt-3 space-y-2 list-disc list-inside">
          <li>Un usuario puede abrir multiples conversaciones y cotizaciones.</li>
          <li>Cada conversacion agrupa mensajes y puede activar varios flujos de n8n.</li>
          <li>Las cotizaciones quedan asociadas a un agente y al registro en Supabase.</li>
          <li>Mensajes distinguen remitente (usuario, bot o agente) para auditabilidad.</li>
        </ul>
      </section>
    </div>
  );
}
