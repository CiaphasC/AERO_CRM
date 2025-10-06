import { getCalendarContent } from "@/lib/data/content";

export const dynamic = "force-dynamic";

export default async function CalendarioPage() {
  const { events, monthTitle, modeLabel, summary, ctaLabel } = await getCalendarContent();
  const days = Array.from({ length: 31 }, (_, index) => index + 1);

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">Calendario y CRM</h1>
        <p className="max-w-3xl text-slate-300">
          Vista de productividad para agentes. Combina agenda, resumen de actividades y accesos rapidos al CRM de WhatsApp.
        </p>
      </header>
      <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-6 rounded-3xl border border-white/15 bg-white/5 p-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Resumen {monthTitle}</h2>
            <p className="mt-2 text-sm text-slate-300">{summary}</p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-slate-900/70 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Eventos</h3>
            <ul className="mt-3 space-y-3 text-sm text-slate-200">
              {events.map((event) => (
                <li key={event.title} className={`rounded-2xl border ${event.color} px-4 py-3`}>{event.title}</li>
              ))}
            </ul>
          </div>
        </aside>
        <div className="rounded-3xl border border-white/15 bg-white/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">{monthTitle}</h2>
              <p className="text-sm text-slate-300">{modeLabel}</p>
            </div>
            <button className="rounded-full border border-white/20 px-4 py-2 text-sm text-slate-200 hover:border-sky-400 hover:text-white">{ctaLabel}</button>
          </div>
          <div className="mt-6 grid grid-cols-7 gap-2 text-center text-sm text-slate-300">
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day) => (
              <div key={day} className="rounded-xl bg-slate-900/50 py-2 font-semibold text-slate-200">{day}</div>
            ))}
            {days.map((day) => {
              const event = events.find((item) => item.day === day);
              return (
                <div key={day} className="relative h-24 rounded-xl border border-white/10 bg-slate-900/40 p-2 text-slate-400">
                  <span className="text-xs font-semibold">{day}</span>
                  {event && (
                    <div className={`absolute inset-x-2 bottom-2 rounded-xl border px-2 py-1 text-xs font-semibold text-white ${event.color}`}>
                      {event.title}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
