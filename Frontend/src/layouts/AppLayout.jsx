import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/sidebar/AdminSidebar';
import OrganizationSidebar from '../components/sidebar/OrganizationSidebar';
import MemberSidebar from '../components/sidebar/MemberSidebar';
import { useAuth } from '../context/AuthContext';

const AppLayout = () => {
  const { role, platformRole, logout, user } = useAuth();
  const navigate = useNavigate();
  const effectiveRole = platformRole === 'platform_admin' ? 'platform_admin' : role;

  const SidebarComponent = {
    platform_admin: AdminSidebar,
    org_admin: OrganizationSidebar,
    member: MemberSidebar,
  }[effectiveRole] || MemberSidebar;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <SidebarComponent user={user} role={effectiveRole} onLogout={handleLogout} />

      <main className="main-panel">
        <header className="topbar">
          <h1>TaskFlow</h1>
        </header>
        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
