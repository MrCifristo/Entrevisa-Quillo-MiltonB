import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';

import { swaggerSpec } from './swagger.js';
import employeesRouter from './routes/employees.js';
import shiftsRouter from './routes/shifts.js';
import assignmentsRouter from './routes/assignments.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/employees', employeesRouter);
app.use('/api/shifts', shiftsRouter);
app.use('/api/assignments', assignmentsRouter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/', (_req, res) => res.redirect('/api-docs'));

// Manejador de errores centralizado.
// Traduce violaciones comunes de Postgres a códigos HTTP útiles.
app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.code === '23505') return res.status(409).json({ error: 'Valor duplicado (único)' });
  if (err.code === '22P02' || err.code === '23502')
    return res.status(400).json({ error: 'Datos inválidos para la operación' });
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
  console.log(`Swagger UI en      http://localhost:${PORT}/api-docs`);
});
