import { NavLink } from 'react-router-dom';
import { useSession } from '../context/SessionContext.jsx';

const ADMIN_LINKS = [
  { to: '/admin/empleados', label: 'Empleados', icon: '◷' },
  { to: '/admin/turnos', label: 'Turnos', icon: '▦' },
  { to: '/admin/asignaciones', label: 'Asignaciones', icon: '⇄' },
];

const EMPLOYEE_LINKS = [{ to: '/mis-turnos', label: 'Mis turnos', icon: '◷' }];

function linkClass({ isActive }) {
  return `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
    isActive
      ? 'bg-white/10 text-white shadow-[inset_3px_0_0_0_theme(colors.brand.ring)]'
      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
  }`;
}

export default function Nav() {
  const { session, logout } = useSession();
  const isAdmin = session?.role === 'admin';
  const links = isAdmin ? ADMIN_LINKS : EMPLOYEE_LINKS;

  return (
    <aside className="flex w-64 shrink-0 flex-col bg-ink text-slate-300">
      {/* Lockup de marca con el "ritmo de turnos": ámbar · cielo · índigo. */}
      <div className="px-5 py-6">
        <div className="mb-2 flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-indigo-400" />
        </div>
        <h1 className="font-display text-xl font-bold leading-tight text-white">Turnos</h1>
        <span className="mt-2 inline-block rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-300">
          {isAdmin ? 'Administrador' : 'Empleado'}
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} className={linkClass}>
            <span className="text-slate-500 group-hover:text-slate-300" aria-hidden>
              {link.icon}
            </span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3">
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
        >
          <span aria-hidden>↩</span> Cambiar usuario
        </button>
      </div>
    </aside>
  );
}
