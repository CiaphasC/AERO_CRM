import { SequenceDiagram } from "@/components/diagrams/sequence-diagram";

export default function SecuenciaPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">Diagrama de secuencia</h1>
        <p className="max-w-3xl text-slate-300">
          Interaccion temporal entre el usuario, WhatsApp API, Next.js, n8n, Supabase, el agente humano y el GDS. Los mensajes marcados incluyen la ruta HTTP o accion relevante.
        </p>
      </header>
      <SequenceDiagram />
      <div className="rounded-2xl border border-white/15 bg-white/5 p-6 text-sm text-slate-200">
        <p>
          Flechas horizontales indican llamadas sincrónicas; eventos que van hacia n8n y regresan con plantillas o flows se marcan como asincronicos mediante etiquetas textuales.
        </p>
      </div>
    </div>
  );
}
