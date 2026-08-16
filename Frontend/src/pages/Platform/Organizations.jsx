import { useEffect, useState } from 'react';
import { platformApi } from '../../api/platform.api';
import styles from '../Dashboard.module.css';

const emptyForm = { name: '', adminUserId: '' };

export default function Organizations() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadOrganizations = async () => {
    try {
      setError(null);
      const response = await platformApi.listOrganizations({ page: 1, limit: 50, search });
      setOrganizations(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizations();
  }, [search]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setError('Organization name is required');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      if (editingId) {
        await platformApi.updateOrganization(editingId, { name: form.name.trim() });
      } else {
        await platformApi.createOrganization({
          name: form.name.trim(),
          adminUserId: form.adminUserId || undefined,
        });
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadOrganizations();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save organization');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (org) => {
    setEditingId(org.id);
    setForm({ name: org.name, adminUserId: '' });
    setError(null);
  };

  const handleDelete = async (orgId) => {
    const ok = window.confirm('Delete this organization? This action cannot be undone.');
    if (!ok) return;

    try {
      setError(null);
      await platformApi.deleteOrganization(orgId);
      await loadOrganizations();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete organization');
    }
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.container}>
      <h1>Organizations</h1>

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, marginBottom: 24, maxWidth: 500 }}>
        <input
          type="text"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          placeholder={editingId ? 'Edit organization name' : 'Organization name'}
          style={{ padding: '10px', borderRadius: '6px', border: '1px solid #d0d5dd' }}
        />

        {!editingId && (
          <input
            type="text"
            value={form.adminUserId}
            onChange={(event) => setForm({ ...form, adminUserId: event.target.value })}
            placeholder="Optional admin user id"
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #d0d5dd' }}
          />
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" disabled={submitting} style={{ padding: '10px 16px', border: 'none', borderRadius: '6px', background: '#4f46e5', color: 'white', cursor: 'pointer' }}>
            {submitting ? 'Saving...' : editingId ? 'Update Organization' : 'Add Organization'}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
              style={{ padding: '10px 16px', border: '1px solid #d0d5dd', borderRadius: '6px', background: 'white', cursor: 'pointer' }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Search organizations..."
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

      {organizations.length > 0 ? (
        <div className={styles.itemList}>
          {organizations.map((org) => (
            <div key={org.id} className={styles.itemCard} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
              <div>
                <p className={styles.itemTitle}>{org.name}</p>
                <p className={styles.itemMeta}>{org.memberCount} members</p>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={() => handleEdit(org)} style={{ padding: '8px 12px', border: '1px solid #d0d5dd', borderRadius: '6px', background: 'white', cursor: 'pointer' }}>
                  Edit
                </button>
                <button type="button" onClick={() => handleDelete(org.id)} style={{ padding: '8px 12px', border: 'none', borderRadius: '6px', background: '#dc2626', color: 'white', cursor: 'pointer' }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>No organizations found</div>
      )}
    </div>
  );
}
