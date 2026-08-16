import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    organizationName: '',
    role: 'org_admin',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!form.name.trim()) nextErrors.name = 'Name is required';
    if (!form.email.trim()) nextErrors.email = 'Email is required';
    if (!form.password || form.password.length < 8) nextErrors.password = 'Password must be at least 8 characters';
    if (!form.organizationName.trim()) nextErrors.organizationName = 'Organization name is required';

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        organizationName: form.organizationName.trim(),
        role: form.role,
      });
      navigate('/dashboard');
    } catch (error) {
      setApiError(error?.userMessage || error?.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2>Create account</h2>
      <p className="form-subtitle">Set up your organization</p>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          <span>Name</span>
          <input type="text" name="name" value={form.name} onChange={handleChange} aria-invalid={Boolean(errors.name)} />
          {errors.name && <small>{errors.name}</small>}
        </label>

        <label>
          <span>Email</span>
          <input type="email" name="email" value={form.email} onChange={handleChange} aria-invalid={Boolean(errors.email)} />
          {errors.email && <small>{errors.email}</small>}
        </label>

        <label>
          <span>Password</span>
          <input type="password" name="password" value={form.password} onChange={handleChange} aria-invalid={Boolean(errors.password)} />
          {errors.password && <small>{errors.password}</small>}
        </label>

        <label>
          <span>Role</span>
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="platform_admin">Platform Admin</option>
            <option value="org_admin">Organization Admin</option>
            <option value="member">Member</option>
          </select>
        </label>

        <label>
          <span>Organization Name</span>
          <input type="text" name="organizationName" value={form.organizationName} onChange={handleChange} aria-invalid={Boolean(errors.organizationName)} />
          {errors.organizationName && <small>{errors.organizationName}</small>}
        </label>

        {apiError && <div className="alert error">{apiError}</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <p className="auth-footer">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </>
  );
};

export default Register;
