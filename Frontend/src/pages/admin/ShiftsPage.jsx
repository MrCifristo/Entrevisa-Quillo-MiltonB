import { useEffect, useState } from 'react';
import { shiftsApi } from '../../api/client.js';
import { TYPE_OPTIONS, DAY_OPTIONS, TYPE_META, dayLabel, fmtTime } from '../../lib/shifts.js';
import DataTable from '../../components/DataTable.jsx';
import Modal from '../../components/Modal.jsx';
import Field from '../../components/Field.jsx';
import Button from '../../components/Button.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import ErrorBanner from '../../components/ErrorBanner.jsx';

const EMPTY = {
  type: '',
  description: '',
  is_workable: true,
  start_time: '',
  end_time: '',
  day_of_week: '',
};

const COLUMNS = [
  {
    key: 'type',
    header: 'Tipo',
    render: (s) => {
      const meta = TYPE_META[s.type] ?? {};
      return (
        <span className="inline-flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${meta.dot ?? 'bg-slate-300'}`} />
          {meta.label ?? s.type}
        </span>
      );
    },
  },
  { key: 'description', header: 'Descripción' },
  { key: 'day_of_week', header: 'Día', render: (s) => dayLabel(s.day_of_week) },
  {
    key: 'time',
    header: 'Horario',
    render: (s) => (
      <span className="tnum text-slate-600">
        {fmtTime(s.start_time)}–{fmtTime(s.end_time)}
      </span>
    ),
  },
  {
    key: 'is_workable',
    header: 'Laborable',
    render: (s) =>
      s.is_workable ? (
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
          Sí
        </span>
      ) : (
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
          No
        </span>
      ),
  },
];

export default function ShiftsPage() {
  const [shifts, setShifts] = useState([]);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const load = () => shiftsApi.list().then(setShifts).catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (s) => {
    setEditing(s.id);
    setForm({
      type: s.type,
      description: s.description,
      is_workable: s.is_workable,
      start_time: fmtTime(s.start_time),
      end_time: fmtTime(s.end_time),
      day_of_week: s.day_of_week,
    });
    setError(null);
    setModalOpen(true);
  };

  const setField = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editing) await shiftsApi.update(editing, form);
      else await shiftsApi.create(form);
      setModalOpen(false);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (s) => {
    if (!confirm(`¿Eliminar el turno "${s.description}"? También se borran sus asignaciones.`)) return;
    try {
      await shiftsApi.remove(s.id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Plantilla semanal"
        title="Turnos"
        count={shifts.length}
        accent="bg-sky-400"
        actions={<Button onClick={openCreate}>+ Nuevo turno</Button>}
      />

      <ErrorBanner message={error} onClose={() => setError(null)} />

      <DataTable
        columns={COLUMNS}
        rows={shifts}
        emptyMessage="Aún no hay turnos. Crea el primero."
        actions={(s) => (
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => openEdit(s)}>
              Editar
            </Button>
            <Button variant="danger" size="sm" onClick={() => remove(s)}>
              Borrar
            </Button>
          </div>
        )}
      />

      <Modal
        open={modalOpen}
        title={editing ? 'Editar turno' : 'Nuevo turno'}
        accent="bg-sky-400"
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={submit}>
          {error && <ErrorBanner message={error} onClose={() => setError(null)} />}
          <Field label="Tipo" value={form.type} onChange={setField('type')} options={TYPE_OPTIONS} required />
          <Field label="Descripción" value={form.description} onChange={setField('description')} required />
          <Field label="Día de la semana" value={form.day_of_week} onChange={setField('day_of_week')} options={DAY_OPTIONS} required />
          <div className="flex gap-3">
            <div className="flex-1">
              <Field label="Hora inicio" type="time" value={form.start_time} onChange={setField('start_time')} required />
            </div>
            <div className="flex-1">
              <Field label="Hora fin" type="time" value={form.end_time} onChange={setField('end_time')} required />
            </div>
          </div>
          <Field label="Es laborable" type="checkbox" value={form.is_workable} onChange={setField('is_workable')} />
          <div className="mt-5 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar turno</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
