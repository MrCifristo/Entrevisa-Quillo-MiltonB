# Frontend de Gestión de Turnos — Diseño

Fecha: 2026-06-26

## Objetivo

Construir un frontend en **React + Vite** (en lugar de Next.js, para agilizar) que
controle el CRUD de **empleados** y **turnos**, una vista de **asignaciones**, y dos
perfiles de usuario:

- **Admin**: agenda y modifica turnos, empleados y asignaciones.
- **Empleado**: vista de solo lectura de los turnos a los que está asignado.

No hay autenticación real: un **falso login** permite elegir el perfil.

## Contexto

El backend **ya existe** (Express + Postgres, en `Entrevista/backend/`) y corre en
`http://localhost:3000` con CORS habilitado. Endpoints:

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/employees` | Lista empleados |
| GET | `/api/employees/:id` | Empleado por id |
| POST | `/api/employees` | Crea (campos: `employee_number, full_name, email, phone, dpi`) |
| PUT | `/api/employees/:id` | Actualiza |
| DELETE | `/api/employees/:id` | Elimina (cascada) |
| GET | `/api/shifts` | Lista turnos |
| GET | `/api/shifts/:id` | Turno por id |
| POST | `/api/shifts` | Crea (campos: `type, description, is_workable, start_time, end_time, day_of_week`) |
| PUT | `/api/shifts/:id` | Actualiza |
| DELETE | `/api/shifts/:id` | Elimina (cascada) |
| GET | `/api/assignments` | Por cada empleado, sus turnos asignados |
| POST | `/api/assignments` | Asigna (`employee_id, shift_id`); **409** si solapa o ya existe |
| DELETE | `/api/assignments/:id` | Quita una asignación |

Enums: `type` ∈ {morning, afternoon, night}; `day_of_week` ∈ {Monday…Sunday}.

## Decisiones (acordadas con el usuario)

1. **Fuente de datos**: conectar al **backend real** en `localhost:3000`.
2. **Falso login**: selector "Entrar como Admin" + lista desplegable de empleados
   (poblada desde `GET /api/employees`).
3. **Estilos**: **Tailwind CSS**.
4. **Ubicación**: app aislada en `Entrevista/Frontend/`, con su propio `package.json`.
5. Lenguaje: **JavaScript** (JSX), sin TypeScript, para agilizar.

## Arquitectura

- **React 18 + Vite**, **react-router-dom** para rutas, **Tailwind** para estilos.
- Estado de sesión (rol + empleado activo) en **React Context** + `localStorage`.
- Estado de datos: local en cada página (fetch al montar, re-fetch tras mutaciones).
  Sin librería de estado global.

### Capa de API — un solo módulo

`src/api/client.js` concentra **todas** las llamadas al backend. Es el único archivo
que se toca si el backend cambia de forma o de URL.

- Base URL vía `import.meta.env.VITE_API_URL` (default `http://localhost:3000`).
- Helper `request(path, options)` central: serializa JSON, parsea respuesta, y ante
  error HTTP lanza un `Error` con el `message` tomado del campo `error` del backend
  (incluye el **409** de solapamiento/duplicado para mostrarlo legible).
- Exporta agrupado:
  - `employeesApi`: `list, get, create, update, remove`
  - `shiftsApi`: `list, get, create, update, remove`
  - `assignmentsApi`: `list, create, remove`

### Estructura de archivos

```
Frontend/
  index.html
  package.json
  vite.config.js
  tailwind.config.js
  postcss.config.js
  .env                      (VITE_API_URL=http://localhost:3000)
  src/
    main.jsx
    App.jsx                 (rutas + guard por rol)
    index.css               (directivas Tailwind)
    api/client.js           ← TODA la comunicación con el backend
    context/SessionContext.jsx
    components/
      Nav.jsx
      Modal.jsx
      DataTable.jsx
      Field.jsx
      ErrorBanner.jsx
      ShiftCard.jsx
    pages/
      LoginPage.jsx
      admin/EmployeesPage.jsx
      admin/ShiftsPage.jsx
      admin/AssignmentsPage.jsx
      employee/MyShiftsPage.jsx
```

## Vistas

### Login (`LoginPage`)
Dos caminos: botón "Entrar como Admin", o `<select>` de empleados (de
`employeesApi.list()`) + "Entrar como empleado". Guarda
`{ role: 'admin' | 'employee', employeeId }` en `SessionContext` + `localStorage`.
"Cambiar usuario" siempre disponible para volver al login.

### Admin (layout con navegación)
1. **Empleados** — tabla + modal de crear/editar/borrar.
2. **Turnos** — tabla + modal de crear/editar/borrar (selects para `type` y
   `day_of_week`, checkbox `is_workable`, inputs `time` para horas).
3. **Asignaciones** — consume `GET /api/assignments` (por empleado, sus turnos).
   Formulario asignar (empleado + turno → `POST`), mostrando el **409** de
   solapamiento como banner de error. Botón para quitar asignación.

### Empleado (`MyShiftsPage`, solo lectura)
Consume `GET /api/assignments`, filtra por el `employee_id` activo y muestra sus
turnos (día, horario, tipo, descripción) en tarjetas. Sin acciones de edición.

## Flujo de datos

Cada página llama directamente a `api/client.js`. Tras una mutación exitosa, re-fetch
de la lista afectada. Los errores se muestran inline (banner). El router aplica un
guard simple: si `role === 'employee'`, solo puede acceder a su vista; las rutas de
admin redirigen al login si no hay rol admin.

## Manejo de errores

- El backend ya valida solapamiento (409) y duplicados únicos (409/400); el frontend
  **solo los muestra**, no reimplementa esa lógica.
- `request()` normaliza el error para que cada página muestre el `message` del backend.

## Fuera de alcance (YAGNI)

- Auth real, despliegue, tests automatizados, paginación, búsqueda/filtros avanzados.
- Edición de turnos desde la vista de empleado.
- Persistencia de datos en el frontend más allá de la sesión en `localStorage`.
