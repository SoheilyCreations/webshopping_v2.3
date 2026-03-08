"use client";

import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
// CSS moved to layout.tsx for better Next.js compatibility

// Icon helper will be initialized inside the component to be SSR safe
let DefaultIcon: L.Icon;
if (typeof window !== 'undefined') {
    DefaultIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
    });
}


interface MapPickerProps {
    center: { lat: number; lng: number };
    onLocationChange: (lat: number, lng: number) => void;
}

// Map instance controller (using useMap instead of useMapEvents for simplicity)
function SetViewOnClick({ center }: { center: { lat: number; lng: number } }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView([center.lat, center.lng], map.getZoom());
            map.invalidateSize();
        }
    }, [center, map]);
    return null;
}

// Event component to catch clicks
function MapEvents({ onLocationChange }: { onLocationChange: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onLocationChange(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

const MapPicker: React.FC<MapPickerProps> = ({ center, onLocationChange }) => {
    const eventHandlers = useMemo(
        () => ({
            dragend(e: any) {
                const marker = e.target;
                if (marker) {
                    const pos = marker.getLatLng();
                    onLocationChange(pos.lat, pos.lng);
                }
            },
        }),
        [onLocationChange],
    );

    return (
        <MapContainer
            center={[center.lat, center.lng]}
            zoom={15}
            style={{ width: '100%', height: '100%' }}
            zoomControl={false}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <SetViewOnClick center={center} />
            <MapEvents onLocationChange={onLocationChange} />
            <Marker
                position={[center.lat, center.lng]}
                icon={DefaultIcon}
                draggable={true}
                eventHandlers={eventHandlers}
            />
        </MapContainer>
    );
};

export default MapPicker;
