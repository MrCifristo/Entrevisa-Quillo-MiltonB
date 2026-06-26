// Botón consistente y bien definido en toda la app.
// Variantes: primary (acción principal), secondary (acción neutra),
// danger (destructiva), ghost (terciaria/sutil).

const VARIANTS = {
  primary:
    'bg-brand text-white shadow-card hover:bg-brand-hover active:translate-y-px',
  secondary:
    'bg-white text-ink ring-1 ring-inset ring-slate-300 hover:ring-slate-400 hover:bg-slate-50',
  danger:
    'bg-white text-danger ring-1 ring-inset ring-red-200 hover:bg-danger-soft',
  ghost: 'text-slate-500 hover:bg-slate-100 hover:text-slate-700',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:pointer-events-none disabled:opacity-40 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    />
  );
}
