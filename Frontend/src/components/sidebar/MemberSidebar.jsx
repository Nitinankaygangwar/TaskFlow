import { NavLink } from 'react-router-dom';

const items = [
  { to: '/member/dashboard', label: 'Dashboard' },
  { to: '/member/my-tasks', label: 'My Tasks' },
  { to: '/member/projects', label: 'Projects' },
  { to: '/member/team', label: 'Team' },
  { to: '/member/notifications', label: 'Notifications' },
  { to: '/member/profile', label: 'Profile' },
];

export default function MemberSidebar({ user, role, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="brand-block">
        <div className="brand-mark">T</div>
        <div>
          <strong>TaskFlow</strong>
          <small>Member Workspace</small>
        </div>
      </div>

      <nav className="nav-menu" aria-label="Member navigation">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/member/dashboard'}
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
        <strong>{user?.name || 'Member'}</strong>
        <span>{role}</span>
      </div>
    </aside>
  );
}
