"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { categories } from '@/lib/mockData';
import { useProducts } from '@/lib/useProducts';
import { ProductCard } from '@/components/ui/ProductCard';
import { ChevronLeft, Search, Filter, LayoutGrid, Apple, Leaf, Milk, Croissant, Beef, Cookie, Coffee, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/CartContext';

const IconMap: { [key: string]: any } = {
    LayoutGrid, Apple, Leaf, Milk, Croissant, Beef, Cookie, Coffee, Sparkles
};

export default function BasketScreen() {
    const router = useRouter();
    const { items, totalPrice, totalItems, discountTotal } = useCart();
    const { products, loading } = useProducts();
    const [activeCategory, setActiveCategory] = useState(categories[0].id);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

    return (
        <div className="h-full bg-light flex flex-col font-sans overflow-hidden">
            {/* Header */}
            <div className="pt-8 pb-4 px-6 bg-white/80 backdrop-blur-xl shadow-sm sticky top-0 z-50 flex items-center justify-between shrink-0 border-b border-gray-100/50">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 bg-light rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                >
                    <ChevronLeft size={24} className="text-black" />
                </button>
                <h1 className="text-xl font-black tracking-tight text-black">
                    webshopping<span className="text-lime-600">.lk</span>
                </h1>
                <div className="w-10 h-10 flex items-center justify-center">
                    <Search size={22} className="text-black" />
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Left Sidebar - Categories (Hover Expandable) */}
                <motion.div
                    initial={false}
                    animate={{ width: isSidebarExpanded ? 200 : 88 }}
                    onMouseEnter={() => setIsSidebarExpanded(true)}
                    onMouseLeave={() => setIsSidebarExpanded(false)}
                    className="h-full bg-white shadow-soft z-30 overflow-y-auto hide-scrollbar flex flex-col items-start py-6 gap-1 border-r border-gray-100"
                >
                    {categories.map((category) => {
                        const isActive = activeCategory === category.id;
                        const CategoryIcon = IconMap[category.icon || 'LayoutGrid'];
                        return (
                            <div
                                key={category.id}
                                onClick={() => setActiveCategory(category.id)}
                                className={`relative flex items-center w-full cursor-pointer group py-3 px-6 transition-all ${isActive ? 'bg-lime/5' : 'hover:bg-gray-50'}`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeCategoryIndicator"
                                        className="absolute left-0 w-1.5 h-8 bg-black rounded-r-full"
                                    />
                                )}

                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 ${isActive ? 'bg-lime text-black shadow-glow scale-105' : 'bg-light text-gray-400 group-hover:bg-white group-hover:text-black group-hover:shadow-sm'
                                    }`}>
                                    <CategoryIcon size={isActive ? 24 : 20} strokeWidth={isActive ? 2.5 : 2} />
                                </div>
                                <motion.span
                                    initial={false}
                                    animate={{
                                        opacity: isSidebarExpanded ? 1 : 0,
                                        x: isSidebarExpanded ? 12 : -10,
                                        display: isSidebarExpanded ? 'block' : 'none'
                                    }}
                                    className={`text-sm font-bold whitespace-nowrap ${isActive ? 'text-black' : 'text-gray-500'}`}
                                >
                                    {category.name}
                                </motion.span>
                            </div>
                        );
                    })}
                </motion.div>

                {/* Right Product Grid */}
                <div className="flex-1 h-full overflow-y-auto hide-scrollbar p-5 bg-light pb-32">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-black">
                            {categories.find(c => c.id === activeCategory)?.name}
                        </h2>
                        <button className="flex items-center text-sm font-semibold text-gray-500 bg-white px-3 py-1.5 rounded-full shadow-sm hover:shadow-soft transition-shadow">
                            <Filter size={14} className="mr-1.5" /> Filter
                        </button>
                    </div>

                    <motion.div
                        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        key={activeCategory} // Re-animate on category change
                    >
                        {products
                            .filter(p => activeCategory === 'all' || p.categoryId === activeCategory)
                            .map((product, i) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <ProductCard
                                        product={product}
                                        onClick={() => router.push(`/product/${product.id}`)}
                                    />
                                </motion.div>
                            ))}
                    </motion.div>
                </div>
            </div>

            {/* Live Cart Floating Bar */}
            <AnimatePresence>
                {totalItems > 0 && (
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="absolute bottom-0 left-0 right-0 p-4 z-40 bg-gradient-to-t from-black/5 via-transparent to-transparent pointer-events-none pb-6"
                    >
                        <div className="bg-black/90 backdrop-blur-xl rounded-[2.5rem] p-3 pr-2 shadow-2xl flex items-center justify-between pointer-events-auto border border-white/10 max-w-lg mx-auto">
                            <div className="flex flex-col ml-6">
                                <div className="flex items-center gap-2">
                                    <span className="text-white font-black text-2xl leading-none tracking-tighter">
                                        Rs. {totalPrice.toFixed(0)}
                                    </span>
                                    <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
                                        ({totalItems} items)
                                    </span>
                                </div>

                                {discountTotal > 0 && (
                                    <span className="text-lime-400 text-[10px] font-bold mt-1 tracking-tight">
                                        You save Rs. {discountTotal.toFixed(0)} with us!
                                    </span>
                                )}
                            </div>

                            <button
                                onClick={() => router.push('/address')}
                                className="h-12 px-8 bg-white text-black hover:bg-lime hover:shadow-glow rounded-full font-black uppercase tracking-widest shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center"
                            >
                                Checkout
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
