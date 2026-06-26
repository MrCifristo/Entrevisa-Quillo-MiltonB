# Frontend de Gestión de Turnos — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir un frontend React + Vite que controle el CRUD de empleados y turnos, gestione asignaciones (con manejo del 409 de solapamiento) y ofrezca vistas separadas de Admin y Empleado vía un falso login.

**Architecture:** App React + Vite aislada en `Entrevista/Frontend/`. Toda la comunicación con el backend Express (`localhost:3000`) se concentra en un único módulo `src/api/client.js`. La sesión (rol + empleado) vive en React Context + localStorage. Cada página hace fetch directo y re-fetch tras mutaciones.

**Tech Stack:** React 18, Vite, react-router-dom, Tailwind CSS, Vitest (para el cliente de API).

## Global Constraints

- App autocontenida en `Entrevista/Frontend/` con su propio `package.json`. No tocar `backend/`.
- Lenguaje: JavaScript (JSX), no TypeScript.
- Base URL del backend vía `import.meta.env.VITE_API_URL`, default `http://localhost:3000`.
- Toda llamada HTTP pasa por `src/api/client.js`. Ninguna página hace `fetch` directo.
- Campos empleado: `employee_number, full_name, email, phone, dpi`.
- Campos turno: `type` (morning|afternoon|night), `description`, `is_workable` (bool), `start_time`, `end_time`, `day_of_week` (Monday…Sunday).
- El frontend muestra errores del backend (campo `error`), no reimplementa validación de solapamiento/duplicados.

---

### Task 1: Scaffold del proyecto Vite + Tailwind

**Files:**
- Create: `Frontend/package.json`, `Frontend/vite.config.js`, `Frontend/index.html`, `Frontend/tailwind.config.js`, `Frontend/postcss.config.js`, `Frontend/.env`, `Frontend/src/main.jsx`, `Frontend/src/App.jsx`, `Frontend/src/index.css`

**Produces:** App Vite que arranca con `npm run dev` y muestra una página con Tailwind aplicado.

- [ ] Crear app con `npm create vite@latest Frontend -- --template react` (limpiar boilerplate).
- [ ] Instalar deps: `react-router-dom`, `tailwindcss postcss autoprefixer`, `vitest @testing-library/react jsdom`.
- [ ] Configurar Tailwind (`content: ['./index.html','./src/**/*.{js,jsx}']`) y directivas en `index.css`.
- [ ] `.env` con `VITE_API_URL=http://localhost:3000`.
- [ ] Verificar: `npm run dev` arranca sin errores y se ve estilo Tailwind.

### Task 2: Cliente de API único (`src/api/client.js`) — TDD

**Files:**
- Create: `Frontend/src/api/client.js`, `Frontend/src/api/client.test.js`

**Produces:** `employeesApi`, `shiftsApi`, `assignmentsApi` con métodos list/get/create/update/remove y un `request()` que normaliza errores.

- [ ] Test (Vitest, `fetch` mockeado): `request` parsea JSON 200; en error lanza `Error` con `message` = campo `error` del body; 204 devuelve `null`.
- [ ] Test: `employeesApi.create(body)` hace POST a `/api/employees` con JSON.
- [ ] Test: error 409 de `assignmentsApi.create` propaga el `message` del backend.
- [ ] Implementar `BASE = import.meta.env.VITE_API_URL`, `request(path, {method, body})`, y los tres objetos API.
- [ ] Verificar: `npm test` pasa.

### Task 3: SessionContext (rol + empleado) con localStorage

**Files:**
- Create: `Frontend/src/context/SessionContext.jsx`

**Produces:** `SessionProvider`, hook `useSession()` → `{ session, loginAsAdmin, loginAsEmployee(employeeId), logout }`. Persiste `{role, employeeId}` en localStorage.

- [ ] Implementar context con estado inicial leído de `localStorage`.
- [ ] `loginAsAdmin()`, `loginAsEmployee(id)`, `logout()` actualizan estado y localStorage.
- [ ] Envolver `<App/>` con `<SessionProvider>` en `main.jsx`.

### Task 4: Componentes UI reutilizables

**Files:**
- Create: `Frontend/src/components/{Nav,Modal,DataTable,Field,ErrorBanner,ShiftCard}.jsx`

**Produces:** Componentes presentacionales con Tailwind: `Nav` (links admin + botón cambiar usuario), `Modal` (overlay con children), `DataTable` (columns + rows + acciones), `Field` (label+input/select), `ErrorBanner` (muestra mensaje), `ShiftCard` (día/horario/tipo/descr).

- [ ] Implementar cada componente con props claras y estilos Tailwind.

### Task 5: LoginPage (falso login)

**Files:**
- Create: `Frontend/src/pages/LoginPage.jsx`

**Consumes:** `employeesApi.list`, `useSession`.

- [ ] Al montar, `employeesApi.list()` para poblar el `<select>` de empleados.
- [ ] Botón "Entrar como Admin" → `loginAsAdmin()` → navega a `/admin/empleados`.
- [ ] Select empleado + "Entrar como empleado" → `loginAsEmployee(id)` → navega a `/mis-turnos`.
- [ ] Mostrar `ErrorBanner` si falla la carga.

### Task 6: Router + guards por rol (`App.jsx`)

**Files:**
- Modify: `Frontend/src/App.jsx`

**Produces:** Rutas: `/` (login), `/admin/empleados`, `/admin/turnos`, `/admin/asignaciones`, `/mis-turnos`. Guard: sin sesión → `/`; rol employee accediendo a `/admin/*` → redirige a `/mis-turnos` (y viceversa).

- [ ] Definir rutas con `react-router-dom` y componentes guard según `useSession`.

### Task 7: EmployeesPage (CRUD empleados)

**Files:**
- Create: `Frontend/src/pages/admin/EmployeesPage.jsx`

**Consumes:** `employeesApi`, `DataTable`, `Modal`, `Field`, `ErrorBanner`.

- [ ] Fetch lista al montar; tabla con columnas y botones editar/borrar.
- [ ] Modal con formulario (5 campos) para crear/editar; submit → create/update → re-fetch.
- [ ] Borrar → `remove` → re-fetch. Errores del backend en `ErrorBanner`.

### Task 8: ShiftsPage (CRUD turnos)

**Files:**
- Create: `Frontend/src/pages/admin/ShiftsPage.jsx`

**Consumes:** `shiftsApi`, `DataTable`, `Modal`, `Field`, `ErrorBanner`.

- [ ] Fetch lista al montar; tabla con día/horario/tipo/descr/is_workable y editar/borrar.
- [ ] Modal con form: select `type`, select `day_of_week`, inputs `time`, checkbox `is_workable`, input `description`.
- [ ] Crear/editar/borrar con re-fetch y manejo de errores.

### Task 9: AssignmentsPage (vista + asignar/quitar)

**Files:**
- Create: `Frontend/src/pages/admin/AssignmentsPage.jsx`

**Consumes:** `assignmentsApi.list/create/remove`, `employeesApi.list`, `shiftsApi.list`, `ShiftCard`, `ErrorBanner`.

- [ ] `assignmentsApi.list()` → por cada empleado, sus turnos (tarjetas con botón quitar).
- [ ] Form asignar: select empleado + select turno → `create` → re-fetch.
- [ ] Mostrar el **409** de solapamiento/duplicado en `ErrorBanner`.

### Task 10: MyShiftsPage (vista empleado, solo lectura)

**Files:**
- Create: `Frontend/src/pages/employee/MyShiftsPage.jsx`

**Consumes:** `assignmentsApi.list`, `useSession`, `ShiftCard`.

- [ ] `assignmentsApi.list()`, filtrar por `employee_id === session.employeeId`, mostrar sus turnos en tarjetas. Sin acciones de edición.

### Task 11: Verificación end-to-end y README

**Files:**
- Create: `Frontend/README.md`

- [ ] Documentar: requisitos (backend en `:3000`), `npm install`, `npm run dev`, cómo usar Admin/Empleado.
- [ ] Verificación manual: arrancar backend + frontend, recorrer CRUD de empleados, turnos, asignar (provocar 409), entrar como empleado y ver solo sus turnos.
