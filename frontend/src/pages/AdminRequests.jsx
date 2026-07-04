import { useEffect, useState } from 'react';
import adminService from '../services/adminService';

function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      setRequests(await adminService.getRequests());
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await adminService.updateRequestStatus(id, status);
      setRequests(requests.map(r => r._id === id ? { ...r, status } : r));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Remove this blood request?')) return;

    try {
      await adminService.deleteRequest(id);
      setRequests((current) => current.filter((request) => request._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to remove request');
    }
  };

  return (
    <section className="space-y-8">
      <div className="rounded-3xl bg-white p-8 shadow-soft">
        <h1 className="text-3xl font-bold text-slate-900">Admin - Requests</h1>
        <p className="mt-3 text-slate-600">Manage pending requests and remove fake or invalid emergency posts.</p>
        {error && <p className="mt-4 rounded-2xl bg-red-100 px-4 py-3 text-sm text-red-700">{error}</p>}
        <div className="mt-8 grid gap-4">
          {loading ? (
            <p className="text-slate-600">Loading requests...</p>
          ) : requests.length === 0 ? (
            <p className="text-slate-600">No requests found.</p>
          ) : (
            requests.map((request) => (
              <div key={request._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{request.bloodGroup} request for {request.hospitalName}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        request.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                        request.status === 'cancelled' ? 'bg-slate-200 text-slate-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {request.status}
                      </span>
                      <p className="text-sm text-slate-500">
                        {request.city} | {request.unitsRequired} unit(s)
                      </p>
                      {request.duration && (
                        <span className="text-xs font-bold text-slate-400">Duration: {request.duration} mins</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {request.status !== 'completed' && request.status !== 'cancelled' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(request._id, 'completed')}
                          className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-600"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(request._id, 'cancelled')}
                          className="rounded-full bg-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-300"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleRemove(request._id)}
                      className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50 hover:border-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default AdminRequests;
