// Lógica de detección de solapamiento de turnos para un mismo empleado.
// Vive en la capa de aplicación (no en la DB) para mantener el motor simple.

// Convierte "HH:MM" o "HH:MM:SS" a minutos desde medianoche.
const toMinutes = (time) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

// Devuelve [inicio, fin] en minutos. Si el turno cruza medianoche
// (end <= start) se desplaza el fin +24h para comparar en una línea continua.
const toRange = (start, end) => {
  const s = toMinutes(start);
  let e = toMinutes(end);
  if (e <= s) e += 24 * 60;
  return [s, e];
};

// Dos rangos [aStart, aEnd) y [bStart, bEnd) se solapan si
// aStart < bEnd && bStart < aEnd.
export const rangesOverlap = (aStart, aEnd, bStart, bEnd) => {
  const [a1, a2] = toRange(aStart, aEnd);
  const [b1, b2] = toRange(bStart, bEnd);
  return a1 < b2 && b1 < a2;
};

// Recibe el turno candidato y la lista de turnos ya asignados al empleado.
// Devuelve el primer turno (del mismo día) que se solape, o null.
export const findOverlap = (candidate, existingShifts) => {
  for (const shift of existingShifts) {
    if (shift.day_of_week !== candidate.day_of_week) continue;
    if (rangesOverlap(candidate.start_time, candidate.end_time, shift.start_time, shift.end_time)) {
      return shift;
    }
  }
  return null;
};
