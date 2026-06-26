# Plataforma de Gestión de Turnos

Aplicación para **gestionar turnos de trabajo y asignarlos a empleados**, con una
relación muchos-a-muchos modelada de forma relacional (tabla intermedia real, no un
arreglo JSON de IDs).

El proyecto está compuesto por **dos aplicaciones independientes** que se ejecutan en
simultáneo:

| App | Carpeta | Stack | Puerto |
|---|---|---|---|
| **Backend** (API REST) | [`backend/`](./backend) | Node.js + Express + Postgres (Docker) | `3000` |
| **Frontend** (SPA) | [`Frontend/`](./Frontend) | React + Vite + Tailwind | `5173` |

> El frontend consume al backend por HTTP. **Ambos deben estar corriendo a la vez**
> para que la app funcione. Ver [Cómo correr el proyecto](#cómo-correr-el-proyecto).

---

## El problema

Se necesita una aplicación pequeña pero funcional para administrar turnos de trabajo y
repartirlos entre empleados. El núcleo del reto está en el **modelado de datos** y en
una **rebanada vertical limpia** (de la base de datos a la pantalla), no en la amplitud
de features.

Requisitos funcionales:

- Entidad **Turno** (`Shift`): `type`, `description`, `is_workable` (booleano),
  `start_time`, `end_time`, `day_of_week`.
- Entidad **Empleado** (`Employee`).
- Relación **muchos-a-muchos**: un turno puede ir a muchos empleados; un empleado puede
  tener muchos turnos — **modelada con una tabla intermedia relacional real**.
- UI CRUD para turnos.
- UI CRUD para empleados.
- Vista de asignaciones: quién está asignado a qué turnos.
- **Bonus:** evitar turnos solapados para el mismo empleado (mismo día + rango de horas
  que se cruza → rechazar).

Sin auth real, sin despliegue. Datos de ejemplo (seed) incluidos.

---

## Approach (decisiones de diseño)

| Decisión | Por qué |
|---|---|
| **Postgres relacional, sin ORM** | El reto pone el foco en el modelo de datos. SQL plano con el driver `pg` deja el esquema y las consultas explícitos y legibles, sin una capa de abstracción que oculte cómo se persiste. |
| **Tabla intermedia `shift_assignments`** | La M:N se modela con una tabla puente real (con FKs y constraint `UNIQUE`), no con un arreglo de IDs. Es lo que pide el reto y lo correcto relacionalmente. |
| **Solapamiento validado en la capa de aplicación** | La lógica de cruce de horarios (incluido el cruce de medianoche) vive en `backend/src/overlap.js`, no en la base. Mantiene el motor simple y la regla de negocio testeable y fácil de explicar. |
| **Frontend con un único cliente de API** | Toda la comunicación con el backend pasa por `Frontend/src/api/client.js`. Si cambia un endpoint, la URL base o la fuente de datos, se toca **un solo archivo**. Ninguna página llama a `fetch` directamente. |
| **"Login" simulado con dos roles** | No hay auth real (no se pedía). Un selector de perfil (Administrador / Empleado) guardado en `localStorage` permite mostrar dos vistas: el admin gestiona todo; el empleado ve solo sus turnos asignados. |
| **Manejo de errores centralizado** | El backend traduce violaciones de Postgres (duplicado, dato inválido) a códigos HTTP útiles (`409`, `400`) en un único middleware. El cliente del frontend propaga el mensaje del backend tal cual a la UI. |
| **Swagger UI** | La API se documenta y se puede probar en `/api-docs` sin herramientas externas. |
| **Postgres en Docker** | Levantar la base es un solo comando y el esquema (`schema.sql`) se aplica automáticamente al inicializar el contenedor — entorno reproducible. |

---

## Arquitectura

```
┌─────────────────────────────┐         HTTP / JSON          ┌──────────────────────────────┐
│   Frontend (React + Vite)   │  ───────────────────────────▶│   Backend (Express API)        │
│   http://localhost:5173     │   GET/POST/PUT/DELETE         │   http://localhost:3000        │
│                             │◀───────────────────────────  │                                │
│  pages/  (admin · empleado) │                              │  routes/ employees·shifts·     │
│  components/ (UI reusable)  │                              │          assignments           │
│  context/  (sesión/rol)     │                              │  overlap.js (regla solapamiento)│
│  api/client.js  ← único     │                              │  db.js (pool pg)               │
│         punto de red        │                              │  swagger.js (/api-docs)        │
└─────────────────────────────┘                              └───────────────┬────────────────┘
                                                                              │ SQL (driver pg)
                                                                              ▼
                                                              ┌──────────────────────────────┐
                                                              │   Postgres 16 (Docker)         │
                                                              │   employees · shifts ·         │
                                                              │   shift_assignments            │
                                                              └──────────────────────────────┘
```

### Backend — `backend/src/`

| Archivo | Rol |
|---|---|
| `index.js` | Bootstrap de Express: CORS, JSON, montaje de routers, Swagger, middleware de errores. |
| `db.js` | Pool de conexiones de `pg`. Lee `DATABASE_URL`. |
| `schema.sql` | Esquema relacional (tipos ENUM, tablas, índices, constraints). Se monta y ejecuta al inicializar el contenedor de Postgres. |
| `seed.js` | Datos de ejemplo idempotentes (`npm run seed`). |
| `overlap.js` | Detección de solapamiento de turnos (capa de aplicación, maneja cruce de medianoche). |
| `routes/employees.js` | CRUD de empleados. |
| `routes/shifts.js` | CRUD de turnos. |
| `routes/assignments.js` | Vista de asignaciones (por empleado), crear y quitar asignaciones (valida solapamiento). |
| `swagger.js` | Configuración de OpenAPI / Swagger UI. |

### Frontend — `Frontend/src/`

| Carpeta / archivo | Rol |
|---|---|
| `api/client.js` | **Único** punto de comunicación con el backend (wrapper sobre `fetch`). |
| `context/SessionContext.jsx` | Sesión simulada (rol + empleado) persistida en `localStorage`. |
| `App.jsx` | Enrutado según el rol: rutas de admin vs. ruta de empleado. |
| `pages/admin/` | `EmployeesPage`, `ShiftsPage`, `AssignmentsPage`. |
| `pages/employee/` | `MyShiftsPage` (solo lectura de los turnos del empleado). |
| `pages/LoginPage.jsx` | Selector de perfil (login simulado). |
| `components/` | UI reutilizable: `DataTable`, `Modal`, `Field`, `Button`, `ShiftCard`, `Nav`, etc. |
| `lib/shifts.js` | Helpers de presentación de turnos. |

---

## Modelado de datos

Tres tablas. La relación muchos-a-muchos se resuelve con la tabla intermedia
`shift_assignments`.

```
┌────────────────────┐         ┌────────────────────────┐         ┌────────────────────┐
│     employees      │         │   shift_assignments    │         │       shifts       │
├────────────────────┤         ├────────────────────────┤         ├────────────────────┤
│ id            PK   │◀───────┤ employee_id   FK        │┐        │ id            PK   │
│ employee_number U  │  1    N │ shift_id      FK        ││ N    1 │ type   (enum)      │
│ full_name          │         │ assigned_at            │├───────▶│ description        │
│ email          U   │         │ id            PK        ││        │ is_workable  bool  │
│ phone              │         │ UNIQUE(employee_id,     ││        │ start_time   time  │
│ dpi            U   │         │        shift_id)        ││        │ end_time     time  │
│ created_at         │         └────────────────────────┘│        │ day_of_week (enum) │
│ updated_at         │                                    │        │ created_at         │
└────────────────────┘                                    │        │ updated_at         │
                                                           │        └────────────────────┘
                  employees ↔ shifts  =  muchos-a-muchos ──┘  (vía shift_assignments)
```

### Tablas

| Tabla | Rol |
|---|---|
| `employees` | Entidad principal del empleado. |
| `shifts` | Plantilla semanal recurrente de turno. |
| `shift_assignments` | Tabla intermedia de la relación M:N. |

### ENUMs

| ENUM | Valores |
|---|---|
| `shift_type_enum` | `morning`, `afternoon`, `night` |
| `day_of_week_enum` | `Monday` … `Sunday` |

### Relaciones

- `employees` → `shift_assignments`: uno a muchos.
- `shifts` → `shift_assignments`: uno a muchos.
- `employees` ↔ `shifts`: **muchos a muchos** a través de `shift_assignments`.

### Constraints clave

| Constraint | Tabla | Descripción |
|---|---|---|
| `UNIQUE (employee_id, shift_id)` | `shift_assignments` | Evita asignar el mismo turno dos veces al mismo empleado. |
| `UNIQUE (employee_number)` | `employees` | Número de empleado irrepetible. |
| `UNIQUE (email)` | `employees` | Email irrepetible. |
| `UNIQUE (dpi)` | `employees` | DPI irrepetible. |
| `ON DELETE CASCADE` | `shift_assignments` | Al borrar un empleado o turno, sus asignaciones se eliminan automáticamente. |

### Validación de solapamiento (bonus)

Implementada en la capa de aplicación (`backend/src/overlap.js`), no en la DB. Antes de
insertar en `shift_assignments` la API:

1. Busca todos los turnos ya asignados al empleado en el mismo `day_of_week`.
2. Convierte cada rango horario a minutos desde medianoche.
3. Detecta el **cruce de medianoche** (cuando `end_time <= start_time`, desplaza el fin +24h).
4. Si dos rangos se cruzan (`aStart < bEnd && bStart < aEnd`), rechaza la asignación con
   **HTTP 409** y un mensaje explicativo.

> El esquema completo en formato DBML está en [`data-model.md`](./data-model.md)
> (copiable en [dbdiagram.io](https://dbdiagram.io) para ver el diagrama ER).

---

## Cómo correr el proyecto

> ⚠️ Son **dos aplicaciones independientes** que deben correr **en simultáneo**.
> Necesitarás **dos terminales abiertas** (una para el backend, otra para el frontend).
> El backend, además, requiere **Docker** para Postgres.

### Requisitos previos

- **Node.js 18+** y **npm**.
- **Docker** (para la base de datos Postgres).

---

### Terminal 1 — Backend (API + base de datos)

```bash
# Posicionarse en la carpeta del backend
cd backend

# 1) Levantar Postgres en Docker.
#    Crea el esquema automáticamente (monta schema.sql al inicializar).
docker compose up -d

# 2) Instalar dependencias de Node.
npm install

# 3) Cargar datos de ejemplo (3 empleados, 4 turnos, 4 asignaciones).
npm run seed

# 4) Arrancar la API.
npm start
```

Al terminar deberías ver:

```
API escuchando en http://localhost:3000
Swagger UI en      http://localhost:3000/api-docs
```

- API REST → **http://localhost:3000**
- Swagger UI (documentación interactiva) → **http://localhost:3000/api-docs**
- Healthcheck → **http://localhost:3000/health**

> **Deja esta terminal abierta.** Si la cierras, la API se detiene.
> Postgres seguirá corriendo en Docker hasta que ejecutes `docker compose down`.

---

### Terminal 2 — Frontend (interfaz web)

Abre una **segunda terminal** (sin cerrar la del backend):

```bash
# Posicionarse en la carpeta del frontend
cd Frontend

# 1) Instalar dependencias.
npm install

# 2) Arrancar el servidor de desarrollo de Vite.
npm run dev
```

Al terminar deberías ver la URL local de Vite:

```
➜  Local:   http://localhost:5173/
```

Abre **http://localhost:5173** en el navegador.

> La URL del backend que consume el frontend se configura en `Frontend/.env`:
> ```
> VITE_API_URL=http://localhost:3000
> ```
> El valor por defecto ya apunta al backend local; normalmente no hay que cambiarlo.

---

### Resumen de arranque

| Paso | Terminal | Carpeta | Comando |
|---|---|---|---|
| 1. Base de datos | 1 | `backend` | `docker compose up -d` |
| 2. Deps backend | 1 | `backend` | `npm install` |
| 3. Seed | 1 | `backend` | `npm run seed` |
| 4. API | 1 | `backend` | `npm start` |
| 5. Deps frontend | 2 | `Frontend` | `npm install` |
| 6. UI | 2 | `Frontend` | `npm run dev` |

---

## Uso de la aplicación

1. En el **login** (http://localhost:5173):
   - **Entrar como Administrador**, o
   - seleccionar un empleado y **Entrar como empleado**.
2. Como **administrador**:
   - **Empleados** → CRUD de empleados.
   - **Turnos** → CRUD de turnos.
   - **Asignaciones** → asignar turnos a empleados y ver quién tiene qué.
     Si un turno se solapa con otro del mismo empleado el mismo día, el backend
     responde `409` y la UI muestra el mensaje.
3. Como **empleado**: vista de solo lectura con tus turnos asignados.
4. **Cambiar usuario** (barra lateral inferior) regresa al login.

---

## API

Base URL: `http://localhost:3000`

| Recurso | Métodos |
|---|---|
| `/api/employees` | `GET`, `POST`, `GET /:id`, `PUT /:id`, `DELETE /:id` |
| `/api/shifts` | `GET`, `POST`, `GET /:id`, `PUT /:id`, `DELETE /:id` |
| `/api/assignments` | `GET` (vista por empleado), `POST`, `DELETE /:id` |

Ejemplo de turno (ancla del modelo):

```json
{
  "type": "morning",
  "description": "Front desk",
  "is_workable": true,
  "start_time": "08:00",
  "end_time": "16:00",
  "day_of_week": "Monday"
}
```

Códigos de respuesta relevantes:

| Código | Significado |
|---|---|
| `400` | Datos inválidos o faltan campos requeridos. |
| `404` | Recurso (empleado / turno / asignación) inexistente. |
| `409` | Valor duplicado, o turno solapado / ya asignado. |

Documentación interactiva completa en **http://localhost:3000/api-docs**.

---

## Tests

Frontend (cliente de API, con Vitest):

```bash
cd Frontend
npm test
```

---

## Comandos útiles

```bash
# Detener Postgres (mantiene los datos en el volumen)
cd backend && docker compose down

# Detener Postgres y BORRAR los datos
cd backend && docker compose down -v

# Recargar datos de ejemplo (limpia y reinserta)
cd backend && npm run seed

# Backend en modo watch (reinicia ante cambios)
cd backend && npm run dev
```
