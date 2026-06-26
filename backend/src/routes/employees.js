import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

const FIELDS = ['employee_number', 'full_name', 'email', 'phone', 'dpi'];

/**
 * @openapi
 * tags:
 *   - name: Employees
 *     description: CRUD de empleados
 */

/**
 * @openapi
 * /api/employees:
 *   get:
 *     tags: [Employees]
 *     summary: Lista todos los empleados
 *     responses:
 *       200:
 *         description: Lista de empleados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Employee' }
 */
router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM employees ORDER BY id');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/employees/{id}:
 *   get:
 *     tags: [Employees]
 *     summary: Obtiene un empleado por id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Empleado encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Employee' }
 *       404:
 *         description: No encontrado
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM employees WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Empleado no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/employees:
 *   post:
 *     tags: [Employees]
 *     summary: Crea un empleado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/EmployeeInput' }
 *     responses:
 *       201:
 *         description: Empleado creado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Employee' }
 *       400:
 *         description: Datos inválidos o duplicados
 */
router.post('/', async (req, res, next) => {
  try {
    const missing = FIELDS.filter((f) => !req.body?.[f]);
    if (missing.length)
      return res.status(400).json({ error: `Campos requeridos: ${missing.join(', ')}` });

    const values = FIELDS.map((f) => req.body[f]);
    const { rows } = await query(
      `INSERT INTO employees (${FIELDS.join(', ')})
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      values
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/employees/{id}:
 *   put:
 *     tags: [Employees]
 *     summary: Actualiza un empleado
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/EmployeeInput' }
 *     responses:
 *       200:
 *         description: Empleado actualizado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Employee' }
 *       404:
 *         description: No encontrado
 */
router.put('/:id', async (req, res, next) => {
  try {
    const missing = FIELDS.filter((f) => !req.body?.[f]);
    if (missing.length)
      return res.status(400).json({ error: `Campos requeridos: ${missing.join(', ')}` });

    const values = FIELDS.map((f) => req.body[f]);
    const setClause = FIELDS.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const { rows } = await query(
      `UPDATE employees SET ${setClause}, updated_at = now()
       WHERE id = $${FIELDS.length + 1} RETURNING *`,
      [...values, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Empleado no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/employees/{id}:
 *   delete:
 *     tags: [Employees]
 *     summary: Elimina un empleado (y sus asignaciones en cascada)
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
    const { rowCount } = await query('DELETE FROM employees WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Empleado no encontrado' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
