export const fetchNearbyMedicalFacilities = async ([latitude, longitude], radiusKm = 20) => {
  const radiusInMeters = Number(radiusKm) * 1000;
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="hospital"](around:${radiusInMeters},${latitude},${longitude});
      way["amenity"="hospital"](around:${radiusInMeters},${latitude},${longitude});
      relation["amenity"="hospital"](around:${radiusInMeters},${latitude},${longitude});
      node["healthcare"="blood_bank"](around:${radiusInMeters},${latitude},${longitude});
      way["healthcare"="blood_bank"](around:${radiusInMeters},${latitude},${longitude});
      relation["healthcare"="blood_bank"](around:${radiusInMeters},${latitude},${longitude});
      node["healthcare"="hospital"](around:${radiusInMeters},${latitude},${longitude});
      way["healthcare"="hospital"](around:${radiusInMeters},${latitude},${longitude});
      relation["healthcare"="hospital"](around:${radiusInMeters},${latitude},${longitude});
    );
    out center tags;
  `;

  const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);

  if (!response.ok) {
    throw new Error('Unable to load nearby hospitals and blood banks');
  }

  const data = await response.json();
  return (data.elements || [])
    .map((item) => {
      const latitudeValue = item.lat || item.center?.lat;
      const longitudeValue = item.lon || item.center?.lon;

      if (!latitudeValue || !longitudeValue) return null;

      return {
        id: `osm-${item.type}-${item.id}`,
        name: item.tags?.name || item.tags?.operator || 'Medical Facility',
        type: item.tags?.healthcare === 'blood_bank' ? 'Blood Bank' : 'Hospital',
        address: buildAddress(item.tags),
        phone: item.tags?.phone || item.tags?.['contact:phone'] || '',
        website: item.tags?.website || item.tags?.['contact:website'] || '',
        source: 'OpenStreetMap',
        position: [latitudeValue, longitudeValue],
      };
    })
    .filter(Boolean)
    .slice(0, 80);
};

const buildAddress = (tags = {}) => (
  [
    tags['addr:housename'] || tags['addr:housenumber'],
    tags['addr:street'],
    tags['addr:city'],
    tags['addr:district'],
    tags['addr:state'],
    tags['addr:postcode'],
  ]
    .filter(Boolean)
    .join(', ')
);
