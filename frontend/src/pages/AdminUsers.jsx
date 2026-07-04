import { useEffect, useState } from 'react';
import adminService from '../services/adminService';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        setUsers(await adminService.getUsers());
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load users');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleToggleBlock = async (userId, currentStatus) => {
    try {
      await adminService.updateUserStatus(userId, !currentStatus);
      setUsers(users.map(u => u._id === userId ? { ...u, isBlocked: !currentStatus } : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status');
    }
  };

  return (
    <section className="space-y-8">
      <div className="rounded-3xl bg-white p-8 shadow-soft">
        <h1 className="text-3xl font-bold text-slate-900">Admin - Users</h1>
        <p className="mt-3 text-slate-600">Review registered donors and requesters, and take action on verification status.</p>
        {error && <p className="mt-4 rounded-2xl bg-red-100 px-4 py-3 text-sm text-red-700">{error}</p>}
        <div className="mt-8 grid gap-4">
          {loading ? (
            <p className="text-slate-600">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="text-slate-600">No users found.</p>
          ) : (
            users.map((user) => (
              <div key={user._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{user.name}</p>
                    <p className="text-sm text-slate-500">
                      {user.email} | {user.role} | {user.bloodGroup || 'No blood group'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleToggleBlock(user._id, user.isBlocked)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${user.isBlocked ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                    >
                      {user.isBlocked ? 'Unblock User' : 'Block User'}
                    </button>
                    <span className={`rounded-full px-4 py-2 text-sm font-semibold ${user.isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
                      {user.isVerified ? 'Verified' : 'Unverified'}
                    </span>
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

export default AdminUsers;
