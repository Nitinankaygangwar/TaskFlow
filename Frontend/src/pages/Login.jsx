import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
 

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  };

  const handleQuickLogin = async (email, password) => {
    setLoading(true);
    setApiError('');
    setForm({ email, password });

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (error) {
      setApiError(error?.userMessage || error?.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!form.email.trim()) nextErrors.email = 'Email is required';
    if (!form.password) nextErrors.password = 'Password is required';

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      await login({ email: form.email.trim(), password: form.password });
      navigate('/dashboard');
    } catch (error) {
      setApiError(error?.userMessage || error?.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2>Welcome back</h2>
      <p className="form-subtitle">Sign in to continue</p>

      <form className="auth-form" onSubmit={handleSubmit}>
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

        {apiError && <div className="alert error">{apiError}</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </form>

      <p className="auth-footer">
        Need an account? <Link to="/register">Create one</Link>
      </p>
    </>
  );
};

export default Login;
