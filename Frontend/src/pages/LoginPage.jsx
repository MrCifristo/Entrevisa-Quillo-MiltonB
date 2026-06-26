import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeesApi } from '../api/client.js';
import { useSession } from '../context/SessionContext.jsx';
import Button from '../components/Button.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';

export default function LoginPage() {
  const { loginAsAdmin, loginAsEmployee } = useSession();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    employeesApi
      .list()
      .then(setEmployees)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const enterAsAdmin = () => {
    loginAsAdmin();
    navigate('/admin/empleados');
  };

  const enterAsEmployee = () => {
    if (!selectedId) return;
    loginAsEmployee(Number(selectedId));
    navigate('/mis-turnos');
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink p-4">
      {/* Atmósfera: resplandores suaves de la tríada de turnos sobre el fondo oscuro. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute right-10 top-1/3 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-pop">
        {/* Filete tricolor = firma del producto */}
        <div className="flex h-1.5 w-full" aria-hidden>
          <span className="flex-1 bg-amber-400" />
          <span className="flex-1 bg-sky-400" />
          <span className="flex-1 bg-indigo-400" />
        </div>

        <div className="p-8">
          <div className="mb-1.5 flex items-center gap-1.5" aria-hidden>
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span className="h-2 w-2 rounded-full bg-sky-400" />
            <span className="h-2 w-2 rounded-full bg-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-ink">Gestión de Turnos</h1>
          <p className="mb-6 mt-1 text-sm text-slate-500">
            Elige cómo entrar. Es un acceso simulado, sin contraseña.
          </p>

          <ErrorBanner message={error} onClose={() => setError(null)} />

          <Button onClick={enterAsAdmin} size="lg" className="mb-6 w-full">
            Entrar como administrador
          </Button>

          <div className="mb-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">o</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Entrar como empleado
          </label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            disabled={loading || !employees.length}
            className="mb-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-ink transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-ring/50 disabled:bg-slate-50"
          >
            <option value="">
              {loading
                ? 'Cargando empleados…'
                : employees.length
                  ? 'Selecciona un empleado…'
                  : 'No hay empleados'}
            </option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.full_name} ({e.employee_number})
              </option>
            ))}
          </select>

          <Button
            onClick={enterAsEmployee}
            variant="secondary"
            size="lg"
            disabled={!selectedId}
            className="w-full"
          >
            Ver mis turnos
          </Button>
        </div>
      </div>
    </div>
  );
}
