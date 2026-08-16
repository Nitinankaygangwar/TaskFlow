import { Outlet } from 'react-router-dom';

const AuthLayout = () => (
  <div className="auth-layout">
    <div className="auth-shell">
      <div className="auth-banner">
        <div className="brand-badge">TF</div>
        <h1>TaskFlow</h1>
        <p>Project management for multi-tenant teams.</p>
      </div>
      <div className="auth-card">
        <Outlet />
      </div>
    </div>
  </div>
);

export default AuthLayout;
