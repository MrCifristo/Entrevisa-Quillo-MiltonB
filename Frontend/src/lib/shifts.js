// Metadatos de dominio compartidos: tipos de turno y días.
// Centralizar aquí evita repetir etiquetas/colores en cada página y mantiene
// coherente la identidad visual (la tríada matutino/vespertino/nocturno).

export const TYPE_META = {
  morning: {
    label: 'Matutino',
    badge: 'bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-200',
    rail: 'bg-amber-400',
    dot: 'bg-amber-400',
  },
  afternoon: {
    label: 'Vespertino',
    badge: 'bg-sky-100 text-sky-800 ring-1 ring-inset ring-sky-200',
    rail: 'bg-sky-400',
    dot: 'bg-sky-400',
  },
  night: {
    label: 'Nocturno',
    badge: 'bg-indigo-100 text-indigo-800 ring-1 ring-inset ring-indigo-200',
    rail: 'bg-indigo-400',
    dot: 'bg-indigo-400',
  },
};

export const TYPE_OPTIONS = Object.entries(TYPE_META).map(([value, m]) => ({
  value,
  label: m.label,
}));

export const DAY_META = {
  Monday: { label: 'Lunes', short: 'Lun' },
  Tuesday: { label: 'Martes', short: 'Mar' },
  Wednesday: { label: 'Miércoles', short: 'Mié' },
  Thursday: { label: 'Jueves', short: 'Jue' },
  Friday: { label: 'Viernes', short: 'Vie' },
  Saturday: { label: 'Sábado', short: 'Sáb' },
  Sunday: { label: 'Domingo', short: 'Dom' },
};

export const DAY_OPTIONS = Object.entries(DAY_META).map(([value, m]) => ({
  value,
  label: m.label,
}));

export const typeLabel = (t) => TYPE_META[t]?.label ?? t;
export const dayLabel = (d) => DAY_META[d]?.label ?? d;
export const fmtTime = (t) => String(t ?? '').slice(0, 5);
