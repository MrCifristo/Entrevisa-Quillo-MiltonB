// ─────────────────────────────────────────────────────────────────────────────
// ÚNICO punto de comunicación con el backend.
//
// Mientras el backend está en desarrollo, toda la lógica de red vive aquí.
// Si cambia la forma de un endpoint, la URL base o se pasa a otra fuente de
// datos (mock, otro host, etc.), este archivo es el único que se modifica.
// Ninguna página/componente debe llamar a `fetch` directamente.
// ─────────────────────────────────────────────────────────────────────────────

const BASE = import.meta.env.VITE_API_URL;

if (!BASE) {
  throw new Error(
    'VITE_API_URL no está definida. Configúrala en Frontend/.env (ver README).'
  );
}

/**
 * Wrapper central sobre fetch.
 * - Serializa el body a JSON cuando existe.
 * - Devuelve `null` en respuestas 204 (sin contenido).
 * - Ante un error HTTP, lanza un Error con el mensaje que envía el backend
 *   (campo `error`), de modo que la UI pueda mostrarlo tal cual.
 */
async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message = (data && data.error) || `Error ${res.status}`;
    throw new Error(message);
  }

  return data;
}

export const employeesApi = {
  list: () => request('/api/employees'),
  get: (id) => request(`/api/employees/${id}`),
  create: (body) => request('/api/employees', { method: 'POST', body }),
  update: (id, body) => request(`/api/employees/${id}`, { method: 'PUT', body }),
  remove: (id) => request(`/api/employees/${id}`, { method: 'DELETE' }),
};

export const shiftsApi = {
  list: () => request('/api/shifts'),
  get: (id) => request(`/api/shifts/${id}`),
  create: (body) => request('/api/shifts', { method: 'POST', body }),
  update: (id, body) => request(`/api/shifts/${id}`, { method: 'PUT', body }),
  remove: (id) => request(`/api/shifts/${id}`, { method: 'DELETE' }),
};

export const assignmentsApi = {
  // Devuelve, por cada empleado, sus turnos asignados.
  list: () => request('/api/assignments'),
  create: (employee_id, shift_id) =>
    request('/api/assignments', { method: 'POST', body: { employee_id, shift_id } }),
  remove: (assignmentId) => request(`/api/assignments/${assignmentId}`, { method: 'DELETE' }),
};

// Exportado para los tests / casos puntuales.
export { request, BASE };
