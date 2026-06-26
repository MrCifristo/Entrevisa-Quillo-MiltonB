# Modelado de Datos — Plataforma de Gestión de Turnos

Copia el bloque de código en [dbdiagram.io](https://dbdiagram.io) para visualizar el diagrama ER.



## Resumen del modelo

| Tabla | Rol |
|---|---|
| `employees` | Entidad principal del empleado |
| `shifts` | Plantilla semanal recurrente de turno |
| `shift_assignments` | Tabla intermedia de la relación M:N |

## ENUMs

| ENUM | Valores |
|---|---|
| `shift_type_enum` | `morning`, `afternoon`, `night` |
| `day_of_week_enum` | `Monday` … `Sunday` |

## Relaciones

- `employees` → `shift_assignments`: uno a muchos (un empleado tiene muchas asignaciones)
- `shifts` → `shift_assignments`: uno a muchos (un turno tiene muchas asignaciones)
- `employees` ↔ `shifts`: **muchos a muchos** a través de `shift_assignments`

## Constraints clave

| Constraint | Tabla | Descripción |
|---|---|---|
| `UNIQUE (employee_id, shift_id)` | `shift_assignments` | Evita asignar el mismo turno dos veces al mismo empleado |
| `UNIQUE (employee_number)` | `employees` | Número de empleado irrepetible |
| `UNIQUE (email)` | `employees` | Email irrepetible |
| `UNIQUE (dpi)` | `employees` | DPI irrepetible |
| `ON DELETE CASCADE` | `shift_assignments` | Elimina asignaciones huérfanas si se borra un empleado o turno |

> **Nota DBML:** las acciones referenciales (`delete`/`update`) no se permiten como settings de columna en un `ref` inline. Se declaran en bloques `Ref:` separados al final del esquema.

## Validación de solapamiento

Implementada en la capa de aplicación (no en la DB) para no cargar con lógica al motor.

Antes de insertar en `shift_assignments`, la app ejecuta:

1. Busca todos los turnos ya asignados al empleado en el mismo `day_of_week`.
2. Para cada turno existente, compara los rangos de tiempo con el turno candidato.
3. Detecta cruce de medianoche cuando `end_time < start_time` y ajusta la comparación.
4. Rechaza la asignación si hay solapamiento.
