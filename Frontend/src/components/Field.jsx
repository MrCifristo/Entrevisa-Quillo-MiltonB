// Campo de formulario genérico: label + input/select/checkbox.
// Si recibe `options`, renderiza un <select>; si type === 'checkbox', un checkbox.
export default function Field({ label, type = 'text', value, onChange, options, required, ...rest }) {
  const id = `field-${label}`;

  if (type === 'checkbox') {
    return (
      <label htmlFor={id} className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
        <input
          id={id}
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand-ring"
        />
        {label}
      </label>
    );
  }

  return (
    <div className="mb-3">
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {options ? (
        <select
          id={id}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-ink transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-ring/50"
        >
          <option value="" disabled>
            Selecciona…
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={type}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-ink transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-ring/50"
          {...rest}
        />
      )}
    </div>
  );
}
