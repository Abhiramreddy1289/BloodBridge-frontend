export const getDistanceKm = (from, to) => {
  if (!from || !to) return null;

  const [fromLat, fromLng] = from.map(Number);
  const [toLat, toLng] = to.map(Number);

  if (![fromLat, fromLng, toLat, toLng].every(Number.isFinite)) return null;

  const earthRadiusKm = 6371;
  const dLat = toRadians(toLat - fromLat);
  const dLng = toRadians(toLng - fromLng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(fromLat)) *
      Math.cos(toRadians(toLat)) *
      Math.sin(dLng / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const formatDistance = (distanceKm) => {
  if (distanceKm === null || distanceKm === undefined) return 'Location needed';
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
  return `${distanceKm.toFixed(distanceKm < 10 ? 1 : 0)} km`;
};

export const getCurrentLocation = () => new Promise((resolve, reject) => {
  if (!('geolocation' in navigator)) {
    reject(new Error('Location access is not available in this browser'));
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => resolve([position.coords.latitude, position.coords.longitude]),
    () => reject(new Error('Please allow location access to calculate nearby distance')),
    { enableHighAccuracy: true, timeout: 10000 }
  );
});

const toRadians = (degrees) => degrees * (Math.PI / 180);
