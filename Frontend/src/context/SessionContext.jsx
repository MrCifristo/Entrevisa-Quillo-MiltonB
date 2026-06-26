import { createContext, useContext, useState, useCallback } from 'react';

// Falso "login": no hay auth real, solo guardamos qué perfil eligió el usuario.
//   { role: 'admin', employeeId: null }
//   { role: 'employee', employeeId: 12 }
//   null  → sin sesión

const STORAGE_KEY = 'shifts.session';
const SessionContext = createContext(null);

function readInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function SessionProvider({ children }) {
  const [session, setSession] = useState(readInitial);

  const persist = useCallback((value) => {
    setSession(value);
    if (value) localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    else localStorage.removeItem(STORAGE_KEY);
  }, []);

  const loginAsAdmin = useCallback(
    () => persist({ role: 'admin', employeeId: null }),
    [persist]
  );

  const loginAsEmployee = useCallback(
    (employeeId) => persist({ role: 'employee', employeeId }),
    [persist]
  );

  const logout = useCallback(() => persist(null), [persist]);

  return (
    <SessionContext.Provider value={{ session, loginAsAdmin, loginAsEmployee, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession debe usarse dentro de <SessionProvider>');
  return ctx;
}
