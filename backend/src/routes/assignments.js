import { Router } from 'express';
import { query } from '../db.js';
import { findOverlap } from '../overlap.js';

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Assignments
 *     description: Asignación de turnos a empleados y vista de asignaciones
 */

/**
 * @openapi
 * /api/assignments:
 *   get:
 *     tags: [Assignments]
 *     summary: Vista de asignaciones — por cada empleado, los turnos asignados
 *     responses:
 *       200:
 *         description: Empleados con sus turnos asignados
 */
router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT
        e.id   AS employee_id,
        e.full_name,
        e.employee_number,
        COALESCE(
          json_agg(
            json_build_object(
              'assignment_id', sa.id,
              'shift_id', s.id,
              'type', s.type,
              'description', s.description,
              'day_of_week', s.day_of_week,
              'start_time', s.start_time,
              'end_time', s.end_time,
              'is_workable', s.is_workable
            ) ORDER BY s.day_of_week, s.start_time
          ) FILTER (WHERE s.id IS NOT NULL),
          '[]'
        ) AS shifts
      FROM employees e
      LEFT JOIN shift_assignments sa ON sa.employee_id = e.id
      LEFT JOIN shifts s             ON s.id = sa.shift_id
      GROUP BY e.id
      ORDER BY e.full_name
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/assignments:
 *   post:
 *     tags: [Assignments]
 *     summary: Asigna un turno a un empleado (rechaza solapamientos)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/AssignmentInput' }
 *     responses:
 *       201:
 *         description: Asignación creada
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Empleado o turno inexistente
 *       409:
 *         description: Turno solapado o ya asignado
 */
router.post('/', async (req, res, next) => {
  try {
    const { employee_id, shift_id } = req.body || {};
    if (!employee_id || !shift_id)
      return res.status(400).json({ error: 'employee_id y shift_id son requeridos' });

    const { rows: shiftRows } = await query('SELECT * FROM shifts WHERE id = $1', [shift_id]);
    if (!shiftRows.length) return res.status(404).json({ error: 'Turno no encontrado' });
    const candidate = shiftRows[0];

    const { rows: empRows } = await query('SELECT id FROM employees WHERE id = $1', [employee_id]);
    if (!empRows.length) return res.status(404).json({ error: 'Empleado no encontrado' });

    // Turnos ya asignados al empleado, para validar solapamiento.
    const { rows: existing } = await query(
      `SELECT s.* FROM shifts s
       JOIN shift_assignments sa ON sa.shift_id = s.id
       WHERE sa.employee_id = $1`,
      [employee_id]
    );

    const clash = findOverlap(candidate, existing);
    if (clash) {
      return res.status(409).json({
        error: `El empleado ya tiene un turno solapado el ${clash.day_of_week} (${clash.start_time}-${clash.end_time})`,
      });
    }

    const { rows } = await query(
      `INSERT INTO shift_assignments (employee_id, shift_id)
       VALUES ($1, $2) RETURNING *`,
      [employee_id, shift_id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505')
      return res.status(409).json({ error: 'Ese turno ya está asignado a este empleado' });
    next(err);
  }
});

/**
 * @openapi
 * /api/assignments/{id}:
 *   delete:
 *     tags: [Assignments]
 *     summary: Quita una asignación
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Asignación eliminada
 *       404:
 *         description: No encontrada
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { rowCount } = await query('DELETE FROM shift_assignments WHERE id = $1', [
      req.params.id,
    ]);
    if (!rowCount) return res.status(404).json({ error: 'Asignación no encontrada' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
