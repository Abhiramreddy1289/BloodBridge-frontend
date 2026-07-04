import { useEffect, useState } from 'react';
import adminService from '../services/adminService';

function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        setAnalytics(await adminService.getAnalytics());
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load analytics');
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const metrics = [
    { label: 'Total users', value: analytics?.totalUsers ?? 0 },
    { label: 'Active donors', value: analytics?.activeDonors ?? 0 },
    { label: 'Emergency requests', value: analytics?.totalRequests ?? 0 },
    { label: 'Active requests', value: analytics?.activeRequests ?? 0 },
    { label: 'Completed donations', value: analytics?.completedRequests ?? 0 },
  ];

  return (
    <section className="space-y-8">
      <div className="rounded-3xl bg-white p-8 shadow-soft">
        <h1 className="text-3xl font-bold text-slate-900">Admin - Analytics</h1>
        <p className="mt-3 text-slate-600">Observe platform activity and monitor emergency donor response performance.</p>
        {error && <p className="mt-4 rounded-2xl bg-red-100 px-4 py-3 text-sm text-red-700">{error}</p>}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {loading ? (
            <p className="text-slate-600">Loading analytics...</p>
          ) : (
            metrics.map((metric) => (
              <div key={metric.label} className="rounded-3xl bg-slate-50 p-6">
                <p className="text-sm uppercase tracking-[0.25em] text-slate-500">{metric.label}</p>
                <p className="mt-4 text-3xl font-semibold text-slate-900">{metric.value}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default AdminAnalytics;
