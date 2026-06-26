Construye una app pequeña para gestionar turnos de trabajo y asignarlos a empleados.
Usa las herramientas de IA que quieras — Claude Code, Cursor, Copilot, lo que usarías
normalmente. Apunta a código que de verdad estarías dispuesto(a) a entregar. Después
te pediremos que nos expliques y ajustes partes, así que construye cosas que entiendas.
Requerido:
 Entidad Turno (Shift) con campos como: type, description, is_workable (booleano), start_time,
end_time, day_of_week (+ lo que sea razonable).
 Entidad Empleado (Employee).
 Una relación muchos-a-muchos: turnos asignados a empleados (un turno puede ir a muchos
empleados; un empleado puede tener muchos turnos).
 UI CRUD para turnos.
 UI CRUD para empleados.
 Una vista de las asignaciones — quién está asignado a qué turnos.
Bonus (deseable):
 Evitar turnos solapados para el mismo empleado (mismo día + rango de horas solapado ->
rechazar o advertir).
Contexto útil
 Cualquier stack con el que te sientas cómodo(a) — framework de frontend, lenguaje de backend,
ORM, tú decides. Usa las herramientas de tu día a día.
 La persistencia es tu elección: SQLite, Postgres, MySQL, incluso en memoria — siempre que la
relación muchos-a-muchos esté modelada de forma relacional (una tabla intermedia real, no un
arreglo JSON de IDs).
 Sin auth, sin despliegue, sin pulido. Datos de ejemplo/seed están bien y se recomiendan. Una
rebanada vertical funcional y limpia vale más que una app amplia a medio hacer.
 UIs CRUD sencillas están bien — formularios + listas. La vista de asignaciones puede ser tan
simple como “por cada empleado, los turnos asignados” (o al revés).
 Turno de ejemplo para anclar el modelo: { type: "morning", description: "Front desk",
is_workable: true, start_time: "08:00", end_time: "16:00", day_of_week: "Monday" }.
 Está bien no terminar — nos importa más el modelo, cómo diriges la IA, y que entiendas lo que
termina en pantalla.
Aviso: después de construir, te pediremos que expliques tu modelo de datos, muestres
dónde se persisten las cosas y hagas un pequeño cambio en vivo — así que mantenlo
entendible.