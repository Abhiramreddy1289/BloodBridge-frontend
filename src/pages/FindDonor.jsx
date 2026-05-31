import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import donorService from '../services/donorService';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const hospitalIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [1, -34],
});

function MapResizer({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

function FindDonor() {
  const [searchParams, setSearchParams] = useState({ bloodGroup: '', radius: 20 });
  const [donors, setDonors] = useState([]);
  const [osmHospitals, setOsmHospitals] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
      });
    }
  }, []);

  const fetchOsmHospitals = async (lat, lon, rad) => {
    const radiusInMeters = rad * 1000;
    const query = `
      [out:json];
      (
        node["amenity"="hospital"](around:${radiusInMeters},${lat},${lon});
        way["amenity"="hospital"](around:${radiusInMeters},${lat},${lon});
        node["healthcare"="blood_bank"](around:${radiusInMeters},${lat},${lon});
      );
      out center;
    `;
    try {
      const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      const data = await response.json();
      setOsmHospitals(data.elements || []);
    } catch (err) {
      console.error('OSM Fetch failed:', err);
    }
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    if (!userLocation) {
      alert("Please allow location access to search nearby.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await donorService.searchDonors({
        bloodGroup: searchParams.bloodGroup,
        latitude: userLocation[0],
        longitude: userLocation[1],
        radius: searchParams.radius
      });
      setDonors(response);
      fetchOsmHospitals(userLocation[0], userLocation[1], searchParams.radius);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to search donors');
    } finally {
      setLoading(false);
    }
  };

  const mapCenter = userLocation || [20.5937, 78.9629];

  return (
    <section className="space-y-10">
      <div className="rounded-[2.5rem] bg-white p-8 sm:p-12 shadow-soft border border-slate-100">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-1 text-sm font-bold text-red-600">
              Radius Search
            </span>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Geo-Spatial Discovery</h1>
            <p className="text-lg text-slate-600 max-w-xl">
              Locate donors and blood banks within your immediate vicinity using real-time satellite data.
            </p>
          </div>
        </div>

        <form className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center" onSubmit={handleSearch}>
          <div className="relative flex-1">
            <select
              name="bloodGroup"
              value={searchParams.bloodGroup}
              onChange={(e) => setSearchParams({...searchParams, bloodGroup: e.target.value})}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 font-bold appearance-none"
            >
              <option value="">Any Blood Group</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>
          <div className="relative flex-1">
            <select
              name="radius"
              value={searchParams.radius}
              onChange={(e) => setSearchParams({...searchParams, radius: parseInt(e.target.value)})}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 font-bold appearance-none"
            >
              <option value={5}>Within 5 KM</option>
              <option value={10}>Within 10 KM</option>
              <option value={20}>Within 20 KM</option>
              <option value={50}>Within 50 KM</option>
            </select>
          </div>
          <button
            className="rounded-2xl bg-slate-900 px-10 py-4 text-white font-black uppercase tracking-widest transition hover:bg-red-600 active:scale-95 shadow-xl shadow-slate-200 disabled:bg-slate-300"
            type="submit"
            disabled={loading || !userLocation}
          >
            {loading ? 'Scanning...' : 'Find Nearby'}
          </button>
        </form>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <div className="h-[600px] rounded-[3rem] overflow-hidden shadow-soft border border-slate-100 relative">
            {!userLocation && (
              <div className="absolute inset-0 z-[10] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center text-white text-center p-10">
                <p className="text-xl font-bold">Please enable GPS to see nearby donors and hospitals.</p>
              </div>
            )}
            <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapResizer center={mapCenter} />
              
              {userLocation && (
                <Marker position={userLocation}>
                  <Popup><span className="font-bold">You are here</span></Popup>
                </Marker>
              )}

              {donors.map(donor => (
                <Marker key={donor._id} position={[donor.location.coordinates[1], donor.location.coordinates[0]]}>
                  <Popup>
                    <div className="font-bold">
                      <p className="text-red-600">{donor.bloodGroup} Donor</p>
                      <p>{donor.name}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {osmHospitals.map((h, i) => (
                <Marker 
                  key={i} 
                  position={[h.lat || h.center.lat, h.lon || h.center.lon]}
                  icon={hospitalIcon}
                >
                  <Popup>
                    <div className="font-bold">
                      <p className="text-blue-600">Hospital/Blood Bank</p>
                      <p>{h.tags.name || "Medical Facility"}</p>
                      <button 
                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${h.lat || h.center.lat},${h.lon || h.center.lon}`, '_blank')}
                        className="mt-2 w-full py-1 bg-slate-900 text-white rounded text-[10px]"
                      >
                        Directions
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {donors.map(donor => (
              <div key={donor._id} className="card-premium !p-8 group">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 group-hover:text-red-600 transition-colors">{donor.name}</h2>
                    <p className="text-slate-500 font-bold mt-1">{donor.city}</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center font-black text-red-600">
                    {donor.bloodGroup}
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                  <a href={`tel:${donor.phone}`} className="text-sm font-black text-slate-400 hover:text-red-600 transition-colors">Call Hero</a>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Available</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="rounded-[2.5rem] bg-slate-900 p-10 text-white">
            <h3 className="text-xl font-black mb-8 uppercase tracking-widest text-red-400">Map Legend</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 rounded-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
                <p className="font-bold text-slate-300">Registered Donors</p>
              </div>
              <div className="flex items-center gap-4">
                <img src="https://cdn-icons-png.flaticon.com/512/684/684908.png" className="w-5 h-5" alt="hospital" />
                <p className="font-bold text-slate-300">OSM Blood Banks/Hospitals</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 rounded-full bg-slate-100 shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                <p className="font-bold text-slate-300">Your Current Position</p>
              </div>
            </div>
            <div className="mt-12 p-6 bg-white/5 rounded-3xl border border-white/10">
              <p className="text-xs font-medium text-slate-400 leading-relaxed italic">
                "OSM data is powered by a community of mappers. For life-threatening emergencies, always verify the facility status via the Call button."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FindDonor;
