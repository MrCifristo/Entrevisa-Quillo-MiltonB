import pg from 'pg';

const connectionString =
  process.env.DATABASE_URL || 'postgres://shifts:shifts@localhost:5432/shifts';

export const pool = new pg.Pool({ connectionString });

export const query = (text, params) => pool.query(text, params);
