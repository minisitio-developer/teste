export function parseCoordinate(value) {
    if (value === null || value === undefined) return null;
    const normalized = String(value).trim().replace(',', '.');
    if (!normalized || normalized === '0') return null;

    const number = Number(normalized);
    return Number.isFinite(number) ? number : null;
}

export function hasCoordinates(item) {
    return parseCoordinate(item?.descLat) !== null && parseCoordinate(item?.descLng) !== null;
}

export function distanceKm(origin, destination) {
    const lat1 = parseCoordinate(origin?.latitude);
    const lon1 = parseCoordinate(origin?.longitude);
    const lat2 = parseCoordinate(destination?.descLat);
    const lon2 = parseCoordinate(destination?.descLng);

    if ([lat1, lon1, lat2, lon2].some(value => value === null)) return null;

    const earthRadiusKm = 6371;
    const toRad = (value) => value * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistanceKm(value) {
    if (!Number.isFinite(value)) return '';
    if (value < 1) return `${Math.round(value * 1000)} m`;
    return `${value.toFixed(value < 10 ? 1 : 0).replace('.', ',')} km`;
}
