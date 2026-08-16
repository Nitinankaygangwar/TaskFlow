import { useEffect, useState } from 'react';
import { memberApi } from '../api/member.api';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [roleDraft, setRoleDraft] = useState('member');

  const loadMembers = async () => {
    try {
      setLoading(true);
      const response = await memberApi.getMembers();
      setMembers(response.data?.data || response.data || []);
      setError('');
    } catch (err) {
      setError(err?.userMessage || err?.response?.data?.error || 'Unable to load members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleAddMember = async (event) => {
    event.preventDefault();
    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    try {
      await memberApi.addMember({ email: email.trim() });
      setEmail('');
      setError('');
      await loadMembers();
    } catch (err) {
      setError(err?.userMessage || err?.response?.data?.error || 'Unable to add member.');
    }
  };

  const handleChangeRole = async (memberId, nextRole) => {
    try {
      await memberApi.changeRole(memberId, { role: nextRole });
      await loadMembers();
    } catch (err) {
      setError(err?.userMessage || err?.response?.data?.error || 'Unable to update member role.');
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await memberApi.removeMember(memberId);
      await loadMembers();
    } catch (err) {
      setError(err?.userMessage || err?.response?.data?.error || 'Unable to remove member.');
    }
  };

  return (
    <div className="page-stack">
      <div className="page-header-row">
        <h2>Members</h2>
      </div>

      <div className="page-card">
        <form className="inline-form" onSubmit={handleAddMember}>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Member email" />
          <select value={roleDraft} onChange={(event) => setRoleDraft(event.target.value)}>
            <option value="member">member</option>
            <option value="org_admin">org_admin</option>
          </select>
          <button type="submit">Add Member</button>
        </form>
      </div>

      {error && <div className="alert error">{error}</div>}

      {loading ? (
        <div className="page-state"><p>Loading members...</p></div>
      ) : (
        <div className="page-card">
          {members.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id}>
                      <td>{member.user?.name || '—'}</td>
                      <td>{member.user?.email || member.email || '—'}</td>
                      <td>{member.role}</td>
                      <td>{member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : '—'}</td>
                      <td className="actions-cell">
                        <button type="button" onClick={() => handleChangeRole(member.id, member.role === 'org_admin' ? 'member' : 'org_admin')}>Change role</button>
                        <button type="button" className="danger-button" onClick={() => handleRemoveMember(member.id)}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">No members found.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Members;
