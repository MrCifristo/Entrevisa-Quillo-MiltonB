import { useEffect, useState } from 'react';
import { assignmentsApi, employeesApi, shiftsApi } from '../../api/client.js';
import { typeLabel, dayLabel, fmtTime } from '../../lib/shifts.js';
import ShiftCard from '../../components/ShiftCard.jsx';
import Button from '../../components/Button.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import ErrorBanner from '../../components/ErrorBanner.jsx';

function initials(name = '') {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export default function AssignmentsPage() {
  const [groups, setGroups] = useState([]); // por empleado, con sus turnos
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [error, setError] = useState(null);
  const [empId, setEmpId] = useState('');
  const [shiftId, setShiftId] = useState('');

  const loadGroups = () => assignmentsApi.list().then(setGroups);

  const loadAll = async () => {
    try {
      const [g, e, s] = await Promise.all([
        assignmentsApi.list(),
        employeesApi.list(),
        shiftsApi.list(),
      ]);
      setGroups(g);
      setEmployees(e);
      setShifts(s);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const assign = async (e) => {
    e.preventDefault();
    if (!empId || !shiftId) return;
    setError(null);
    try {
      await assignmentsApi.create(Number(empId), Number(shiftId));
      setShiftId('');
      await loadGroups();
    } catch (err) {
      // Aquí cae el 409 de solapamiento o asignación duplicada del backend.
      setError(err.message);
    }
  };

  const unassign = async (assignmentId) => {
    setError(null);
    try {
      await assignmentsApi.remove(assignmentId);
      await loadGroups();
    } catch (err) {
      setError(err.message);
    }
  };

  const totalAssigned = groups.reduce((n, g) => n + g.shifts.length, 0);

  return (
    <div>
      <PageHeader
        eyebrow="Quién trabaja cuándo"
        title="Asignaciones"
        count={totalAssigned}
        accent="bg-indigo-400"
      />

      <ErrorBanner message={error} onClose={() => setError(null)} />

      {/* Asignar turno */}
      <form
        onSubmit={assign}
        className="mb-9 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-card"
      >
        <div className="min-w-[200px] flex-1">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Empleado</label>
          <select
            value={empId}
            onChange={(e) => setEmpId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-ink transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-ring/50"
          >
            <option value="">Selecciona…</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.full_name}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[240px] flex-[2]">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Turno</label>
          <select
            value={shiftId}
            onChange={(e) => setShiftId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-ink transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-ring/50"
          >
            <option value="">Selecciona…</option>
            {shifts.map((s) => (
              <option key={s.id} value={s.id}>
                {dayLabel(s.day_of_week)} · {fmtTime(s.start_time)}–{fmtTime(s.end_time)} ·{' '}
                {typeLabel(s.type)} ({s.description})
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" size="lg" disabled={!empId || !shiftId}>
          Asignar turno
        </Button>
      </form>

      {/* Vista: por cada empleado, sus turnos */}
      <div className="space-y-7">
        {groups.map((g) => (
          <section key={g.employee_id}>
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">
                {initials(g.full_name)}
              </span>
              <div>
                <h2 className="font-semibold leading-tight text-ink">{g.full_name}</h2>
                <p className="text-xs text-slate-400">
                  {g.employee_number} ·{' '}
                  {g.shifts.length
                    ? `${g.shifts.length} turno${g.shifts.length > 1 ? 's' : ''}`
                    : 'sin turnos'}
                </p>
              </div>
            </div>
            {g.shifts.length ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {g.shifts.map((s) => (
                  <ShiftCard key={s.assignment_id} shift={s} onRemove={() => unassign(s.assignment_id)} />
                ))}
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-slate-300 bg-white/50 px-4 py-5 text-sm text-slate-400">
                Sin turnos asignados.
              </p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
