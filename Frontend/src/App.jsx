import { Routes, Route, Navigate } from 'react-router-dom';
import { useSession } from './context/SessionContext.jsx';
import Nav from './components/Nav.jsx';
import LoginPage from './pages/LoginPage.jsx';
import EmployeesPage from './pages/admin/EmployeesPage.jsx';
import ShiftsPage from './pages/admin/ShiftsPage.jsx';
import AssignmentsPage from './pages/admin/AssignmentsPage.jsx';
import MyShiftsPage from './pages/employee/MyShiftsPage.jsx';

// Layout con navegación lateral para las vistas autenticadas.
function Shell({ children }) {
  return (
    <div className="flex min-h-screen">
      <Nav />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-8 py-9">{children}</div>
      </main>
    </div>
  );
}

export default function App() {
  const { session } = useSession();

  // Sin sesión: solo el login.
  if (!session) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  const isAdmin = session.role === 'admin';

  return (
    <Shell>
      <Routes>
        {isAdmin ? (
          <>
            <Route path="/admin/empleados" element={<EmployeesPage />} />
            <Route path="/admin/turnos" element={<ShiftsPage />} />
            <Route path="/admin/asignaciones" element={<AssignmentsPage />} />
            <Route path="*" element={<Navigate to="/admin/empleados" replace />} />
          </>
        ) : (
          <>
            <Route path="/mis-turnos" element={<MyShiftsPage />} />
            <Route path="*" element={<Navigate to="/mis-turnos" replace />} />
          </>
        )}
      </Routes>
    </Shell>
  );
}
