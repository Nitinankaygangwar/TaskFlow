import { NavLink } from 'react-router-dom';

const items = [
  { to: '/organization/dashboard', label: 'Dashboard' },
  { to: '/organization/members', label: 'Members' },
  { to: '/organization/projects', label: 'Projects' },
  { to: '/organization/tasks', label: 'Tasks' },
  { to: '/organization/activity', label: 'Activity' },
  { to: '/organization/settings', label: 'Settings' },
];

export default function OrganizationSidebar({ user, role, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="brand-block">
        <div className="brand-mark">T</div>
        <div>
          <strong>TaskFlow</strong>
          <small>Organization Admin</small>
        </div>
      </div>

      <nav className="nav-menu" aria-label="Organization admin navigation">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/organization/dashboard'}
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
        <strong>{user?.name || 'Organization Admin'}</strong>
        <span>{role}</span>
      </div>
    </aside>
  );
}
