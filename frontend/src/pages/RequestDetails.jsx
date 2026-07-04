import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useAuth } from '../contexts/AuthContext';
import requestService from '../services/requestService';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function RequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [eta, setEta] = useState(30);

  const fetchRequest = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await requestService.getRequestById(id);
      setRequest(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load request details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const handleAccept = async () => {
    setActionLoading(true);
    try {
      await requestService.acceptRequest(id, eta);
      await fetchRequest();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    setActionLoading(true);
    try {
      await requestService.completeRequest(id);
      await fetchRequest();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this emergency request?')) return;
    setActionLoading(true);
    try {
      await requestService.updateRequestStatus(id, 'cancelled');
      await fetchRequest();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel request');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-xl font-bold text-slate-500 animate-pulse">Loading SOS details...</div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="mx-auto max-w-2xl text-center py-16 space-y-6">
        <div className="rounded-3xl bg-red-50 p-8 border border-red-100 text-red-700 font-bold">
          {error || 'Request not found'}
        </div>
        <Link to="/dashboard" className="inline-block rounded-full bg-slate-900 px-6 py-3 text-white font-bold hover:bg-slate-800">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const requesterId = request.requesterId?._id || request.requesterId;
  const isOwner = user && requesterId && user._id === requesterId;
  const donorId = request.donorId?._id || request.donorId;
  const isAssignedDonor = user && donorId && user._id === donorId;
  const isAdmin = user && user.role === 'admin';

  const checkCompatibility = (donorBg, patientBg) => {
    if (!donorBg || !patientBg) return false;
    if (donorBg === patientBg) return true;
    if (donorBg === 'O-') return true;
    if (donorBg === 'O+' && ['O+', 'A+', 'B+', 'AB+'].includes(patientBg)) return true;
    if (donorBg === 'A-' && ['A-', 'A+', 'AB-', 'AB+'].includes(patientBg)) return true;
    if (donorBg === 'A+' && ['A+', 'AB+'].includes(patientBg)) return true;
    if (donorBg === 'B-' && ['B-', 'B+', 'AB-', 'AB+'].includes(patientBg)) return true;
    if (donorBg === 'B+' && ['B+', 'AB+'].includes(patientBg)) return true;
    if (donorBg === 'AB-' && ['AB-', 'AB+'].includes(patientBg)) return true;
    return false;
  };

  const isCompatible = user ? checkCompatibility(user.bloodGroup, request.bloodGroup) : false;

  const hasLocation = request.location && request.location.coordinates && request.location.coordinates.length === 2;
  const hospitalPosition = hasLocation ? [request.location.coordinates[1], request.location.coordinates[0]] : null;

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-16">
      <Link to="/dashboard" className="text-sm font-bold text-slate-500 hover:text-red-600 flex items-center gap-2">
        Back to Dashboard
      </Link>

      <div className="card-premium relative overflow-hidden border border-slate-100 shadow-premium">
        {request.urgencyLevel === 'critical' && (
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 to-red-400 animate-pulse" />
        )}
        
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className={`h-2.5 w-2.5 rounded-full ${request.urgencyLevel === 'critical' ? 'bg-red-600 animate-ping' : 'bg-orange-500'}`} />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">{request.urgencyLevel} Urgency</span>
              <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${
                request.status === 'completed' ? 'bg-slate-100 text-slate-600' :
                request.status === 'on_the_way' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                request.status === 'cancelled' ? 'bg-red-50 text-red-700 border border-red-100' :
                'bg-yellow-50 text-yellow-700 border border-yellow-100'
              }`}>
                {request.status.replace('_', ' ')}
              </span>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">SOS Request Details</h1>
            <p className="mt-2 text-slate-500 font-medium">Broadcasted on {new Date(request.createdAt).toLocaleString()}</p>
          </div>
          <div className="flex flex-col items-center justify-center rounded-3xl glass-dark h-28 w-28 text-white shadow-2xl">
            <span className="text-xs uppercase tracking-widest text-red-400 font-bold">Needed</span>
            <span className="text-4xl font-black mt-1">{request.bloodGroup}</span>
          </div>
        </div>

        {hasLocation && (
          <div className="h-80 w-full mt-8 rounded-[2rem] overflow-hidden shadow-inner border border-slate-100">
            <MapContainer center={hospitalPosition} zoom={15} scrollWheelZoom={false}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={hospitalPosition}>
                <Popup>
                  <div className="font-bold">
                    <p className="text-red-600 uppercase tracking-widest text-[10px] mb-1">Target Hospital</p>
                    {request.hospitalName}
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        )}

        <div className="grid gap-8 py-8 md:grid-cols-2">
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Patient Name</h3>
              <p className="mt-1 text-xl font-bold text-slate-900">{request.patientName}</p>
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Units Needed</h3>
              <p className="mt-1 text-xl font-bold text-slate-900">{request.unitsRequired} Units</p>
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Hospital Name</h3>
              <p className="mt-1 text-xl font-bold text-slate-900">{request.hospitalName}</p>
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Hospital Address</h3>
              <p className="mt-1 text-base font-bold text-slate-600 leading-relaxed">{request.hospitalAddress}, {request.city}</p>
            </div>
          </div>

          <div className="space-y-6 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Contact Details</h3>
              {request.status === 'pending' && !isOwner && !isAdmin ? (
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                  Locked. Contact details are shared automatically after you accept this SOS.
                </p>
              ) : (
                <p className="mt-1 text-xl font-bold text-slate-900">{request.contactNumber}</p>
              )}
            </div>

            {request.donorId && (
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Assigned Donor</h3>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  {request.donorId.name || 'Anonymous Lifesaver'}
                </p>
                {request.donorETA && (
                  <p className="mt-1 text-sm text-emerald-600 font-bold">
                    ETA: {request.donorETA} minutes (Accepted at {new Date(request.acceptedAt).toLocaleTimeString()})
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Panel */}
        <div className="border-t border-slate-100 pt-8 mt-4 flex flex-col gap-6">
          {request.status === 'pending' && user?.role === 'donor' && (
            <div className="bg-red-50/30 border border-red-100/50 rounded-3xl p-6 space-y-6">
              <h3 className="text-xl font-black text-slate-900">Respond to SOS</h3>
              
              {!isCompatible && (
                <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4 text-amber-800 text-sm font-semibold">
                  Blood type mismatch. The patient needs <strong>{request.bloodGroup}</strong>, and you are registered as <strong>{user?.bloodGroup}</strong>. Only accept if medically compatible or instructed by a doctor.
                </div>
              )}

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
                <label className="text-sm font-bold text-slate-700 flex flex-col gap-2 flex-1">
                  Specify Your ETA (Minutes)
                  <select 
                    value={eta} 
                    onChange={(e) => setEta(parseInt(e.target.value))}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold"
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                    <option value={90}>90 Minutes</option>
                  </select>
                </label>

                <button 
                  onClick={handleAccept}
                  disabled={actionLoading}
                  className="btn-press self-end rounded-2xl bg-primary px-8 py-4 font-black uppercase tracking-widest text-white shadow-xl shadow-red-200 hover:bg-red-700 disabled:bg-red-300"
                >
                  {actionLoading ? 'Accepting...' : 'Accept & Deploy'}
                </button>
              </div>
            </div>
          )}

          {request.status === 'on_the_way' && (isOwner || isAdmin) && (
            <div className="flex gap-4">
              <button 
                onClick={handleComplete}
                disabled={actionLoading}
                className="btn-press flex-1 rounded-2xl bg-emerald-600 py-4 font-black uppercase tracking-widest text-white hover:bg-emerald-700 shadow-xl shadow-emerald-200"
              >
                Mark Donation Completed
              </button>
            </div>
          )}

          {(isOwner || isAdmin) && request.status !== 'completed' && request.status !== 'cancelled' && (
            <button 
              onClick={handleCancel}
              disabled={actionLoading}
              className="btn-press text-sm font-bold text-red-500 hover:text-red-700 self-center transition-colors"
            >
              Cancel This SOS Request
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default RequestDetails;
