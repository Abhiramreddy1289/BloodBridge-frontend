import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    bloodGroup: '',
    phone: '',
    city: '',
    state: '',
    coordinates: null,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setForm(prev => ({
          ...prev,
          coordinates: [position.coords.longitude, position.coords.latitude]
        }));
      });
    }
  }, []);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <section className="mx-auto max-w-4xl rounded-[2.5rem] bg-white p-8 sm:p-12 shadow-soft border border-slate-100">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-md space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-1 text-sm font-bold text-red-600">
            Join the Smart Network
          </span>
          <h1 className="text-4xl font-extrabold text-slate-900 leading-tight">Become a Verified Life Saver.</h1>
          <p className="text-lg text-slate-600">Register to receive real-time SOS alerts and track your donation impact.</p>
          
          <div className="pt-6 space-y-4 hidden lg:block">
            <div className="flex items-center gap-3 text-slate-500">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <p className="text-sm font-medium">Real-time emergency notifications</p>
            </div>
            <div className="flex items-center gap-3 text-slate-500">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <p className="text-sm font-medium">Verified medical history tracking</p>
            </div>
            <div className="flex items-center gap-3 text-slate-500">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <p className="text-sm font-medium">Hyperlocal matching (20km radius)</p>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-md w-full">
          <form className="grid gap-6" onSubmit={handleSubmit}>
            {error && <div className="rounded-2xl bg-red-50 border border-red-100 p-4 text-red-700 text-sm font-medium">{error}</div>}
            
            <div className="grid gap-6">
              <label className="grid gap-2 text-sm font-bold text-slate-700">
                Full Name
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 focus:ring-2 focus:ring-red-500/20 transition-all"
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-slate-700">
                Email Address
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4"
                  type="email"
                  placeholder="rahul@example.com"
                  required
                />
              </label>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-slate-700">
                Blood Group
                <select
                  name="bloodGroup"
                  value={form.bloodGroup}
                  onChange={handleChange}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 font-bold text-red-600"
                  required
                >
                  <option value="">Select</option>
                  {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-bold text-slate-700">
                Phone Number
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4"
                  type="tel"
                  placeholder="10-digit mobile"
                  required
                />
              </label>
            </div>

            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Password
              <input
                name="password"
                value={form.password}
                onChange={handleChange}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4"
                type="password"
                placeholder="Minimum 6 characters"
                required
              />
            </label>

            <div className="grid gap-6 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-slate-700">
                City
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4"
                  type="text"
                  placeholder="Current City"
                  required
                />
              </label>
              <div className="flex items-end">
                <div className={`flex items-center gap-2 rounded-2xl border px-5 py-4 w-full ${form.coordinates ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                  <div className={`h-2 w-2 rounded-full ${form.coordinates ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {form.coordinates ? 'GPS Verified' : 'Detecting GPS...'}
                  </span>
                </div>
              </div>
            </div>

            <button
              className="mt-4 rounded-full bg-primary px-8 py-4 text-lg font-bold text-white shadow-lg shadow-red-100 transition-all hover:bg-red-700 hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:bg-red-300"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating Profile...' : 'Complete Registration'}
            </button>
            <p className="text-center text-sm text-slate-500">
              Already have an account? <Link to="/login" className="text-red-600 font-bold hover:underline">Sign In</Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Register;
