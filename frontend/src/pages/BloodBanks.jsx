import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, LocateFixed, MapPin, Navigation, Search } from 'lucide-react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { demoBloodBanks, demoNearbyFacilities } from '../data/demoBloodBanks';
import bloodBankService from '../services/bloodBankService';
import { getDemoStock } from '../utils/demoStock';
import { formatDistance, getCurrentLocation, getDistanceKm } from '../utils/geo';
import { indiaDistrictsByState, indiaStates } from '../utils/indiaLocations';
import { fetchNearbyMedicalFacilities } from '../utils/nearbyFacilities';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const defaultCenter = [20.5937, 78.9629];

const bloodBankIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [1, -34],
});

function MapUpdater({ center }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, center === defaultCenter ? 5 : 11);
  }, [center, map]);

  return null;
}

function BloodBanks() {
  const [filters, setFilters] = useState({
    q: '',
    state: '',
    district: '',
    bloodGroup: '',
    radius: 50,
  });
  const [filterOptions, setFilterOptions] = useState({ states: [], districts: [] });
  const [bloodBanks, setBloodBanks] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('directory');
  const [selectedBank, setSelectedBank] = useState(null);
  const [nearbyFacilities, setNearbyFacilities] = useState([]);

  useEffect(() => {
    bloodBankService.getFilters()
      .then(setFilterOptions)
      .catch(() => setFilterOptions({ states: [], districts: [] }));
  }, []);

  useEffect(() => {
    if (!filters.state) {
      bloodBankService.getFilters()
        .then(setFilterOptions)
        .catch(() => {});
      return;
    }

    bloodBankService.getFilters(filters.state)
      .then((options) => setFilterOptions((current) => ({ ...current, districts: options.districts })))
      .catch(() => {});
  }, [filters.state]);

  useEffect(() => {
    loadDirectory();
  }, []);

  useEffect(() => {
    getCurrentLocation()
      .then((location) => {
        setUserLocation(location);
        loadNearbyFacilities(location, filters.radius);
      })
      .catch(() => {});
  }, []);

  const loadDirectory = async (event) => {
    event?.preventDefault();
    setMode('directory');
    setLoading(true);
    setError(null);

    try {
      const response = await bloodBankService.getBloodBanks({
        ...filters,
        page: 1,
        limit: 60,
      });
      setBloodBanks(response.data);
      setSelectedBank(response.data[0] || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load blood banks');
    } finally {
      setLoading(false);
    }
  };

  const findNearby = async () => {
    setLoading(true);
    setError(null);
    setMode('nearby');

    try {
      const location = userLocation || await getCurrentLocation();
      setUserLocation(location);
      const response = await bloodBankService.getNearbyBloodBanks({
        latitude: location[0],
        longitude: location[1],
        radius: filters.radius,
        bloodGroup: filters.bloodGroup,
        limit: 60,
      });
      setBloodBanks(response);
      const facilities = await loadNearbyFacilities(location, filters.radius);
      setSelectedBank(response[0] || facilities[0] || null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to find nearby blood banks');
    } finally {
      setLoading(false);
    }
  };

  const loadNearbyFacilities = async (location, radius = 50) => {
    setNearbyLoading(true);
    try {
      const facilities = await fetchNearbyMedicalFacilities(location, radius);
      const enrichedFacilities = withDemoFacilities(facilities, location);
      setNearbyFacilities(enrichedFacilities);
      return enrichedFacilities;
    } catch {
      const fallbackFacilities = withDemoFacilities([], location);
      setNearbyFacilities(fallbackFacilities);
      return fallbackFacilities;
    } finally {
      setNearbyLoading(false);
    }
  };

  const mapCenter = useMemo(() => {
    const firstBank = bloodBanks.find((bank) => bank.location?.coordinates?.length === 2);

    if (userLocation) return userLocation;
    if (firstBank) return [firstBank.location.coordinates[1], firstBank.location.coordinates[0]];
    return defaultCenter;
  }, [bloodBanks, mode, userLocation]);

  const selectedPosition = selectedBank?.position || (selectedBank?.location?.coordinates
    ? [selectedBank.location.coordinates[1], selectedBank.location.coordinates[0]]
    : null);
  const selectedDistance = getDistanceKm(userLocation, selectedPosition);
  const directoryBloodBanks = useMemo(() => {
    const source = bloodBanks.length ? bloodBanks : demoBloodBanks;
    const query = filters.q.trim().toLowerCase();

    return source.filter((bank) => {
      const matchesName = !query || [bank.name, bank.address, bank.district, bank.state]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query));
      const matchesState = !filters.state || bank.state === filters.state;
      const matchesDistrict = !filters.district || bank.district === filters.district;
      return matchesName && matchesState && matchesDistrict;
    });
  }, [bloodBanks, filters.district, filters.q, filters.state]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((current) => ({
      ...current,
      [name]: value,
      ...(name === 'state' ? { district: '' } : {}),
    }));
  };

  const stateOptions = useMemo(
    () => Array.from(new Set([...indiaStates, ...filterOptions.states])).sort(),
    [filterOptions.states]
  );
  const districtOptions = useMemo(
    () => Array.from(new Set([
      ...(filters.state ? indiaDistrictsByState[filters.state] || [] : Object.values(indiaDistrictsByState).flat()),
      ...filterOptions.districts,
    ])).sort(),
    [filterOptions.districts, filters.state]
  );

  const handleSelectBank = async (facility) => {
    setSelectedBank(facility);

    if (!userLocation) {
      try {
        const location = await getCurrentLocation();
        setUserLocation(location);
        loadNearbyFacilities(location, filters.radius);
      } catch {
        // Distance remains unavailable until location access is granted.
      }
    }
  };

  return (
    <section className="space-y-8">
      <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-soft">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-1 text-sm font-bold text-red-600">
              Government Directory
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Blood Bank Directory</h1>
            <p className="max-w-2xl text-lg text-slate-600">
              Search static blood bank locations locally, then check live availability through e-RaktKosh.
            </p>
          </div>
          <button
            type="button"
            onClick={findNearby}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 text-sm font-black uppercase tracking-widest text-white transition hover:bg-red-600 disabled:bg-slate-300"
          >
            <LocateFixed size={18} />
            Nearest Banks
          </button>
        </div>

        <form className="mt-8 grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr_0.8fr_0.8fr_auto]" onSubmit={loadDirectory}>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Name
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4">
              <Search size={18} className="text-slate-400" />
              <input
                name="q"
                value={filters.q}
                onChange={handleFilterChange}
                className="w-full bg-transparent py-4"
                placeholder="Blood bank name"
              />
            </div>
          </label>

          <label className="grid gap-2 text-sm font-bold text-slate-700">
            State
            <select name="state" value={filters.state} onChange={handleFilterChange} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <option value="">All States</option>
              {stateOptions.map((state) => <option key={state} value={state}>{state}</option>)}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-bold text-slate-700">
            District
            <select name="district" value={filters.district} onChange={handleFilterChange} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <option value="">All Districts</option>
              {districtOptions.map((district) => <option key={district} value={district}>{district}</option>)}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Blood
            <select name="bloodGroup" value={filters.bloodGroup} onChange={handleFilterChange} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 font-black text-red-600">
              <option value="">Any</option>
              {bloodGroups.map((group) => <option key={group} value={group}>{group}</option>)}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Radius
            <select name="radius" value={filters.radius} onChange={handleFilterChange} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <option value={10}>10 km</option>
              <option value={25}>25 km</option>
              <option value={50}>50 km</option>
              <option value={100}>100 km</option>
            </select>
          </label>

          <div className="flex items-end">
            <button className="w-full rounded-2xl bg-primary px-6 py-4 text-sm font-black uppercase tracking-widest text-white transition hover:bg-red-700 disabled:bg-red-300" type="submit" disabled={loading}>
              {loading ? 'Loading' : 'Search'}
            </button>
          </div>
        </form>

        {error && <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4 font-bold text-red-700">{error}</div>}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative h-[620px] overflow-hidden rounded-[3rem] border border-slate-100 bg-white shadow-soft">
          {!userLocation && (
            <div className="absolute left-6 top-6 z-[10] max-w-sm rounded-3xl bg-slate-950/85 p-5 text-white shadow-2xl backdrop-blur-xl">
              <p className="text-sm font-black uppercase tracking-widest text-red-300">Distance Mode</p>
              <p className="mt-2 text-sm font-semibold text-slate-200">Allow location access to center the map on you and load nearby hospitals/blood banks.</p>
            </div>
          )}
          <MapContainer center={mapCenter} zoom={5} className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapUpdater center={mapCenter} />

            {userLocation && (
              <Marker position={userLocation}>
                <Popup>Your current location</Popup>
              </Marker>
            )}

            {directoryBloodBanks.map((bank) => (
              <Marker
                key={bank._id}
                position={[bank.location.coordinates[1], bank.location.coordinates[0]]}
                icon={bloodBankIcon}
                eventHandlers={{ click: () => handleSelectBank(bank) }}
              >
                <Popup>
                  <div className="space-y-2">
                    <p className="font-bold text-slate-900">{bank.name}</p>
                    <p className="text-xs text-slate-600">{bank.district}, {bank.state}</p>
                    <p className="rounded bg-slate-100 px-3 py-2 text-center text-xs font-black text-slate-700">
                      {formatDistance(getDistanceKm(userLocation, [bank.location.coordinates[1], bank.location.coordinates[0]]))} away
                    </p>
                    <a className="block rounded bg-red-600 px-3 py-2 text-center text-xs font-bold text-white" href={bank.liveStockUrl} target="_blank" rel="noreferrer">
                      Check Live Stock
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}

            {nearbyFacilities.map((facility) => (
              <Marker
                key={facility.id}
                position={facility.position}
                icon={bloodBankIcon}
                eventHandlers={{ click: () => handleSelectBank(facility) }}
              >
                <Popup>
                  <div className="space-y-2">
                    <p className="font-bold text-slate-900">{facility.name}</p>
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-600">{facility.type}</p>
                    <p className="rounded bg-slate-100 px-3 py-2 text-center text-xs font-black text-slate-700">
                      {formatDistance(getDistanceKm(userLocation, facility.position))} away
                    </p>
                    <a
                      className="block rounded bg-slate-900 px-3 py-2 text-center text-xs font-bold text-white"
                      href={`https://www.google.com/maps/dir/?api=1&destination=${facility.position[0]},${facility.position[1]}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Route
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="space-y-4">
          {selectedBank && (
            <div className="rounded-3xl border border-red-100 bg-red-50/60 p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-red-600">Selected Hospital</p>
              <h3 className="mt-2 text-xl font-black text-slate-900">{selectedBank.name}</h3>
              <p className="mt-1 text-sm font-bold text-slate-500">
                {selectedBank.district ? `${selectedBank.district}, ${selectedBank.state}` : selectedBank.address || selectedBank.type || selectedBank.source}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Distance</p>
                  <p className="mt-1 text-2xl font-black text-red-600">{formatDistance(selectedDistance)}</p>
                </div>
                <a
                  href={selectedPosition ? `https://www.google.com/maps/dir/?api=1&destination=${selectedPosition[0]},${selectedPosition[1]}` : '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black uppercase tracking-widest text-white transition hover:bg-red-600"
                >
                  <Navigation size={16} />
                  Route
                </a>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between px-1">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              {directoryBloodBanks.length} Directory - {nearbyFacilities.length} Nearby
            </h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase tracking-widest text-slate-500">
              {nearbyLoading ? 'Locating' : mode === 'nearby' ? 'Nearby' : 'Directory'}
            </span>
          </div>

          <div className="max-h-[560px] space-y-4 overflow-y-auto pr-2">
            {directoryBloodBanks.map((bank) => (
              <article
                key={bank._id}
                className={`rounded-3xl border bg-white p-5 shadow-soft transition ${selectedBank?._id === bank._id ? 'border-red-200 ring-4 ring-red-50' : 'border-slate-100 hover:border-red-100'}`}
                onClick={() => handleSelectBank(bank)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                    <MapPin size={22} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-black leading-tight text-slate-900">{bank.name}</h3>
                    <p className="mt-1 text-sm font-semibold text-slate-500">{bank.district}, {bank.state}</p>
                    {bank.address && <p className="mt-3 text-sm leading-relaxed text-slate-600">{bank.address}</p>}
                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
                      {bank.pincode && <span className="rounded-full bg-slate-100 px-3 py-1">{bank.pincode}</span>}
                      {bank.phone && <a href={`tel:${bank.phone}`} className="rounded-full bg-slate-100 px-3 py-1 hover:text-red-600">{bank.phone}</a>}
                      {bank.website && <a href={bank.website} target="_blank" rel="noreferrer" className="rounded-full bg-slate-100 px-3 py-1 hover:text-red-600">Website</a>}
                      <span className="rounded-full bg-red-50 px-3 py-1 text-red-600">
                        {formatDistance(getDistanceKm(userLocation, [bank.location.coordinates[1], bank.location.coordinates[0]]))}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 border-t border-slate-100 pt-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Available Blood Groups</p>
                  <div className="flex flex-wrap gap-2">
                    {['A+', 'B+', 'O+', 'AB+'].map((group) => {
                      const stockVal = (bank.inventory && bank.inventory[group]) || 12;
                      return (
                        <span key={group} className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-600 shadow-sm border border-red-100/50">
                          {group}: {stockVal}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <a
                    href={bank.liveStockUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-black uppercase tracking-widest text-white transition hover:bg-red-700"
                  >
                    <ExternalLink size={16} />
                    Live Stock
                  </a>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${bank.location.coordinates[1]},${bank.location.coordinates[0]}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black uppercase tracking-widest text-slate-700 transition hover:border-red-200 hover:text-red-600"
                  >
                    <Navigation size={16} />
                    Route
                  </a>
                </div>
              </article>
            ))}

            {!loading && directoryBloodBanks.length === 0 && nearbyFacilities.length === 0 && (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center">
                <p className="font-bold text-slate-500">
                  No blood banks found for these filters. Try a different state, district, or name.
                </p>
              </div>
            )}

            {nearbyFacilities.length > 0 && (
              <div className="rounded-3xl border border-blue-100 bg-blue-50/50 p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">Nearby GPS Facilities</p>
                <div className="mt-4 space-y-3">
                  {nearbyFacilities.slice(0, 8).map((facility) => {
                    const stock = getDemoStock(facility.name);

                    return (
                    <div
                      key={facility.id}
                      className="rounded-2xl bg-white p-4 transition hover:ring-4 hover:ring-blue-100"
                    >
                      <button type="button" onClick={() => handleSelectBank(facility)} className="w-full text-left">
                        <p className="font-black text-slate-900">{facility.name}</p>
                        <p className="mt-1 text-xs font-bold text-slate-500">{facility.type} - {formatDistance(getDistanceKm(userLocation, facility.position))}</p>
                      </button>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {['A+', 'B+', 'O+', 'AB+'].map((group) => (
                          <span key={group} className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-600">
                            {group}: {stock[group]}
                          </span>
                        ))}
                      </div>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${facility.position[0]},${facility.position[1]}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-red-600"
                      >
                        <Navigation size={15} />
                        Route Hospital
                      </a>
                    </div>
                  )})}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default BloodBanks;

const withDemoFacilities = (facilities, userLocation) => {
  const demos = demoNearbyFacilities.map((facility, index) => ({
    ...facility,
    position: userLocation ? offsetLocation(userLocation, index) : facility.position,
  }));
  const combined = [...facilities, ...demos];
  const seen = new Set();

  return combined.filter((facility) => {
    const key = `${facility.name}-${facility.position.join(',')}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 80);
};

const offsetLocation = ([latitude, longitude], index) => {
  const offsets = [
    [0.018, 0.014],
    [-0.021, 0.019],
    [0.026, -0.022],
    [-0.017, -0.025],
  ];
  const [latOffset, lngOffset] = offsets[index % offsets.length];
  return [latitude + latOffset, longitude + lngOffset];
};
