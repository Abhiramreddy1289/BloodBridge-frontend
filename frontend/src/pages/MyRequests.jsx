import { useEffect, useState } from 'react';
import requestService from '../services/requestService';

function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRequests = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await requestService.getRequests();
        setRequests(response);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load requests');
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, []);

  return (
    <section className="space-y-8">
      <div className="rounded-3xl bg-white p-8 shadow-soft">
        <h1 className="text-3xl font-bold text-slate-900">My Requests</h1>
        <p className="mt-2 text-slate-600">Review your emergency blood requests and their status.</p>
        {error && <p className="mt-4 rounded-2xl bg-red-100 px-4 py-3 text-sm text-red-700">{error}</p>}
        <div className="mt-8 grid gap-4">
          {loading ? (
            <p className="text-slate-600">Loading requests…</p>
          ) : requests.length === 0 ? (
            <p className="text-slate-600">No requests found yet.</p>
          ) : (
            requests.map((request) => (
              <div key={request._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-500">Blood Group</p>
                    <p className="mt-1 text-xl font-semibold text-slate-900">{request.bloodGroup}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${request.status === 'accepted' ? 'bg-green-100 text-green-700' : request.status === 'completed' ? 'bg-slate-100 text-slate-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {request.status}
                  </span>
                </div>
                <p className="mt-4 text-slate-600">{request.hospitalAddress}, {request.city}</p>
                <p className="mt-2 text-sm text-slate-500">{request.unitsRequired} unit(s) • {request.urgencyLevel}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default MyRequests;
