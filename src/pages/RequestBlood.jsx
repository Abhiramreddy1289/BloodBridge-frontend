import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import requestService from '../services/requestService';

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

const loadGoogleMapsScript = (callback) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    callback(false);
    return;
  }

  const existingScript = document.getElementById('googleMapsScript');
  if (existingScript) {
    if (window.google) callback(true);
    else {
      existingScript.addEventListener('load', () => callback(true));
      existingScript.addEventListener('error', () => callback(false));
    }
    return;
  }

  const script = document.createElement('script');
  script.id = 'googleMapsScript';
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
  script.async = true;
  script.defer = true;
  script.onload = () => callback(true);
  script.onerror = () => callback(false);
  document.head.appendChild(script);
};

function RequestBlood() {
  const [form, setForm] = useState({
    patientName: '',
    bloodGroup: '',
    unitsRequired: 1,
    urgencyLevel: 'medium',
    hospitalName: '',
    hospitalAddress: '',
    city: '',
    contactNumber: '',
    coordinates: null,
  });
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const hospitalInputRef = useRef(null);
  const addressInputRef = useRef(null);
  const osmTimeoutRef = useRef(null);
  const osmAddressTimeoutRef = useRef(null);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchingOSM, setSearchingOSM] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [searchingAddressOSM, setSearchingAddressOSM] = useState(false);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setForm(prev => ({
          ...prev,
          coordinates: [position.coords.longitude, position.coords.latitude]
        }));
      });
    }
  }, []);

  useEffect(() => {
    loadGoogleMapsScript((success) => {
      setGoogleLoaded(success);
      if (success && window.google) {
        // Autocomplete for Hospital Name
        if (hospitalInputRef.current) {
          const hospitalAutocomplete = new window.google.maps.places.Autocomplete(hospitalInputRef.current, {
            types: ['establishment'],
            componentRestrictions: { country: 'in' },
            fields: ['name', 'formatted_address', 'geometry', 'address_components'],
          });

          hospitalAutocomplete.addListener('place_changed', () => {
            const place = hospitalAutocomplete.getPlace();
            if (!place.geometry || !place.geometry.location) {
              console.warn("Place geometry not found");
              return;
            }

            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            
            let city = '';
            if (place.address_components) {
              const cityComp = place.address_components.find(
                c => c.types.includes('locality') || c.types.includes('administrative_area_level_2')
              );
              if (cityComp) {
                city = cityComp.long_name;
              }
            }

            setForm(prev => ({
              ...prev,
              hospitalName: place.name || '',
              hospitalAddress: place.formatted_address || '',
              city: city || prev.city,
              coordinates: [lng, lat]
            }));
          });
        }

        // Autocomplete for Hospital Address
        if (addressInputRef.current) {
          const addressAutocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
            types: ['geocode', 'establishment'],
            componentRestrictions: { country: 'in' },
            fields: ['name', 'formatted_address', 'geometry', 'address_components'],
          });

          addressAutocomplete.addListener('place_changed', () => {
            const place = addressAutocomplete.getPlace();
            if (!place.geometry || !place.geometry.location) {
              console.warn("Address place geometry not found");
              return;
            }

            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            
            let city = '';
            if (place.address_components) {
              const cityComp = place.address_components.find(
                c => c.types.includes('locality') || c.types.includes('administrative_area_level_2')
              );
              if (cityComp) {
                city = cityComp.long_name;
              }
            }

            setForm(prev => ({
              ...prev,
              hospitalAddress: place.formatted_address || '',
              city: city || prev.city,
              coordinates: [lng, lat]
            }));
          });
        }
      }
    });
  }, []);

  useEffect(() => {
    return () => {
      if (osmTimeoutRef.current) {
        clearTimeout(osmTimeoutRef.current);
      }
      if (osmAddressTimeoutRef.current) {
        clearTimeout(osmAddressTimeoutRef.current);
      }
    };
  }, []);

  const triggerOSMQuery = (query) => {
    if (osmTimeoutRef.current) {
      clearTimeout(osmTimeoutRef.current);
    }
    
    osmTimeoutRef.current = setTimeout(async () => {
      setSearchingOSM(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`
        );
        const data = await response.json();
        const mapped = data.map(item => {
          const parts = item.display_name.split(', ');
          let city = '';
          if (parts.length > 3) {
            city = parts[parts.length - 4] || parts[parts.length - 3] || '';
          }
          return {
            name: parts[0],
            address: item.display_name,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            city: city.trim(),
          };
        });
        setSuggestions(mapped);
      } catch (error) {
        console.error('OSM Geocoding failed:', error);
      } finally {
        setSearchingOSM(false);
      }
    }, 400);
  };

  const handleHospitalNameChange = (e) => {
    const value = e.target.value;
    setForm(prev => ({ ...prev, hospitalName: value }));
    
    if (!googleLoaded) {
      if (value.trim().length > 2) {
        setShowSuggestions(true);
        triggerOSMQuery(value);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }
  };

  const handleSelectSuggestion = (sug) => {
    setForm(prev => ({
      ...prev,
      hospitalName: sug.name,
      hospitalAddress: sug.address,
      city: sug.city || prev.city,
      coordinates: [sug.lon, sug.lat]
    }));
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const triggerAddressOSMQuery = (query) => {
    if (osmAddressTimeoutRef.current) {
      clearTimeout(osmAddressTimeoutRef.current);
    }
    
    osmAddressTimeoutRef.current = setTimeout(async () => {
      setSearchingAddressOSM(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`
        );
        const data = await response.json();
        const mapped = data.map(item => {
          const parts = item.display_name.split(', ');
          let city = '';
          if (parts.length > 3) {
            city = parts[parts.length - 4] || parts[parts.length - 3] || '';
          }
          return {
            name: parts[0],
            address: item.display_name,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            city: city.trim(),
          };
        });
        setAddressSuggestions(mapped);
      } catch (error) {
        console.error('OSM Address Geocoding failed:', error);
      } finally {
        setSearchingAddressOSM(false);
      }
    }, 400);
  };

  const handleAddressChange = (e) => {
    const value = e.target.value;
    setForm(prev => ({ ...prev, hospitalAddress: value }));
    
    if (!googleLoaded) {
      if (value.trim().length > 2) {
        setShowAddressSuggestions(true);
        triggerAddressOSMQuery(value);
      } else {
        setAddressSuggestions([]);
        setShowAddressSuggestions(false);
      }
    }
  };

  const handleSelectAddressSuggestion = (sug) => {
    setForm(prev => ({
      ...prev,
      hospitalAddress: sug.address,
      city: sug.city || prev.city,
      coordinates: [sug.lon, sug.lat]
    }));
    setAddressSuggestions([]);
    setShowAddressSuggestions(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await requestService.createRequest(form);
      setSuccess('Emergency request broadcasted to nearest eligible donors!');
      setForm({
        patientName: '',
        bloodGroup: '',
        unitsRequired: 1,
        urgencyLevel: 'medium',
        hospitalName: '',
        hospitalAddress: '',
        city: '',
        contactNumber: '',
        coordinates: form.coordinates,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to submit request');
    } finally {
      setLoading(false);
    }
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const urgencyLevels = [
    { value: 'low', label: 'Low (Planned Surgery)', color: 'text-slate-500' },
    { value: 'medium', label: 'Medium (Needed Today)', color: 'text-blue-600' },
    { value: 'high', label: 'High (Within Hours)', color: 'text-orange-600' },
    { value: 'critical', label: 'Critical (Life-threatening)', color: 'text-red-600' },
  ];

  return (
    <section className="mx-auto max-w-4xl space-y-10">
      <div className="rounded-[2.5rem] bg-white p-8 sm:p-12 shadow-soft border border-slate-100">
        <div className="space-y-2 mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900">Create Emergency Request</h1>
          <p className="text-lg text-slate-600">Notify verified donors within a 20km radius instantly.</p>
        </div>

        <form className="grid gap-8" onSubmit={handleSubmit}>
          {success && <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-emerald-700 flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            {success}
          </div>}
          {error && <div className="rounded-2xl bg-red-50 border border-red-100 p-4 text-red-700">{error}</div>}
          
          <div className="grid gap-6 lg:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Patient Name
              <input
                name="patientName"
                value={form.patientName}
                onChange={handleChange}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 focus:ring-2 focus:ring-red-500/20 transition-all"
                type="text"
                placeholder="Full name"
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Blood Group Needed
              <select
                name="bloodGroup"
                value={form.bloodGroup}
                onChange={handleChange}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 focus:ring-2 focus:ring-red-500/20 transition-all"
                required
              >
                <option value="">Select Group</option>
                {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </label>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Units Required
              <input
                name="unitsRequired"
                value={form.unitsRequired}
                onChange={handleChange}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4"
                type="number"
                min="1"
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Urgency Level
              <select
                name="urgencyLevel"
                value={form.urgencyLevel}
                onChange={handleChange}
                className={`rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 font-bold ${urgencyLevels.find(u => u.value === form.urgencyLevel)?.color}`}
              >
                {urgencyLevels.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </label>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="relative grid gap-2 text-sm font-bold text-slate-700">
              Hospital Name
              <input
                ref={hospitalInputRef}
                name="hospitalName"
                value={form.hospitalName}
                onChange={handleHospitalNameChange}
                onFocus={() => { if (!googleLoaded && suggestions.length > 0) setShowSuggestions(true); }}
                onBlur={() => {
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 focus:ring-2 focus:ring-red-500/20 transition-all"
                type="text"
                placeholder="e.g. Apollo Hospital"
                required
                autoComplete="off"
              />
              {/* Fallback Suggestions List */}
              {!googleLoaded && showSuggestions && (suggestions.length > 0 || searchingOSM) && (
                <ul className="absolute left-0 right-0 top-[100%] z-20 mt-2 max-h-60 overflow-y-auto rounded-2xl border border-slate-100 bg-white p-2 shadow-xl divide-y divide-slate-50">
                  {searchingOSM && (
                    <li className="px-5 py-3 text-sm text-slate-400 animate-pulse text-left">Searching locations...</li>
                  )}
                  {suggestions.map((sug, idx) => (
                    <li
                      key={idx}
                      onClick={() => handleSelectSuggestion(sug)}
                      className="px-5 py-3 hover:bg-slate-50 cursor-pointer rounded-xl transition-colors text-left"
                    >
                      <div className="font-bold text-slate-800 text-sm">{sug.name}</div>
                      <div className="text-xs text-slate-400 truncate">{sug.address}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Contact Number
              <input
                name="contactNumber"
                value={form.contactNumber}
                onChange={handleChange}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4"
                type="tel"
                placeholder="10-digit mobile number"
                required
              />
            </label>
          </div>

          <div className="relative grid gap-2 text-sm font-bold text-slate-700">
            Full Hospital Address
            <input
              ref={addressInputRef}
              name="hospitalAddress"
              value={form.hospitalAddress}
              onChange={handleAddressChange}
              onFocus={() => { if (!googleLoaded && addressSuggestions.length > 0) setShowAddressSuggestions(true); }}
              onBlur={() => {
                setTimeout(() => setShowAddressSuggestions(false), 200);
              }}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 focus:ring-2 focus:ring-red-500/20 transition-all"
              type="text"
              placeholder="Search hospital address or location"
              required
              autoComplete="off"
            />
            {/* Fallback Address Suggestions List */}
            {!googleLoaded && showAddressSuggestions && (addressSuggestions.length > 0 || searchingAddressOSM) && (
              <ul className="absolute left-0 right-0 top-[100%] z-20 mt-2 max-h-60 overflow-y-auto rounded-2xl border border-slate-100 bg-white p-2 shadow-xl divide-y divide-slate-50">
                {searchingAddressOSM && (
                  <li className="px-5 py-3 text-sm text-slate-400 animate-pulse text-left">Searching locations...</li>
                )}
                {addressSuggestions.map((sug, idx) => (
                  <li
                    key={idx}
                    onClick={() => handleSelectAddressSuggestion(sug)}
                    className="px-5 py-3 hover:bg-slate-50 cursor-pointer rounded-xl transition-colors text-left"
                  >
                    <div className="font-bold text-slate-800 text-sm">{sug.name}</div>
                    <div className="text-xs text-slate-400 truncate">{sug.address}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Verify Hospital Location (Click map to adjust)</label>
            <div className="h-64 w-full rounded-2xl overflow-hidden border border-slate-100 shadow-inner">
              <MapContainer center={form.coordinates ? [form.coordinates[1], form.coordinates[0]] : [20.5937, 78.9629]} zoom={13} scrollWheelZoom={false}>
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

          <div className="grid gap-6 lg:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              City
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4"
                type="text"
                placeholder="Current city"
                required
              />
            </label>
            <div className="flex items-end">
              <div className={`flex items-center gap-2 rounded-2xl border px-5 py-4 w-full ${form.coordinates ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                <div className={`h-2 w-2 rounded-full ${form.coordinates ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <span className="text-sm font-bold">
                  {form.coordinates ? 'Location Verified' : 'Detecting Location...'}
                </span>
              </div>
            </div>
          </div>

          <button
            className="mt-4 rounded-full bg-primary px-8 py-5 text-xl font-bold text-white shadow-lg shadow-red-100 transition-all hover:bg-red-700 hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:bg-red-300"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Broadcasting SOS...' : 'Create SOS Alert'}
          </button>
        </form>
      </div>
    </section>
  );
}

export default RequestBlood;
