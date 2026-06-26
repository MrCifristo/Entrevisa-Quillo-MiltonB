// Datos de ejemplo. Idempotente: limpia y recarga.
// Uso: npm run seed  (con la base levantada vía docker compose)
import { pool, query } from './db.js';

const employees = [
  ['EMP-001', 'Ana López', 'ana@empresa.com', '+502 5555-1111', '1234567890101'],
  ['EMP-002', 'Bruno Díaz', 'bruno@empresa.com', '+502 5555-2222', '2234567890101'],
  ['EMP-003', 'Carla Ruiz', 'carla@empresa.com', '+502 5555-3333', '3234567890101'],
];

const shifts = [
  ['morning', 'Front desk', true, '08:00', '16:00', 'Monday'],
  ['afternoon', 'Soporte', true, '14:00', '22:00', 'Monday'],
  ['night', 'Vigilancia', true, '22:00', '06:00', 'Monday'],
  ['morning', 'Front desk', true, '08:00', '16:00', 'Tuesday'],
];

async function seed() {
  try {
    await query('TRUNCATE shift_assignments, shifts, employees RESTART IDENTITY CASCADE');

    for (const e of employees) {
      await query(
        `INSERT INTO employees (employee_number, full_name, email, phone, dpi)
         VALUES ($1,$2,$3,$4,$5)`,
        e
      );
    }
    for (const s of shifts) {
      await query(
        `INSERT INTO shifts (type, description, is_workable, start_time, end_time, day_of_week)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        s
      );
    }

    // Asignaciones de ejemplo (sin solapamientos)
    await query('INSERT INTO shift_assignments (employee_id, shift_id) VALUES (1, 1)');
    await query('INSERT INTO shift_assignments (employee_id, shift_id) VALUES (1, 4)');
    await query('INSERT INTO shift_assignments (employee_id, shift_id) VALUES (2, 2)');
    await query('INSERT INTO shift_assignments (employee_id, shift_id) VALUES (3, 3)');

    console.log('Seed completado: 3 empleados, 4 turnos, 4 asignaciones.');
  } catch (err) {
    console.error('Error en seed:', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seed();
