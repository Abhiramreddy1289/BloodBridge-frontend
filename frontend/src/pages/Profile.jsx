import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';
import donorService from '../services/donorService';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapPicker({ onLocationSelect, position }) {
  useMapEvents({
    click(e) {
      onLocationSelect([e.latlng.lng, e.latlng.lat]);
    },
  });

  return position ? <Marker position={[position[1], position[0]]} /> : null;
}

function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    availabilityStatus: user?.availabilityStatus ?? true,
    lastDonationDate: user?.lastDonationDate?.slice(0, 10) || '',
    coordinates: user?.location?.coordinates || null
  });
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        availabilityStatus: user.availabilityStatus ?? true,
        lastDonationDate: user.lastDonationDate?.slice(0, 10) || '',
        coordinates: user.location?.coordinates || null
      });
    }
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === 'availabilityStatus') {
      setForm({ ...form, availabilityStatus: value === 'available' });
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updatedUser = await donorService.updateAvailability(form);
      setUser((current) => ({ ...current, ...updatedUser }));
      setSuccess('Profile and availability updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please choose a valid image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Avatar image must be 5MB or smaller.');
      return;
    }

    setAvatarLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Unable to read selected image'));
        reader.readAsDataURL(file);
      });
      const updatedUser = await authService.updateAvatar(image);
      setUser((current) => ({ ...current, ...updatedUser }));
      setSuccess('Profile photo updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to update profile photo');
    } finally {
      setAvatarLoading(false);
      event.target.value = '';
    }
  };

  const mapCenter = form.coordinates ? [form.coordinates[1], form.coordinates[0]] : [20.5937, 78.9629];

  return (
    <section className="mx-auto max-w-4xl space-y-10">
      <div className="rounded-[2.5rem] bg-white p-8 sm:p-12 shadow-soft border border-slate-100">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Profile Settings</h1>
            <p className="text-lg text-slate-600">Manage your status and live availability location.</p>
          </div>
        </div>

        <form className="mt-10 grid gap-8" onSubmit={handleSubmit}>
          {success && <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-emerald-700 font-bold">{success}</div>}
          {error && <div className="rounded-2xl bg-red-50 border border-red-100 p-4 text-red-700 font-bold">{error}</div>}
          
          <div className="grid gap-8 rounded-3xl border border-slate-100 bg-slate-50/50 p-8">
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <div className="flex items-center gap-5">
                <div className="h-20 w-20 overflow-hidden rounded-3xl bg-red-50 shadow-inner">
                  {user?.avatar ? (
                    <img className="h-full w-full object-cover" src={user.avatar} alt={user.name || 'Profile avatar'} />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl font-black text-red-600">
                      {user?.name?.charAt(0)?.toUpperCase() || 'B'}
                    </div>
                  )}
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Identity</p>
                  <p className="text-xl font-bold text-slate-900">{user?.name || 'N/A'}</p>
                  <p className="text-sm font-medium text-slate-500">{user?.email}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-red-50 flex flex-col items-center justify-center shadow-inner">
                  <span className="text-xl font-black text-red-600">{user?.bloodGroup || '??'}</span>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user?.isVerified ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                    {user?.isVerified ? 'Verified' : 'Pending Verification'}
                  </span>
                </div>
                <label className="cursor-pointer rounded-2xl bg-slate-900 px-5 py-3 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-red-600">
                  {avatarLoading ? 'Uploading...' : 'Upload Photo'}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="sr-only"
                    disabled={avatarLoading}
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Availability Status
              <select
                name="availabilityStatus"
                value={form.availabilityStatus ? 'available' : 'unavailable'}
                onChange={handleChange}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-4 focus:ring-2 focus:ring-red-500/20 transition-all font-bold"
              >
                <option value="available">Ready for SOS Calls</option>
                <option value="unavailable">Currently Unavailable</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Last Donation Date
              <input
                name="lastDonationDate"
                type="date"
                value={form.lastDonationDate}
                onChange={handleChange}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-4 focus:ring-2 focus:ring-red-500/20 transition-all font-bold"
              />
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-700">Live Availability Location</h3>
              <p className="text-sm text-slate-500">Click on the map to set where you are currently available for donation.</p>
            </div>
            <div className="h-80 w-full rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-soft">
              <MapContainer center={mapCenter} zoom={12} scrollWheelZoom={false}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapPicker 
                  position={form.coordinates} 
                  onLocationSelect={(coords) => setForm(prev => ({ ...prev, coordinates: coords }))} 
                />
              </MapContainer>
            </div>
          </div>

          <button
            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-red-600 transition-all active:scale-95 disabled:bg-slate-300 disabled:cursor-not-allowed mt-4"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Save Profile Settings'}
          </button>
        </form>
      </div>
    </section>
  );
}

export default Profile;
