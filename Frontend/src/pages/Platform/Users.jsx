import { useEffect, useState } from 'react';
import { platformApi } from '../../api/platform.api';
import styles from '../Dashboard.module.css';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        const response = await platformApi.listUsers({ page, search });
        setUsers(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    })();
  }, [page, search]);

  const handlePromoteAdmin = async (userId) => {
    try {
      await platformApi.updateUserRole(userId, 'platform_admin');
      setUsers(users.map((u) => (u.id === userId ? { ...u, platformRole: 'platform_admin' } : u)));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to promote user');
    }
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.container}>
      <h1>Users</h1>

      {error && <div className={styles.error}>{error}</div>}

      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            width: '100%',
            maxWidth: '300px',
          }}
        />
      </div>

      {users.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginTop: '20px',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Role</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Organizations</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{user.email}</td>
                  <td style={{ padding: '12px' }}>{user.name}</td>
                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        padding: '4px 8px',
                        backgroundColor: user.platformRole === 'platform_admin' ? '#e8f5e9' : '#e3f2fd',
                        color: user.platformRole === 'platform_admin' ? '#388e3c' : '#1976d2',
                        borderRadius: '4px',
                        fontSize: '12px',
                      }}
                    >
                      {user.platformRole}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>{user.organizationCount}</td>
                  <td style={{ padding: '12px' }}>
                    {user.platformRole !== 'platform_admin' && (
                      <button
                        onClick={() => handlePromoteAdmin(user.id)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#667eea',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        Make Admin
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.emptyState}>No users found</div>
      )}
    </div>
  );
}
