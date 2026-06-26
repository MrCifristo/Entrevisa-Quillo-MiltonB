import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { employeesApi, shiftsApi, assignmentsApi, BASE } from './client.js';

function mockFetch(status, body) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(body === undefined ? '' : JSON.stringify(body)),
  });
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('request (vía employeesApi)', () => {
  it('parsea y devuelve JSON en respuestas 200', async () => {
    vi.stubGlobal('fetch', mockFetch(200, [{ id: 1, full_name: 'Ada' }]));
    const data = await employeesApi.list();
    expect(data).toEqual([{ id: 1, full_name: 'Ada' }]);
  });

  it('hace GET a la ruta correcta', async () => {
    const f = mockFetch(200, []);
    vi.stubGlobal('fetch', f);
    await employeesApi.list();
    expect(f).toHaveBeenCalledWith(
      `${BASE}/api/employees`,
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('create envía POST con JSON', async () => {
    const f = mockFetch(201, { id: 9 });
    vi.stubGlobal('fetch', f);
    await employeesApi.create({ full_name: 'Grace' });
    expect(f).toHaveBeenCalledWith(
      `${BASE}/api/employees`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ full_name: 'Grace' }),
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });

  it('devuelve null en respuestas 204', async () => {
    vi.stubGlobal('fetch', mockFetch(204));
    const data = await employeesApi.remove(1);
    expect(data).toBeNull();
  });

  it('lanza Error con el mensaje del backend en errores HTTP', async () => {
    vi.stubGlobal('fetch', mockFetch(409, { error: 'Turno solapado' }));
    await expect(assignmentsApi.create(1, 2)).rejects.toThrow('Turno solapado');
  });

  it('shiftsApi.update hace PUT a la ruta con id', async () => {
    const f = mockFetch(200, { id: 3 });
    vi.stubGlobal('fetch', f);
    await shiftsApi.update(3, { description: 'x' });
    expect(f).toHaveBeenCalledWith(
      `${BASE}/api/shifts/3`,
      expect.objectContaining({ method: 'PUT' })
    );
  });
});
