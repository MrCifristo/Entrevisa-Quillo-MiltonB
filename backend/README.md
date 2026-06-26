# Backend — Gestión de Turnos

Node.js + Express + Postgres (en Docker). SQL relacional con `pg` (sin ORM). Swagger UI para probar.

## Requisitos
- Docker
- Node.js 18+

## Arranque

```bash
# 1. Levantar Postgres (crea el schema automáticamente)
docker compose up -d

# 2. Instalar dependencias
npm install

# 3. Cargar datos de ejemplo
npm run seed

# 4. Arrancar la API
npm start
```

- API:        http://localhost:3000
- Swagger UI:  http://localhost:3000/api-docs

## Endpoints

| Recurso | Métodos |
|---|---|
| `/api/employees` | GET, POST, GET/:id, PUT/:id, DELETE/:id |
| `/api/shifts` | GET, POST, GET/:id, PUT/:id, DELETE/:id |
| `/api/assignments` | GET (vista por empleado), POST, DELETE/:id |

## Notas de diseño

- **M:N relacional:** tabla intermedia `shift_assignments` con FKs y `UNIQUE (employee_id, shift_id)`.
- **Solapamientos (bonus):** validados en la capa de app (`src/overlap.js`). Antes de asignar se comparan los turnos del empleado en el mismo `day_of_week`; maneja cruce de medianoche. Devuelve `409` si hay choque.
- **Cascada:** borrar un empleado o turno elimina sus asignaciones (`ON DELETE CASCADE`).
- El schema (`src/schema.sql`) se monta en el contenedor y se ejecuta al inicializar la base.
