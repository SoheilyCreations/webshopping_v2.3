"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Bell,
    User,
    ArrowRight,
    Flame,
    LayoutGrid,
    Apple,
    Leaf,
    Milk,
    Croissant,
    Beef,
    Cookie,
    Coffee,
    Sparkles,
    Camera,
    Image as ImageIcon,
    PenLine,
    Home as HomeIcon,
    ShoppingBag,
    Heart
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { categories } from '@/lib/mockData';
import { useProducts } from '@/lib/useProducts';
import { ProductCard } from '@/components/ui/ProductCard';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { useCart } from '@/lib/CartContext';

const IconMap: { [key: string]: any } = {
    LayoutGrid, Apple, Leaf, Milk, Croissant, Beef, Cookie, Coffee, Sparkles
};

export default function HomeScreen() {
    const router = useRouter();
    const { totalItems } = useCart();
    const { products, loading } = useProducts();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeBanner, setActiveBanner] = useState(0);

    // Auto-slide banners
    React.useEffect(() => {
        const timer = setInterval(() => {
            setActiveBanner((prev) => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    // Featured products (top rated)
    const featuredProducts = products.filter(p => !p.soldOut).slice(0, 5);

    // Banner data
    const banners = [
        {
            id: 1,
            title: "Fresh Deals Everyday",
            subtitle: "Save up to 40% on organic vegetables",
            image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600",
            color: "bg-[#FFDD00]",
            textColor: "text-black"
        },
        {
            id: 2,
            title: "Fresh Meat & Seafood",
            subtitle: "Premium quality sourced daily",
            image: "https://images.unsplash.com/photo-1607305387299-a3d9611cd469?auto=format&fit=crop&q=80&w=600",
            color: "bg-black",
            textColor: "text-white"
        }
    ];

    const listActions = [
        { id: 1, title: 'Upload image', icon: ImageIcon, color: 'bg-blue-50', iconColor: 'text-blue-500' },
        { id: 2, title: 'Click photo', icon: Camera, color: 'bg-pink-50', iconColor: 'text-pink-500' },
        { id: 3, title: 'Write list', icon: PenLine, color: 'bg-green-50', iconColor: 'text-green-500' },
    ];

    return (
        <main className="relative flex-1 h-full bg-white font-sans overflow-hidden flex flex-col">
            {/* Top Navigation Bar */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl px-6 pt-8 pb-4 flex flex-col gap-4 shadow-sm shrink-0 border-b border-gray-100/50">
                <div className="flex items-center justify-between">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <Logo iconSize={18} textSize="text-xl" />
                    </motion.div>
                    <div className="flex items-center gap-3">
                        <button className="w-10 h-10 bg-light rounded-full flex items-center justify-center text-gray-600 outline-none">
                            <Bell size={20} />
                        </button>
                        <button className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white outline-none">
                            <User size={20} />
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search fresh products..."
                        className="w-full h-12 bg-light rounded-2xl pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-lime/50 transition-all border border-gray-100"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Scrollable Content Container */}
            <div className="flex-1 overflow-y-auto hide-scrollbar pb-32 pt-6">
                {/* Personalized Greeting & Mission Marquee */}
                <div className="px-6 mb-8 overflow-hidden">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 bg-lime rounded-full animate-pulse" />
                        <h1 className="text-xl font-black text-black tracking-tight uppercase">
                            {(() => {
                                const hour = new Date().getHours();
                                if (hour < 12) return "Good Morning! ☀️";
                                if (hour < 17) return "Good Afternoon! ☀️";
                                return "Good Evening! 🌙";
                            })()}
                        </h1>
                    </div>

                    {/* Mission Marquee - Keeps it on one line as requested */}
                    <div className="relative w-full overflow-hidden py-1 border-y border-gray-50 bg-light/30 rounded-lg">
                        <motion.div
                            animate={{ x: [0, -800] }}
                            transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
                            className="whitespace-nowrap flex gap-12 text-[11px] font-black text-gray-400 uppercase tracking-widest px-4"
                        >
                            <span>Ready to shop? We're here to end the era of walking through streets for shopping. Get fresh Sri Lankan products delivered instantly.</span>
                            <span>Ready to shop? We're here to end the era of walking through streets for shopping. Get fresh Sri Lankan products delivered instantly.</span>
                        </motion.div>
                    </div>
                </div>

                {/* Cinematic Promo Carousel (Auto & Manual) */}
                <div className="mb-12 px-6 relative group">
                    <div className="relative overflow-hidden rounded-[2.5rem] h-[220px]">
                        <motion.div
                            className="flex h-full"
                            drag="x"
                            dragConstraints={{ left: -((banners.length - 1) * 350), right: 0 }}
                            onDragEnd={(_, info) => {
                                const swipe = info.offset.x;
                                if (swipe < -50 && activeBanner < banners.length - 1) setActiveBanner(prev => prev + 1);
                                if (swipe > 50 && activeBanner > 0) setActiveBanner(prev => prev - 1);
                            }}
                            animate={{ x: -(activeBanner * 100) + '%' }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            {banners.map((banner, idx) => (
                                <div
                                    key={banner.id}
                                    className={`relative ${banner.color} min-w-full h-full p-8 flex flex-col justify-center cursor-grab active:cursor-grabbing`}
                                    onClick={() => router.push('/basket')}
                                >
                                    <div className="relative z-10 w-3/5">
                                        <motion.h2
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className={`text-2xl font-black ${banner.textColor} leading-tight mb-2 tracking-tighter`}
                                        >
                                            {banner.title}
                                        </motion.h2>
                                        <motion.p
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className={`${banner.textColor} opacity-70 font-bold text-[10px] mb-5 uppercase tracking-widest`}
                                        >
                                            {banner.subtitle}
                                        </motion.p>
                                        <button className="px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg bg-white text-black hover:scale-105 transition-all">
                                            Claim Now
                                        </button>
                                    </div>
                                    <div className="absolute right-[-5%] bottom-[-5%] w-52 h-52">
                                        <img
                                            src={banner.image}
                                            alt="Promo"
                                            className="w-full h-full object-cover rounded-full border-[6px] border-white/20 shadow-2xl"
                                        />
                                    </div>

                                    {/* Glass Overlay for depth */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-transparent pointer-events-none" />
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Minimalist Pagination Dots */}
                    <div className="flex justify-center gap-2 mt-4">
                        {banners.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveBanner(idx)}
                                className={`h-1.5 transition-all duration-500 rounded-full ${activeBanner === idx ? 'w-8 bg-lime shadow-glow-lime' : 'w-2 bg-gray-200'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Horizontal Categories */}
                <div className="mb-10">
                    <div className="flex items-center justify-between px-6 mb-4">
                        <h3 className="text-lg font-bold text-black tracking-tight">Categories</h3>
                        <button className="text-lime-600 text-sm font-bold active:scale-95 transition-transform" onClick={() => router.push('/basket')}>See All</button>
                    </div>
                    <div className="flex overflow-x-auto hide-scrollbar px-6 md:px-12 gap-6 md:gap-12 pb-2 snap-x snap-mandatory overscroll-x-contain md:justify-center">
                        {categories.map((cat) => {
                            const Icon = IconMap[cat.icon || 'LayoutGrid'];
                            return (
                                <div
                                    key={cat.id}
                                    onClick={() => router.push('/basket')}
                                    className="flex flex-col items-center gap-2 cursor-pointer group shrink-0 snap-start md:snap-align-none"
                                >
                                    <div className="w-16 h-16 md:w-20 md:h-20 bg-light rounded-3xl flex items-center justify-center transition-all group-hover:bg-lime/10 group-hover:scale-105 active:scale-95">
                                        <Icon size={24} className="text-gray-700 group-hover:text-lime-600 md:scale-125" />
                                    </div>
                                    <span className="text-[11px] md:text-sm font-bold text-gray-500 group-hover:text-black">
                                        {cat.name.split(' ')[0]}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Featured Section (Best Sellers Grid) */}
                <div className="mb-12 px-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Flame className="text-orange-500 fill-orange-500" size={20} />
                            <h3 className="text-xl font-black text-black tracking-tight uppercase">Best Sellers</h3>
                        </div>
                    </div>

                    {/* 2 per row grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        {featuredProducts.slice(0, 4).map((product) => (
                            <div key={product.id} className="w-full">
                                <ProductCard
                                    product={product}
                                    onClick={() => router.push(`/product/${product.id}`)}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Drive to Shop Page Action */}
                    <Button
                        onClick={() => router.push('/basket')}
                        className="w-full h-14 bg-white text-black border-2 border-gray-100 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-light hover:border-lime transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                        View Full Store
                        <ArrowRight size={16} strokeWidth={3} className="text-lime-600" />
                    </Button>
                </div>

                {/* Create Shopping List (The Actions) */}
                <div className="mb-10 px-6 safe-bottom">
                    <h3 className="text-xl font-black text-black mb-6 tracking-tight uppercase tracking-widest">Quick Shopping</h3>
                    <div className="grid grid-cols-1 gap-3">
                        {listActions.map((action, i) => (
                            <motion.div
                                key={action.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-light p-4 rounded-3xl flex items-center cursor-pointer hover:bg-white hover:shadow-soft border border-transparent hover:border-gray-100 transition-all shadow-sm"
                            >
                                <div className={`w-12 h-12 ${action.color} rounded-2xl flex items-center justify-center mr-4 shadow-inner`}>
                                    <action.icon className={`${action.iconColor} w-5 h-5`} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-black text-base uppercase tracking-tighter">{action.title}</h4>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.15em]">Tap to start</p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-300">
                                    <ArrowRight size={16} strokeWidth={3} />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Tab Bar Navigation */}
            <div className="absolute bottom-0 inset-x-0 z-50 px-6 pb-8 pt-4 bg-white/80 backdrop-blur-xl border-t border-gray-100 flex items-center justify-between">
                <button className="flex flex-col items-center gap-1 text-black outline-none">
                    <HomeIcon size={24} strokeWidth={2.5} />
                    <span className="text-[10px] font-black uppercase tracking-tight">Home</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-black transition-colors outline-none" onClick={() => router.push('/basket')}>
                    <ShoppingBag size={24} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Shop</span>
                </button>

                <div className="relative -top-8">
                    <button
                        onClick={() => router.push('/basket')}
                        className="w-16 h-16 bg-lime text-black rounded-full shadow-glow flex items-center justify-center border-4 border-white hover:scale-110 active:scale-95 transition-all outline-none"
                    >
                        <ShoppingBag size={28} strokeWidth={2.5} />
                        {totalItems > 0 && (
                            <div className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
                                {totalItems}
                            </div>
                        )}
                    </button>
                </div>

                <button className="flex flex-col items-center gap-1 text-gray-400 outline-none">
                    <Heart size={24} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Favs</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-gray-400 outline-none">
                    <User size={24} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Profile</span>
                </button>
            </div>
        </main>
    );
}
