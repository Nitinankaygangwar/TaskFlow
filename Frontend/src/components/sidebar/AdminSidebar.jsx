import { NavLink } from 'react-router-dom';

const items = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/organizations', label: 'Organizations' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/projects', label: 'Projects' },
  { to: '/admin/tasks', label: 'Tasks' },
  { to: '/admin/activity', label: 'Activity' },
  { to: '/admin/settings', label: 'Settings' },
];

export default function AdminSidebar({ user, role, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="brand-block">
        <div className="brand-mark">T</div>
        <div>
          <strong>TaskFlow</strong>
          <small>Platform Admin</small>
        </div>
      </div>

      <nav className="nav-menu" aria-label="Platform admin navigation">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin/dashboard'}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
        <button type="button" className="nav-link nav-logout" onClick={onLogout}>
          Logout
        </button>
      </nav>

      <div className="sidebar-user">
        <strong>{user?.name || 'Platform Admin'}</strong>
        <span>{role}</span>
      </div>
    </aside>
  );
}
