import { TYPE_META, dayLabel, fmtTime } from '../lib/shifts.js';

// Tarjeta de turno con riel de color por tipo y horas en monoespaciada
// (como en un tablero de horarios). Si recibe `onRemove`, dibuja el botón.
export default function ShiftCard({ shift, onRemove }) {
  const meta = TYPE_META[shift.type] ?? {};

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card transition hover:shadow-pop">
      {/* Riel de color = tipo de turno */}
      <span className={`absolute inset-y-0 left-0 w-1.5 ${meta.rail ?? 'bg-slate-300'}`} aria-hidden />

      <div className="flex items-start justify-between gap-3 py-4 pl-5 pr-4">
        <div className="min-w-0">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${meta.badge ?? 'bg-slate-100 text-slate-600'}`}>
              {meta.label ?? shift.type}
            </span>
            {shift.is_workable === false && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                No laborable
              </span>
            )}
          </div>
          <p className="truncate font-semibold text-ink">{shift.description}</p>
          <p className="mt-0.5 text-sm text-slate-500">
            {dayLabel(shift.day_of_week)} ·{' '}
            <span className="tnum text-slate-600">
              {fmtTime(shift.start_time)}–{fmtTime(shift.end_time)}
            </span>
          </p>
        </div>

        {onRemove && (
          <button
            onClick={onRemove}
            className="shrink-0 rounded-md px-2 py-1 text-xs font-semibold text-slate-400 transition hover:bg-danger-soft hover:text-danger"
          >
            Quitar
          </button>
        )}
      </div>
    </div>
  );
}
