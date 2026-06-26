// Encabezado de página: eyebrow con marcador de color (separador de dominio),
// título display y un contador opcional. Las acciones van a la derecha.
export default function PageHeader({ eyebrow, title, count, accent = 'bg-brand', actions }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
      <div>
        {eyebrow && (
          <p className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            <span className={`inline-block h-2.5 w-2.5 rounded-sm ${accent}`} />
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-ink">
          {title}
          {typeof count === 'number' && (
            <span className="ml-2.5 align-middle text-lg font-medium text-slate-400 tnum">
              {count}
            </span>
          )}
        </h1>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
