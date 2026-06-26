import { useEffect, useState } from 'react';
import { assignmentsApi } from '../../api/client.js';
import { useSession } from '../../context/SessionContext.jsx';
import ShiftCard from '../../components/ShiftCard.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import ErrorBanner from '../../components/ErrorBanner.jsx';

export default function MyShiftsPage() {
  const { session } = useSession();
  const [group, setGroup] = useState(null); // mi fila { full_name, shifts }
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    assignmentsApi
      .list()
      .then((groups) => {
        const mine = groups.find((g) => g.employee_id === session.employeeId);
        setGroup(mine || null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [session.employeeId]);

  const shifts = group?.shifts ?? [];

  return (
    <div>
      <PageHeader
        eyebrow={group ? group.full_name : 'Mi semana'}
        title="Mis turnos"
        count={loading ? undefined : shifts.length}
        accent="bg-amber-400"
      />

      <ErrorBanner message={error} onClose={() => setError(null)} />

      {loading ? (
        <p className="text-sm text-slate-400">Cargando…</p>
      ) : shifts.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shifts.map((s) => (
            <ShiftCard key={s.assignment_id} shift={s} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 py-16 text-center">
          <p className="text-sm font-medium text-slate-500">No tienes turnos asignados.</p>
          <p className="mt-1 text-sm text-slate-400">
            Cuando un administrador te asigne uno, aparecerá aquí.
          </p>
        </div>
      )}
    </div>
  );
}
