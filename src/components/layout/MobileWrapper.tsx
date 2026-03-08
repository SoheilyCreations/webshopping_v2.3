"use client";

import React, { useState, useEffect } from 'react';
import { Monitor, Smartphone, Globe, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * MobileWrapper ensures the app maintains a mobile-first aspect ratio 
 * on desktop devices, but allows switching to a "Full Web Version".
 */
export default function MobileWrapper({ children }: { children: React.ReactNode }) {
    const [isWebMode, setIsWebMode] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const savedMode = localStorage.getItem('viewMode');
        if (savedMode === 'web') {
            setIsWebMode(true);
        }
        setIsLoaded(true);
    }, []);

    const toggleMode = (mode: 'mobile' | 'web') => {
        setIsWebMode(mode === 'web');
        localStorage.setItem('viewMode', mode);
    };

    if (!isLoaded) return null;

    return (
        <div className="min-h-[100dvh] w-full bg-[#f8f9fa] flex justify-center items-center overflow-hidden font-sans transition-colors duration-500">
            {/* Background decoration for desktop */}
            {!isWebMode && (
                <div className="fixed inset-0 z-0 opacity-20 pointer-events-none hidden md:block">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-lime rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-lime rounded-full blur-[120px]" />
                </div>
            )}

            {/* Main Container */}
            <motion.div
                layout
                initial={false}
                animate={{
                    maxWidth: isWebMode ? '100%' : '450px',
                    height: isWebMode ? '100dvh' : '90vh',
                    maxHeight: isWebMode ? '100%' : '900px',
                    borderRadius: isWebMode ? '0px' : '3rem',
                }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                className={`relative w-full bg-white z-10 flex flex-col border-gray-100 shadow-premium overflow-hidden ${!isWebMode ? 'md:border md:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)]' : ''}`}
            >
                {children}
            </motion.div>

            {/* Desktop Side Branding (Left) */}
            {!isWebMode && (
                <div className="fixed left-20 top-1/2 -translate-y-1/2 hidden lg:block z-0 max-w-[200px]">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl font-black tracking-tighter mb-4"
                    >
                        webshopping<span className="text-lime-600">.lk</span>
                    </motion.div>
                    <p className="text-gray-400 text-sm font-medium leading-relaxed">
                        Sri Lanka's premier grocery delivery experience. Freshness at your doorstep.
                    </p>
                </div>
            )}

            {/* View Mode Toggle (Right) - ONLY ON DESKTOP */}
            <div className="fixed right-12 bottom-12 hidden md:flex flex-col gap-4 z-50">
                <AnimatePresence mode="wait">
                    {!isWebMode && (
                        <motion.button
                            key="web-btn"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toggleMode('web')}
                            className="bg-black text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 group border border-white/10"
                        >
                            <Globe size={20} className="text-lime" />
                            <div className="text-left">
                                <span className="block text-[10px] uppercase font-black tracking-widest opacity-50">Desktop View</span>
                                <span className="block text-sm font-bold">Shop on Web Version</span>
                            </div>
                            <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
