import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-soft">
      <h1 className="text-3xl font-bold text-slate-900">Login</h1>
      <p className="mt-3 text-slate-600">Access your BloodBridge account and continue emergency coordination.</p>
      <form className="mt-8 grid gap-6" onSubmit={handleSubmit}>
        {error && <p className="rounded-2xl bg-red-100 px-4 py-3 text-sm text-red-700">{error}</p>}
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900"
            type="email"
            placeholder="you@example.com"
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Password
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900"
            type="password"
            placeholder="••••••••"
            required
          />
        </label>
        <button
          className="rounded-full bg-primary px-6 py-3 text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Continue'}
        </button>
      </form>
    </section>
  );
}

export default Login;
