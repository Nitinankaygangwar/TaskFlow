import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, organization, role } = useAuth();

  return (
    <div className="page-card">
      <h2>Profile</h2>
      <div className="profile-grid">
        <div className="stat-box">
          <span>Name</span>
          <strong>{user?.name || 'N/A'}</strong>
        </div>
        <div className="stat-box">
          <span>Email</span>
          <strong>{user?.email || 'N/A'}</strong>
        </div>
        <div className="stat-box">
          <span>Organization</span>
          <strong>{organization?.name || 'N/A'}</strong>
        </div>
        <div className="stat-box">
          <span>Role</span>
          <strong>{role || 'N/A'}</strong>
        </div>
      </div>
    </div>
  );
};

export default Profile;
