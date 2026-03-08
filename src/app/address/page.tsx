"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, MapPin, Search, Crosshair, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamically load the Leaflet Map with no SSR
const MapPicker = dynamic(() => import('@/components/ui/MapPicker'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <Loader2 className="animate-spin text-lime-600" size={32} />
        </div>
    ),
});

const defaultCenter = {
    lat: 6.9271, // Colombo default
    lng: 79.8612
};

export default function AddressScreen() {
    const router = useRouter();
    const [isSearching, setIsSearching] = useState(false);

    const [center, setCenter] = useState(defaultCenter);
    const [addressText, setAddressText] = useState("Loading address...");
    const [addressSubText, setAddressSubText] = useState("...");
    const [isLocating, setIsLocating] = useState(false);

    // Using Nominatim (OpenStreetMap) for free reverse geocoding
    const fetchAddress = async (lat: number, lng: number) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
            const data = await res.json();

            if (data && data.address) {
                const street = data.address.road || data.address.suburb || data.address.neighbourhood || "";
                const city = data.address.city || data.address.town || data.address.village || "";
                const country = data.address.country || "";

                setAddressText(street || "Selected Location");
                setAddressSubText(`${city}${city && country ? ', ' : ''}${country}`);
            } else {
                setAddressText("Selected Location");
                setAddressSubText(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
            }
        } catch (error) {
            console.error("Geocoding failed", error);
            setAddressText("Location Found");
            setAddressSubText(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }
    };

    const handleLocationChange = (lat: number, lng: number) => {
        setCenter({ lat, lng });
        fetchAddress(lat, lng);
    };

    const handleGetLocation = () => {
        setIsLocating(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setCenter(pos);
                    fetchAddress(pos.lat, pos.lng);
                    setIsLocating(false);
                },
                () => {
                    setIsLocating(false);
                    fetchAddress(defaultCenter.lat, defaultCenter.lng);
                }
            );
        } else {
            setIsLocating(false);
        }
    };

    // Initial location fetch
    useEffect(() => {
        const saved = localStorage.getItem('selectedAddress');
        if (saved) {
            const parsed = JSON.parse(saved);
            setCenter({ lat: parsed.lat, lng: parsed.lng });
            setAddressText(parsed.mainText);
            setAddressSubText(parsed.subText);
        } else {
            handleGetLocation();
        }
    }, []);

    return (
        <div className="h-full bg-light flex flex-col font-sans relative overflow-hidden">

            {/* Header / Search Overlay */}
            <div className="absolute top-0 w-full z-[1000] pt-8 pb-4 px-6 flex items-center gap-4 pointer-events-none">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 bg-white shadow-soft rounded-full flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 transition-all pointer-events-auto"
                >
                    <ChevronLeft size={24} className="text-black" />
                </button>

                <div className="flex-1 bg-white h-12 rounded-full shadow-soft flex items-center px-4 gap-3 border border-gray-100 pointer-events-auto">
                    <Search size={20} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search area or street..."
                        className="flex-1 bg-transparent border-none outline-none text-sm text-black font-medium placeholder:text-gray-400"
                        onFocus={() => setIsSearching(true)}
                        onBlur={() => setIsSearching(false)}
                        onKeyDown={async (e) => {
                            if (e.key === 'Enter') {
                                const query = (e.target as HTMLInputElement).value;
                                if (!query) return;
                                try {
                                    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
                                    const data = await res.json();
                                    if (data && data[0]) {
                                        const pos = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
                                        setCenter(pos);
                                        setAddressText(data[0].display_name.split(',')[0]);
                                        setAddressSubText(data[0].display_name.split(',').slice(1).join(',').trim());
                                    }
                                } catch (err) {
                                    console.error("Search failed", err);
                                }
                            }
                        }}
                    />
                </div>
            </div>

            {/* Map Area Container */}
            <div className="flex-1 relative bg-gray-200 min-h-[50vh]">
                <div className="absolute inset-0">
                    <MapPicker center={center} onLocationChange={handleLocationChange} />
                </div>

                {/* Map Overlay Gradient for better reading */}
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/10 to-transparent pointer-events-none z-[400]" />

                {/* Current Location Button */}
                <button
                    onClick={handleGetLocation}
                    className="absolute bottom-[280px] right-6 w-12 h-12 bg-white rounded-full shadow-soft flex items-center justify-center text-black hover:bg-gray-50 active:scale-95 transition-all z-[1000] border border-gray-100"
                >
                    {isLocating ? (
                        <Loader2 className="animate-spin text-black" size={22} />
                    ) : (
                        <Crosshair size={22} />
                    )}
                </button>
            </div>

            {/* Bottom Bottom Sheet Area */}
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute bottom-0 w-full bg-white rounded-t-[2.5rem] shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.1)] z-[1100] pt-8 pb-10 px-6"
            >
                <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto absolute top-3 left-1/2 -translate-x-1/2" />

                <h2 className="text-xl font-extrabold text-black mb-1">Select delivery location</h2>
                <p className="text-gray-400 text-sm font-medium mb-6">Drag the pin to pinpoint your location.</p>

                <div className="bg-light p-4 rounded-3xl mb-6 flex items-center gap-4 border border-gray-100">
                    <div className="w-10 h-10 bg-lime/20 rounded-xl flex items-center justify-center shrink-0">
                        <MapPin className="text-lime-600" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-black text-sm mb-0.5 line-clamp-1 truncate">{addressText}</h3>
                        <p className="text-gray-500 text-xs line-clamp-1 truncate">{addressSubText}</p>
                    </div>
                </div>

                <button
                    onClick={() => {
                        // Persist selected address for checkout
                        localStorage.setItem('selectedAddress', JSON.stringify({
                            mainText: addressText,
                            subText: addressSubText,
                            lat: center.lat,
                            lng: center.lng
                        }));
                        router.push('/checkout');
                    }}
                    className="w-full h-16 bg-lime text-black rounded-[2rem] font-bold shadow-glow hover:scale-105 active:scale-95 transition-all flex items-center justify-center text-lg group"
                >
                    Confirm Location
                    <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
            </motion.div>

        </div>
    );
}
