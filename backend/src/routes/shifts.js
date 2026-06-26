import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

const FIELDS = ['type', 'description', 'is_workable', 'start_time', 'end_time', 'day_of_week'];
const REQUIRED = ['type', 'description', 'start_time', 'end_time', 'day_of_week'];

/**
 * @openapi
 * tags:
 *   - name: Shifts
 *     description: CRUD de turnos
 */

/**
 * @openapi
 * /api/shifts:
 *   get:
 *     tags: [Shifts]
 *     summary: Lista todos los turnos
 *     responses:
 *       200:
 *         description: Lista de turnos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Shift' }
 */
router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM shifts ORDER BY id');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/shifts/{id}:
 *   get:
 *     tags: [Shifts]
 *     summary: Obtiene un turno por id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Turno encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Shift' }
 *       404:
 *         description: No encontrado
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM shifts WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Turno no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/shifts:
 *   post:
 *     tags: [Shifts]
 *     summary: Crea un turno
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ShiftInput' }
 *     responses:
 *       201:
 *         description: Turno creado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Shift' }
 *       400:
 *         description: Datos inválidos
 */
router.post('/', async (req, res, next) => {
  try {
    const missing = REQUIRED.filter((f) => req.body?.[f] === undefined || req.body?.[f] === '');
    if (missing.length)
      return res.status(400).json({ error: `Campos requeridos: ${missing.join(', ')}` });

    const values = [
      req.body.type,
      req.body.description,
      req.body.is_workable ?? true,
      req.body.start_time,
      req.body.end_time,
      req.body.day_of_week,
    ];
    const { rows } = await query(
      `INSERT INTO shifts (${FIELDS.join(', ')})
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      values
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/shifts/{id}:
 *   put:
 *     tags: [Shifts]
 *     summary: Actualiza un turno
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ShiftInput' }
 *     responses:
 *       200:
 *         description: Turno actualizado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Shift' }
 *       404:
 *         description: No encontrado
 */
router.put('/:id', async (req, res, next) => {
  try {
    const missing = REQUIRED.filter((f) => req.body?.[f] === undefined || req.body?.[f] === '');
    if (missing.length)
      return res.status(400).json({ error: `Campos requeridos: ${missing.join(', ')}` });

    const values = [
      req.body.type,
      req.body.description,
      req.body.is_workable ?? true,
      req.body.start_time,
      req.body.end_time,
      req.body.day_of_week,
    ];
    const setClause = FIELDS.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const { rows } = await query(
      `UPDATE shifts SET ${setClause}, updated_at = now()
       WHERE id = $${FIELDS.length + 1} RETURNING *`,
      [...values, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Turno no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/shifts/{id}:
 *   delete:
 *     tags: [Shifts]
 *     summary: Elimina un turno (y sus asignaciones en cascada)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Eliminado
 *       404:
 *         description: No encontrado
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { rowCount } = await query('DELETE FROM shifts WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Turno no encontrado' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
