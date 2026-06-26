-- Esquema relacional para gestión de turnos
-- Se ejecuta automáticamente al inicializar el contenedor de Postgres.

CREATE TYPE shift_type_enum AS ENUM ('morning', 'afternoon', 'night');

CREATE TYPE day_of_week_enum AS ENUM (
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
);

CREATE TABLE employees (
  id              SERIAL PRIMARY KEY,
  employee_number VARCHAR(50)  NOT NULL UNIQUE,
  full_name       VARCHAR(150) NOT NULL,
  email           VARCHAR(150) NOT NULL UNIQUE,
  phone           VARCHAR(50)  NOT NULL,
  dpi             VARCHAR(50)  NOT NULL UNIQUE,
  created_at      TIMESTAMP    NOT NULL DEFAULT now(),
  updated_at      TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE TABLE shifts (
  id          SERIAL PRIMARY KEY,
  type        shift_type_enum  NOT NULL,
  description VARCHAR(255)     NOT NULL,
  is_workable BOOLEAN          NOT NULL DEFAULT true,
  start_time  TIME             NOT NULL,
  end_time    TIME             NOT NULL,
  day_of_week day_of_week_enum NOT NULL,
  created_at  TIMESTAMP        NOT NULL DEFAULT now(),
  updated_at  TIMESTAMP        NOT NULL DEFAULT now()
);

CREATE INDEX idx_shifts_day ON shifts (day_of_week);

-- Tabla intermedia real de la relación muchos-a-muchos
CREATE TABLE shift_assignments (
  id          SERIAL PRIMARY KEY,
  employee_id INTEGER   NOT NULL REFERENCES employees(id) ON DELETE CASCADE ON UPDATE CASCADE,
  shift_id    INTEGER   NOT NULL REFERENCES shifts(id)    ON DELETE CASCADE ON UPDATE CASCADE,
  assigned_at TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT uq_employee_shift UNIQUE (employee_id, shift_id)
);

CREATE INDEX idx_sa_employee ON shift_assignments (employee_id);
CREATE INDEX idx_sa_shift    ON shift_assignments (shift_id);
