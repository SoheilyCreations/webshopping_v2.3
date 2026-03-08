"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Navigation, Package, PhoneCall, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TrackingScreen() {
    const router = useRouter();

    return (
        <div className="relative h-full w-full overflow-hidden bg-gray-100 flex flex-col font-sans">
            {/* Top Absolute Header */}
            <div className="absolute top-0 w-full z-30 pt-8 pb-4 px-6 flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 bg-white/80 backdrop-blur-md shadow-sm rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                >
                    <ChevronLeft size={24} className="text-black" />
                </button>
            </div>

            {/* Map Placeholder Map (using a map image) */}
            <div className="absolute inset-x-0 top-0 h-[60%] w-full z-0 overflow-hidden bg-slate-300">
                <img
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=3000&ixlib=rb-4.0.3"
                    alt="Map"
                    className="w-full h-full object-cover opacity-70"
                />
                {/* Mock Map Route / Pin */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="relative flex items-center justify-center z-10"
                    >
                        <div className="w-12 h-12 bg-lime rounded-full shadow-glow flex items-center justify-center border-[3px] border-white">
                            <MapPin size={24} className="text-black fill-lime stroke-black stroke-2" />
                        </div>
                        {/* Pulsing ring */}
                        <motion.div
                            animate={{ scale: [1, 2], opacity: [0.8, 0] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                            className="absolute inset-0 bg-lime rounded-full -z-10"
                        />
                    </motion.div>
                </div>
            </div>

            {/* Floating Bottom Sheet */}
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200, delay: 0.2 }}
                className="absolute bottom-0 inset-x-0 z-20 bg-white rounded-t-[2.5rem] shadow-[0_-20px_40px_-5px_rgba(0,0,0,0.1)] pt-8 pb-10 px-6 flex flex-col"
            >
                <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-black">Arriving in <span className="text-lime-600">12 min</span></h2>
                        <p className="text-gray-500 font-medium mt-1">Order #84920</p>
                    </div>
                    <div className="w-14 h-14 bg-lime/10 rounded-2xl flex items-center justify-center text-lime-600">
                        <Package size={28} />
                    </div>
                </div>

                {/* Courier Info */}
                <div className="flex items-center p-4 bg-light rounded-3xl mb-8">
                    <div className="w-12 h-12 bg-gray-200 rounded-full mr-4 overflow-hidden border-2 border-white shadow-sm">
                        <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100&h=100" alt="Courier" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-black text-base">John Doe</h3>
                        <p className="text-gray-400 text-xs font-semibold">Courier</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="w-10 h-10 bg-white shadow-soft rounded-full flex items-center justify-center text-black hover:bg-gray-50 transition-colors">
                            <PhoneCall size={18} fill="currentColor" />
                        </button>
                    </div>
                </div>

                {/* Live Tracking Button */}
                <button className="w-full relative h-16 bg-lime text-black rounded-full font-bold text-lg overflow-hidden group shadow-soft hover:shadow-glow transition-all">
                    <div className="absolute inset-0 flex items-center px-2">
                        <div className="flex-1 flex justify-center z-10 relative left-4">Live Tracking</div>

                        {/* Animated Arrows via Framer Motion */}
                        <motion.div
                            className="bg-black w-12 h-12 rounded-full flex items-center justify-center z-10 shrink-0"
                        >
                            <motion.div
                                animate={{ x: [0, 5, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                            >
                                <Navigation size={20} className="text-lime rotate-90 fill-lime stroke-lime" />
                            </motion.div>
                        </motion.div>
                    </div>
                    {/* subtle moving gradient for 'glowing' liquid feel */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                </button>

            </motion.div>
        </div>
    );
}
