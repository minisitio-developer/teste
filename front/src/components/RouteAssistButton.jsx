import React, { useMemo, useState } from 'react';

function clean(value) {
    if (!value || value === '0' || value === 'null' || value === 'undefined') return '';
    return String(value).replace(/\s+/g, ' ').trim();
}

function buildDestination(profile) {
    if (clean(profile?.descLat) && clean(profile?.descLng)) {
        return `${clean(profile.descLat)},${clean(profile.descLng)}`;
    }

    return [
        clean(profile?.descEndereco),
        clean(profile?.codCaderno),
        clean(profile?.codUf),
        clean(profile?.descAnuncio),
    ].filter(Boolean).join(', ');
}

function openMaps(destination, origin) {
    const params = new URLSearchParams({
        api: '1',
        destination,
        travelmode: 'driving',
        dir_action: 'navigate',
    });

    if (origin) {
        params.set('origin', origin);
    }

    window.open(`https://www.google.com/maps/dir/?${params.toString()}`, '_blank', 'noopener,noreferrer');
}

export default function RouteAssistButton({ profile }) {
    const [loading, setLoading] = useState(false);
    const destination = useMemo(() => buildDestination(profile), [profile]);
    const geolocationSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator;

    function handleRoute() {
        if (!destination || loading) return;

        if (!geolocationSupported) {
            openMaps(destination);
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const origin = `${position.coords.latitude},${position.coords.longitude}`;
                setLoading(false);
                openMaps(destination, origin);
            },
            () => {
                setLoading(false);
                openMaps(destination);
            },
            { enableHighAccuracy: false, timeout: 6000, maximumAge: 300000 }
        );
    }

    if (!destination) {
        return null;
    }

    return (
        <button
            type="button"
            className="btn btn-sm btn-outline-success"
            onClick={handleRoute}
            title="Abrir rota ate este anunciante"
            aria-label="Abrir rota ate este anunciante"
            disabled={loading}
        >
            <i className={`fa ${loading ? 'fa-spinner fa-spin' : 'fa-location-arrow'} me-1`}></i>
            {loading ? 'Localizando' : 'Como chegar'}
        </button>
    );
}
