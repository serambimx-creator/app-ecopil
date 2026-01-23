'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { clsx } from 'clsx';
import { MapPin } from 'lucide-react';

// Draggable Marker Component
function DraggableMarker({ position, onDragEnd }: { position: [number, number], onDragEnd: (lat: number, lng: number) => void }) {
    const markerRef = useRef<L.Marker>(null);

    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                    const { lat, lng } = marker.getLatLng();
                    onDragEnd(lat, lng);
                }
            },
        }),
        [onDragEnd],
    );

    // Custom Icon
    const icon = L.divIcon({
        className: 'custom-pin-icon',
        html: `<div style="background-color: #00DF81; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
    });

    return (
        <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
            icon={icon}
        />
    );
}

// Map Click Handler to move marker
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

interface LocationPickerProps {
    latitude?: number;
    longitude?: number;
    onLocationChange: (lat: number, lng: number) => void;
}

export default function LocationPicker({ latitude, longitude, onLocationChange }: LocationPickerProps) {
    // Default to Pachuca if no coords provided
    const defaultCenter: [number, number] = [20.1011, -98.7591];
    const [position, setPosition] = useState<[number, number]>(
        latitude && longitude ? [latitude, longitude] : defaultCenter
    );

    const handleUpdate = (lat: number, lng: number) => {
        setPosition([lat, lng]);
        onLocationChange(lat, lng);
    };

    return (
        <div className="w-full h-[250px] rounded-2xl overflow-hidden relative border border-white/10 shadow-inner">
            <MapContainer
                center={position}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
            >
                <TileLayer
                    attribution='&copy; CARTO'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" // Light map for better contrast in drawer? Or keep Dark? Let's use Light for "Field Work" feel contrast or Dark for consistency? User said Dark Mode for MainMap. For drawer picker, maybe Dark too for consistency with App theme.
                />
                {/* Override with Dark mode tile if preferred, but let's stick to Consistency */}
                <TileLayer
                    attribution='&copy; CARTO'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                <DraggableMarker position={position} onDragEnd={handleUpdate} />
                <MapClickHandler onMapClick={handleUpdate} />
            </MapContainer>

            {/* Overlay instruction */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-[400] bg-dark-surface/80 backdrop-blur px-3 py-1 rounded-full border border-white/10 text-[10px] text-gray-300 pointer-events-none flex items-center gap-1">
                <MapPin size={10} />
                Arrastra el pin o toca para ubicar
            </div>
        </div>
    );
}
