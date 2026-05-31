import { useEffect, useState } from 'react';
import requestService from '../services/requestService';

function MyDonations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDonations = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await requestService.getRequests();
        setDonations(response.filter((request) => request.status === 'completed'));
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load donations');
      } finally {
        setLoading(false);
      }
    };

    loadDonations();
  }, []);

  return (
    <section className="space-y-8">
      <div className="rounded-3xl bg-white p-8 shadow-soft">
        <h1 className="text-3xl font-bold text-slate-900">My Donations</h1>
        <p className="mt-2 text-slate-600">Track your donation history and completed emergency support cases.</p>
        {error && <p className="mt-4 rounded-2xl bg-red-100 px-4 py-3 text-sm text-red-700">{error}</p>}
        <div className="mt-8 grid gap-4">
          {loading ? (
            <p className="text-slate-600">Loading donations…</p>
          ) : donations.length === 0 ? (
            <p className="text-slate-600">No completed donations found yet.</p>
          ) : (
            donations.map((donation) => (
              <div key={donation._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-500">Blood Group</p>
                    <p className="mt-1 text-xl font-semibold text-slate-900">{donation.bloodGroup}</p>
                  </div>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">Completed</span>
                </div>
                <p className="mt-4 text-slate-600">{donation.hospitalAddress}, {donation.city}</p>
                <p className="mt-2 text-sm text-slate-500">Date: {new Date(donation.createdAt).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default MyDonations;
