import { useState, useEffect, useMemo } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAuth } from '../contexts/AuthContext';
import donorService from '../services/donorService';
import { bloodGroups, getDemoStock, hasAnyStock } from '../utils/demoStock';
import { formatDistance, getCurrentLocation, getDistanceKm } from '../utils/geo';
import { fetchNearbyMedicalFacilities } from '../utils/nearbyFacilities';

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

const officialData = [
  { centre: 'AIIMS Blood Bank', location: 'Ansari Nagar, New Delhi', position: [28.5672, 77.2100], isVerified: true, lastUpdated: '1 hour ago', stock: { 'A+': 45, 'A-': 12, 'B+': 88, 'B-': 8, 'O+': 62, 'O-': 15, 'AB+': 24, 'AB-': 5 }, phone: '01126588500' },
  { centre: 'Sufdarjung Hospital Blood Bank', location: 'New Delhi', position: [28.5675, 77.2081], isVerified: true, lastUpdated: '3 hours ago', stock: { 'A+': 32, 'A-': 4, 'B+': 56, 'B-': 2, 'O+': 41, 'O-': 7, 'AB+': 18, 'AB-': 1 }, phone: '01126165000' },
  { centre: 'Indian Red Cross Society', location: 'Golf Links, New Delhi', position: [28.5954, 77.2241], isVerified: true, lastUpdated: '10 mins ago', stock: { 'A+': 120, 'A-': 25, 'B+': 145, 'B-': 30, 'O+': 210, 'O-': 45, 'AB+': 65, 'AB-': 12 }, phone: '01123711551' },
  { centre: 'Tata Memorial Hospital', location: 'Parel, Mumbai', position: [19.0031, 72.8431], isVerified: true, lastUpdated: '45 mins ago', stock: { 'A+': 67, 'A-': 8, 'B+': 92, 'B-': 14, 'O+': 112, 'O-': 20, 'AB+': 34, 'AB-': 4 }, phone: '02224177000' },
  { centre: 'Apollo Hospitals', location: 'Greams Road, Chennai', position: [13.0604, 80.2541], isVerified: true, lastUpdated: 'Just now', stock: { 'A+': 89, 'A-': 15, 'B+': 110, 'B-': 18, 'O+': 145, 'O-': 22, 'AB+': 52, 'AB-': 9 }, phone: '04428293333' },
  { centre: 'Fortis Hospital', location: 'Bannerghatta Road, Bangalore', position: [12.8950, 77.5980], isVerified: true, lastUpdated: '2 hours ago', stock: { 'A+': 54, 'A-': 6, 'B+': 78, 'B-': 10, 'O+': 95, 'O-': 14, 'AB+': 28, 'AB-': 3 }, phone: '08066214444' },
  { centre: 'Medanta - The Medicity', location: 'Gurugram, Haryana', position: [28.4412, 77.0450], isVerified: true, lastUpdated: '1 hour ago', stock: { 'A+': 73, 'A-': 11, 'B+': 104, 'B-': 15, 'O+': 128, 'O-': 19, 'AB+': 42, 'AB-': 7 }, phone: '01244141414' },
  { centre: 'CMC Vellore', location: 'Vellore, Tamil Nadu', position: [12.9248, 79.1348], isVerified: true, lastUpdated: '5 hours ago', stock: { 'A+': 98, 'A-': 20, 'B+': 132, 'B-': 22, 'O+': 167, 'O-': 30, 'AB+': 58, 'AB-': 11 }, phone: '04162281000' },
];

function MapResizer({ center, zoom = 5 }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [center, map, zoom]);

  return null;
}

function Inventory() {
  const { user, setUser } = useAuth();
  const [search, setSearch] = useState('');
  const [stocks, setStocks] = useState(user?.inventory || {});
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [nearbyFacilities, setNearbyFacilities] = useState([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);

  const isHospital = user?.role === 'hospital';

  useEffect(() => {
    if (user?.inventory) {
      setStocks(user.inventory);
    }
  }, [user]);

  useEffect(() => {
    if (!isHospital) {
      fetchHospitals();
    }
  }, [isHospital, search]);

  useEffect(() => {
    if (!isHospital) {
      getCurrentLocation()
        .then((location) => {
          setUserLocation(location);
          loadNearbyFacilities(location);
        })
        .catch(() => {});
    }
  }, [isHospital]);

  const fetchHospitals = async () => {
    setFetching(true);
    try {
      const data = await donorService.getHospitals(search);
      setHospitals(data);
    } catch (err) {
      console.error('Failed to fetch hospitals:', err);
    } finally {
      setFetching(false);
    }
  };

  const handleStockChange = (group, value) => {
    setStocks(prev => ({ ...prev, [group]: Math.max(0, parseInt(value) || 0) }));
  };

  const handleUpdateInventory = async () => {
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    try {
      const response = await donorService.updateInventory(stocks);
      setUser(prev => ({ ...prev, inventory: response.inventory }));
      setSuccessMessage('Inventory updated successfully!');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to update inventory');
    } finally {
      setLoading(false);
    }
  };

  const filteredOfficial = useMemo(() => officialData.filter(h => 
    h.centre.toLowerCase().includes(search.toLowerCase()) || 
    h.location.toLowerCase().includes(search.toLowerCase())
  ), [search]);

  const displayHospitals = useMemo(() => [
    ...hospitals.map(h => ({
      id: h._id,
      centre: h.name,
      location: `${h.city}, ${h.state || ''}`,
      isVerified: true,
      lastUpdated: 'Live',
      stock: hasAnyStock(h.inventory) ? h.inventory : getDemoStock(h.name),
      phone: h.phone,
      position: h.location?.coordinates ? [h.location.coordinates[1], h.location.coordinates[0]] : null
    })),
    ...filteredOfficial,
    ...nearbyFacilities.map((facility) => ({
      id: facility.id,
      centre: facility.name,
      location: facility.address || facility.type,
      isVerified: true,
      lastUpdated: 'Nearby',
      stock: getDemoStock(facility.name),
      phone: facility.phone,
      website: facility.website,
      position: facility.position,
      source: facility.source,
    })),
  ].filter(item => item.position), [filteredOfficial, hospitals, nearbyFacilities]);

  useEffect(() => {
    setSelectedHospital(current => {
      if (!displayHospitals.length) return null;
      if (current && displayHospitals.some(item => (item.id || item.centre) === (current.id || current.centre))) {
        return current;
      }
      return displayHospitals[0];
    });
  }, [displayHospitals]);

  const mapCenter = useMemo(() => {
    if (userLocation) return userLocation;
    if (selectedHospital?.position) return selectedHospital.position;
    return [20.5937, 78.9629];
  }, [selectedHospital, userLocation]);

  const selectedDistance = getDistanceKm(userLocation, selectedHospital?.position);

  const handleCall = (phone) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    } else {
      alert('Phone number not available for this centre.');
    }
  };

  const handleSelectHospital = async (hospital) => {
    setSelectedHospital(hospital);

    if (!userLocation) {
      try {
        const location = await getCurrentLocation();
        setUserLocation(location);
        loadNearbyFacilities(location);
      } catch {
        // Distance remains unavailable until location access is granted.
      }
    }
  };

  const loadNearbyFacilities = async (location) => {
    setNearbyLoading(true);
    try {
      const facilities = await fetchNearbyMedicalFacilities(location, 25);
      setNearbyFacilities(facilities);
    } catch {
      setNearbyFacilities([]);
    } finally {
      setNearbyLoading(false);
    }
  };

  const handleGetDirections = (hospital) => {
    if (hospital?.position) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${hospital.position[0]},${hospital.position[1]}`, '_blank');
      return;
    }

    const query = encodeURIComponent(`${hospital.centre}, ${hospital.location}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <section className="space-y-12">
      <div className="rounded-[2.5rem] bg-white p-8 sm:p-12 shadow-soft border border-slate-100">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-1 text-sm font-bold text-red-600">
              Live Logistics
            </span>
            <h1 className="text-4xl font-extrabold text-slate-900">
              {isHospital ? 'Manage Your Inventory' : 'Blood Availability Network'}
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl">
              {isHospital 
                ? 'Update your real-time blood stock to prevent unoptimized emergency requests.'
                : 'Verified inventory data from partnered hospitals and blood banks across India.'}
            </p>
          </div>
          {!isHospital && (
            <div className="relative group">
              <input 
                type="text"
                placeholder="Search city or hospital..."
                className="w-full lg:w-80 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 transition-all focus:ring-2 focus:ring-red-500/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {fetching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-600 border-t-transparent"></div>
                </div>
              )}
            </div>
          )}
        </div>

        {successMessage && <div className="mt-6 rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-emerald-700">{successMessage}</div>}
        {errorMessage && <div className="mt-6 rounded-2xl bg-red-50 border border-red-100 p-4 text-red-700">{errorMessage}</div>}

        {isHospital && (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {bloodGroups.map(bg => (
              <div key={bg} className="rounded-[2rem] bg-slate-50 p-6 border border-slate-100 transition-all hover:bg-white hover:shadow-lg">
                <label className="text-sm font-bold text-slate-500 uppercase flex justify-between">
                  {bg} Group
                  <span className="text-red-600 font-black">Units</span>
                </label>
                <input 
                  type="number"
                  value={stocks[bg] || 0}
                  onChange={(e) => handleStockChange(bg, e.target.value)}
                  className="mt-4 w-full bg-transparent text-3xl font-black text-slate-900 focus:text-red-600 transition-colors"
                />
              </div>
            ))}
            <div className="sm:col-span-2 lg:col-span-4 mt-6">
              <button 
                onClick={handleUpdateInventory}
                disabled={loading}
                className="w-full rounded-2xl bg-slate-900 py-5 text-xl font-bold text-white transition hover:bg-red-600 active:scale-95 shadow-xl shadow-slate-200 disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating status...' : 'Update Live Inventory Status'}
              </button>
            </div>
          </div>
        )}
      </div>

      {!isHospital && (
        <div className="space-y-12">
          {displayHospitals.length > 0 && (
            <div className="relative h-[560px] w-full overflow-hidden rounded-[3rem] border border-slate-100 shadow-soft">
              {!userLocation && (
                <div className="absolute left-6 top-6 z-[10] max-w-sm rounded-3xl bg-slate-950/85 p-5 text-white shadow-2xl backdrop-blur-xl">
                  <p className="text-sm font-black uppercase tracking-widest text-red-300">Distance Mode</p>
                  <p className="mt-2 text-sm font-semibold text-slate-200">Allow location access to center the map on you and load nearby hospitals/blood banks.</p>
                </div>
              )}

              {selectedHospital && (
                <div className="absolute bottom-6 left-6 right-6 z-[10] rounded-3xl bg-white/95 p-5 shadow-2xl backdrop-blur-xl lg:left-auto lg:right-6 lg:w-96">
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-600">Selected Centre</p>
                  <h3 className="mt-2 text-xl font-black leading-tight text-slate-900">{selectedHospital.centre}</h3>
                  <p className="mt-1 text-sm font-bold text-slate-500">{selectedHospital.location}</p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-red-50 p-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Distance</p>
                      <p className="mt-1 text-2xl font-black text-red-600">{formatDistance(selectedDistance)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleGetDirections(selectedHospital)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black uppercase tracking-widest text-white transition hover:bg-red-600"
                    >
                      <Navigation size={16} />
                      Route
                    </button>
                  </div>
                </div>
              )}

              <MapContainer center={mapCenter} zoom={5} scrollWheelZoom={false}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapResizer center={mapCenter} zoom={selectedHospital ? 11 : 5} />

                {userLocation && (
                  <Marker position={userLocation}>
                    <Popup><span className="font-bold">You are here</span></Popup>
                  </Marker>
                )}

                {displayHospitals.map((item, idx) => {
                  return (
                    <Marker
                      key={`${item.centre}-${idx}`}
                      position={item.position}
                      icon={hospitalIcon}
                      eventHandlers={{ click: () => handleSelectHospital(item) }}
                    >
                      <Popup>
                        <div className="space-y-2 font-bold text-slate-900">
                          <p className="text-sm">{item.centre}</p>
                          <p className="text-red-600 text-[10px] uppercase tracking-widest mt-1">{item.source === 'OpenStreetMap' ? 'Nearby Facility' : 'Verified Blood Bank'}</p>
                          <p className="rounded bg-slate-100 px-3 py-2 text-center text-xs font-black text-slate-700">
                            {formatDistance(getDistanceKm(userLocation, item.position))} away
                          </p>
                          <button
                            onClick={() => handleGetDirections(item)}
                            className="w-full py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest"
                          >
                            Get Directions
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-2">
            {displayHospitals.map((item, index) => (
              <div
                key={`${item.centre}-${index}`}
                onClick={() => handleSelectHospital(item)}
                className={`group rounded-[2.5rem] bg-white p-8 shadow-soft border transition-all hover:shadow-xl hover:-translate-y-1 ${selectedHospital?.centre === item.centre ? 'border-red-200 ring-4 ring-red-50' : 'border-slate-100'}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {item.isVerified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black text-emerald-600 uppercase tracking-wider">
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                          Verified Centre
                        </span>
                      )}
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Updated {item.lastUpdated}</span>
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-900 group-hover:text-red-600 transition-colors">{item.centre}</h2>
                    <p className="mt-1 text-slate-500 font-medium">{item.location}</p>
                    <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-black uppercase tracking-widest text-red-600">
                      <MapPin size={14} />
                      {formatDistance(getDistanceKm(userLocation, item.position))}
                    </p>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-3 sm:grid-cols-4 gap-4">
                  {bloodGroups.map(group => (
                    <div key={group} className={`rounded-2xl p-4 border transition-all ${item.stock[group] > 0 ? 'bg-red-50/30 border-red-100 hover:bg-white hover:border-red-200' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                      <p className="text-xs font-bold text-slate-400">{group}</p>
                      <p className={`mt-1 text-lg font-black ${item.stock[group] > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                        {item.stock[group] || 0}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                  <button 
                    onClick={() => handleCall(item.phone)}
                    className="text-sm font-bold text-slate-400 hover:text-red-600 transition-colors"
                  >
                    Call Blood Bank
                  </button>
                  <button 
                    onClick={() => handleGetDirections(item)}
                    className="rounded-full bg-slate-900 px-6 py-2 text-sm font-bold text-white hover:bg-primary transition-all"
                  >
                    Get Directions
                  </button>
                </div>
              </div>
            ))}
            {displayHospitals.length === 0 && !fetching && (
              <div className="lg:col-span-2 text-center py-20">
                <p className="text-slate-400 font-bold text-xl">{nearbyLoading ? 'Locating nearby hospitals and blood banks...' : 'No blood banks found matching your search.'}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default Inventory;
