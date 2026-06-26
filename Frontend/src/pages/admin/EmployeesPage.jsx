import { useEffect, useState } from 'react';
import { employeesApi } from '../../api/client.js';
import DataTable from '../../components/DataTable.jsx';
import Modal from '../../components/Modal.jsx';
import Field from '../../components/Field.jsx';
import Button from '../../components/Button.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import ErrorBanner from '../../components/ErrorBanner.jsx';

const EMPTY = { employee_number: '', full_name: '', email: '', phone: '', dpi: '' };

const COLUMNS = [
  { key: 'employee_number', header: 'N.º' },
  { key: 'full_name', header: 'Nombre' },
  { key: 'email', header: 'Email' },
  { key: 'phone', header: 'Teléfono' },
  { key: 'dpi', header: 'DPI' },
];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // id en edición, o null al crear
  const [form, setForm] = useState(EMPTY);

  const load = () => employeesApi.list().then(setEmployees).catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (emp) => {
    setEditing(emp.id);
    setForm({
      employee_number: emp.employee_number,
      full_name: emp.full_name,
      email: emp.email,
      phone: emp.phone,
      dpi: emp.dpi,
    });
    setError(null);
    setModalOpen(true);
  };

  const setField = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editing) await employeesApi.update(editing, form);
      else await employeesApi.create(form);
      setModalOpen(false);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (emp) => {
    if (!confirm(`¿Eliminar a ${emp.full_name}? También se borran sus asignaciones.`)) return;
    try {
      await employeesApi.remove(emp.id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Personas"
        title="Empleados"
        count={employees.length}
        actions={<Button onClick={openCreate}>+ Nuevo empleado</Button>}
      />

      <ErrorBanner message={error} onClose={() => setError(null)} />

      <DataTable
        columns={COLUMNS}
        rows={employees}
        emptyMessage="Aún no hay empleados. Crea el primero."
        actions={(emp) => (
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => openEdit(emp)}>
              Editar
            </Button>
            <Button variant="danger" size="sm" onClick={() => remove(emp)}>
              Borrar
            </Button>
          </div>
        )}
      />

      <Modal
        open={modalOpen}
        title={editing ? 'Editar empleado' : 'Nuevo empleado'}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={submit}>
          {error && <ErrorBanner message={error} onClose={() => setError(null)} />}
          <Field label="Número de empleado" value={form.employee_number} onChange={setField('employee_number')} required />
          <Field label="Nombre completo" value={form.full_name} onChange={setField('full_name')} required />
          <Field label="Email" type="email" value={form.email} onChange={setField('email')} required />
          <Field label="Teléfono" value={form.phone} onChange={setField('phone')} required />
          <Field label="DPI" value={form.dpi} onChange={setField('dpi')} required />
          <div className="mt-5 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar empleado</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
