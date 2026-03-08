"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Check,
    Package,
    Truck,
    Home,
    FileText,
    CheckCircle2,
    Download,
    CreditCard,
    Clock,
    Calendar,
    Wallet,
    ShoppingBag
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function ThankYouScreen() {
    const router = useRouter();
    const [orderId, setOrderId] = useState('');
    const [orderDate, setOrderDate] = useState('');
    const [orderTime, setOrderTime] = useState('');
    const [isReceived, setIsReceived] = useState(false);

    useEffect(() => {
        // Generate random order details
        const id = 'BN-' + Math.floor(100000 + Math.random() * 900000);
        setOrderId(id);

        const now = new Date();
        setOrderDate(now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }));
        setOrderTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
    }, []);

    const mockOrderDetails = {
        total: 4250,
        savings: 450,
        deliveryMethod: 'Express Delivery (30 mins)',
        paymentMethod: 'Cash on Delivery',
        items: 5
    };

    return (
        <div className="h-full bg-white flex flex-col font-sans overflow-hidden">

            {/* Success Hero Section */}
            <div className="flex-1 overflow-y-auto hide-scrollbar pb-32">
                <div className="flex flex-col items-center justify-center px-8 text-center pt-20">
                    <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="w-28 h-28 bg-lime rounded-full flex items-center justify-center mb-8 shadow-[0_20px_40px_-10px_rgba(163,230,53,0.5)] relative"
                    >
                        <Check size={56} className="text-black stroke-[4px]" />

                        {/* Animated Pulsing Rings */}
                        <motion.div
                            animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute inset-0 bg-lime rounded-full -z-10"
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="text-[10px] uppercase font-black tracking-[0.3em] text-lime-600 mb-2">
                            Order Success
                        </div>
                        <h1 className="text-4xl font-black text-black leading-tight mb-4 tracking-tighter uppercase">
                            Awesome, Your Order is In!
                        </h1>
                        <p className="text-gray-500 font-medium mb-10 max-w-[300px] mx-auto text-sm leading-relaxed">
                            We've received your order and our fresh-experts are already packing it for you!
                        </p>
                    </motion.div>

                    {/* Highly Detailed Order Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="w-full max-w-sm bg-light/50 backdrop-blur-sm rounded-[3rem] p-8 border border-gray-100 flex flex-col gap-6 relative overflow-hidden shadow-premium"
                    >
                        {/* Hardware-style Serial Tag */}
                        <div className="absolute top-0 right-12 px-4 py-1.5 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-b-xl">
                            Verified Official
                        </div>

                        {/* Order Header */}
                        <div className="flex justify-between items-start pt-2">
                            <div className="flex flex-col items-start">
                                <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Bill Number</span>
                                <span className="text-xl font-black text-black uppercase">{orderId}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1 block">Status</span>
                                <div className="flex items-center gap-1 bg-lime/20 px-2 py-0.5 rounded text-lime-700 font-black text-[10px] uppercase">
                                    Processing
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-gray-200/50 w-full" />

                        {/* Date & Time Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-gray-400">
                                    <Calendar size={14} />
                                </div>
                                <div className="flex flex-col items-start text-left">
                                    <span className="text-gray-400 text-[9px] font-black uppercase tracking-widest leading-none">Date</span>
                                    <span className="text-xs font-black text-black">{orderDate}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-gray-400">
                                    <Clock size={14} />
                                </div>
                                <div className="flex flex-col items-start text-left">
                                    <span className="text-gray-400 text-[9px] font-black uppercase tracking-widest leading-none">Time</span>
                                    <span className="text-xs font-black text-black">{orderTime}</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-gray-200/50 w-full" />

                        {/* Methods Grid */}
                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex items-center justify-between bg-white/50 p-4 rounded-2xl border border-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                                        <Truck size={20} />
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className="text-gray-400 text-[9px] font-black uppercase">Delivery</span>
                                        <span className="text-xs font-black text-black">{mockOrderDetails.deliveryMethod}</span>
                                    </div>
                                </div>
                                <CheckCircle2 size={16} className="text-lime-500" />
                            </div>
                            <div className="flex items-center justify-between bg-white/50 p-4 rounded-2xl border border-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center">
                                        <Wallet size={20} />
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className="text-gray-400 text-[9px] font-black uppercase">Payment via</span>
                                        <span className="text-xs font-black text-black">{mockOrderDetails.paymentMethod}</span>
                                    </div>
                                </div>
                                <CheckCircle2 size={16} className="text-lime-500" />
                            </div>
                        </div>

                        {/* Total & Savings Section */}
                        <div className="bg-black text-white p-6 rounded-[2rem] flex flex-col gap-4 shadow-xl">
                            <div className="flex justify-between items-center">
                                <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Grand Total</span>
                                <span className="text-2xl font-black">Rs. {mockOrderDetails.total.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-white/10">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-lime rounded-full" />
                                    <span className="text-lime font-black text-[10px] uppercase tracking-widest">You Save With Us</span>
                                </div>
                                <span className="text-sm font-black text-white">Rs. {mockOrderDetails.savings}</span>
                            </div>
                        </div>

                        {/* Download Invoice Button */}
                        <button className="flex items-center justify-center gap-3 py-6 px-4 text-black/40 hover:text-black transition-colors font-black text-xs uppercase tracking-widest mb-4">
                            <Download size={16} /> Download PDF Invoice
                        </button>
                    </motion.div>
                </div>
            </div>

            {/* Bottom Actions Floating Bar */}
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="fixed bottom-0 left-0 right-0 p-6 z-50 bg-white/80 backdrop-blur-xl border-t border-gray-100 rounded-t-[3.5rem] shadow-float-up flex flex-col gap-3"
            >
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsReceived(!isReceived)}
                        className={`flex-1 h-14 rounded-full font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all duration-300 border-2 ${isReceived
                            ? 'bg-lime text-black border-lime shadow-glow-lime'
                            : 'bg-white text-black border-gray-100 hover:border-lime'
                            }`}
                    >
                        {isReceived ? 'Order Received ✓' : 'Mark as Received'}
                        <CheckCircle2 size={16} />
                    </button>

                    <button
                        onClick={() => router.push('/')}
                        className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 transition-all"
                    >
                        <Home size={20} />
                    </button>
                </div>

                <Button
                    onClick={() => router.push('/')}
                    className="w-full h-16 bg-black text-white rounded-full font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-4 group"
                >
                    Keep Shopping
                    <ShoppingBag size={20} className="group-hover:rotate-12 transition-transform" />
                </Button>
            </motion.div>
        </div>
    );
}
