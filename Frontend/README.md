# Frontend — Gestión de Turnos

Frontend en **React + Vite + Tailwind** para administrar empleados, turnos y sus
asignaciones. Tiene dos perfiles (vía un *falso login*, sin auth real):

- **Administrador**: CRUD de empleados, CRUD de turnos y gestión de asignaciones.
- **Empleado**: vista de solo lectura de los turnos a los que está asignado.

## Requisitos

- Node 18+ y npm.
- El **backend** corriendo en `http://localhost:3000` (carpeta hermana `../backend`).

## Puesta en marcha

```bash
# 1) Backend (en otra terminal, desde ../backend)
npm install
npm run seed     # datos de ejemplo
npm start        # API en http://localhost:3000

# 2) Frontend
cd Frontend
npm install
npm run dev      # http://localhost:5173
```

La URL del backend es configurable en `.env`:

```
VITE_API_URL=http://localhost:3000
```

## Uso

1. En el login, **Entrar como Administrador** o elegir un empleado y **Entrar como
   empleado**.
2. Como admin: crea empleados y turnos, luego ve a **Asignaciones** para asignar un
   turno a un empleado. Si el turno se solapa con otro del mismo empleado el mismo
   día, el backend responde 409 y se muestra el mensaje.
3. Como empleado: solo ves tus turnos asignados.
4. **Cambiar usuario** (abajo en la barra lateral) vuelve al login.

## Arquitectura

- `src/api/client.js` — **único** punto de comunicación con el backend. Si cambia un
  endpoint o la fuente de datos, es el único archivo a modificar.
- `src/context/SessionContext.jsx` — sesión simulada (rol + empleado) en localStorage.
- `src/pages/` — vistas de admin y de empleado.
- `src/components/` — componentes reutilizables (tabla, modal, campos, tarjetas).

## Tests

```bash
npm test    # prueba el cliente de API (src/api/client.test.js)
```
