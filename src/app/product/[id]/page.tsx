"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts } from '@/lib/useProducts';
import { Button } from '@/components/ui/Button';
import {
    ChevronLeft,
    Star,
    Heart,
    Clock,
    ChevronDown,
    CheckCircle2,
    Minus,
    Plus,
    ShieldCheck,
    Truck,
    Info,
    ShoppingBag,
    Store,
    MessageSquare,
    ThumbsUp,
    Scale,
    Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/CartContext';

export default function ProductDetailsScreen({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { addItem, totalItems } = useCart();
    const { products, loading } = useProducts();

    // Find the current product
    const product = products.find((p) => p.id === params.id);

    // Weight selection state - Move hooks to be conditional or after checks?
    // React hooks MUST be called at the top level. So we use placeholders if loading.
    const [selectedWeight, setSelectedWeight] = useState('');
    const [activeImage, setActiveImage] = useState('');
    const [isDetailsOpen, setIsDetailsOpen] = useState(true);
    const [isReviewsOpen, setIsReviewsOpen] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [isFavorite, setIsFavorite] = useState(false);
    const [userRating, setUserRating] = useState(0);

    // Sync state when product loads
    React.useEffect(() => {
        if (product) {
            setSelectedWeight(product.weightOptions?.[0]?.label || product.weight);
            setActiveImage(product.image);
        }
    }, [product]);

    if (loading) {
        return (
            <div className="h-full bg-white flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-lime animate-spin" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="h-full bg-white flex flex-col items-center justify-center p-6 text-center">
                <h2 className="text-2xl font-black text-black mb-4">Product Not Found</h2>
                <Button onClick={() => router.push('/basket')}>Back to Shop</Button>
            </div>
        );
    }

    // Find price based on selected weight
    const currentWeightOption = product.weightOptions?.find(o => o.label === selectedWeight);
    const activePrice = currentWeightOption ? currentWeightOption.price : product.price;
    const activeOriginalPrice = currentWeightOption ? currentWeightOption.originalPrice : product.originalPrice;

    const handleAddToCart = () => {
        addItem(product.id, quantity, selectedWeight);
    };

    const savings = activeOriginalPrice ? activeOriginalPrice - activePrice : 0;
    const savingsPercentage = activeOriginalPrice ? Math.round((savings / activeOriginalPrice) * 100) : 0;

    const mockReviews = [
        { id: 1, user: "Kamal Perera", rating: 5, date: "2 days ago", comment: "Very fresh and high quality. Highly recommended!" },
        { id: 2, user: "Sarah J.", rating: 4, date: "1 week ago", comment: "Good taste, though slight delay in delivery." }
    ];

    return (
        <div className="h-full bg-white font-sans flex flex-col relative overflow-hidden">

            {/* Header Overlay - Universal */}
            <div className="absolute top-0 w-full z-50 pt-8 pb-4 px-6 flex items-center justify-between pointer-events-none">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 bg-white shadow-soft rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all pointer-events-auto border border-gray-100"
                >
                    <ChevronLeft size={24} className="text-black" />
                </button>
                <div className="flex gap-3 pointer-events-auto">
                    <button
                        onClick={() => setIsFavorite(!isFavorite)}
                        className="w-10 h-10 bg-white shadow-soft rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all border border-gray-100"
                    >
                        <Heart size={20} className={isFavorite ? "fill-red-500 text-red-500" : "text-black"} />
                    </button>
                    <button
                        onClick={() => router.push('/basket')}
                        className="relative w-10 h-10 bg-white shadow-soft rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all border border-gray-100"
                    >
                        <ShoppingBag size={20} className="text-black" />
                        {totalItems > 0 && (
                            <span className="absolute -top-1 -right-1 bg-lime text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                                {totalItems}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto hide-scrollbar pb-32 md:pb-0 md:flex md:overflow-hidden md:bg-white">

                {/* Visual Section */}
                <section className="relative pt-20 pb-12 bg-gradient-to-b from-lime/5 to-white md:bg-lime/5 rounded-b-[4rem] md:rounded-none md:flex-1 md:flex md:flex-col md:justify-center md:items-center md:p-12 shrink-0 md:z-0">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-72 h-72 md:w-96 md:h-96 relative flex items-center justify-center pointer-events-none"
                    >
                        <motion.div
                            animate={{ y: [0, -15, 0] }}
                            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                            className="relative z-10 w-full h-full flex items-center justify-center"
                        >
                            <img
                                src={activeImage}
                                alt={product.name}
                                className="max-w-[90%] max-h-[90%] object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.15)]"
                            />
                        </motion.div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-8 bg-black/5 blur-2xl rounded-full scale-x-150" />
                    </motion.div>

                    <div className="flex gap-4 mt-12 px-6 justify-center">
                        {[product.image, ... (product.variants || [])].map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveImage(img)}
                                className={`w-16 h-16 md:w-20 md:h-20 rounded-3xl p-2 transition-all relative ${activeImage === img
                                    ? 'bg-white shadow-glow ring-2 ring-lime border-transparent'
                                    : 'bg-white/50 border border-black/5'
                                    }`}
                            >
                                <img src={img} alt="variant" className="w-full h-full object-contain mix-blend-multiply" />
                            </button>
                        ))}
                    </div>
                </section>

                {/* Info Section */}
                <div className="px-6 mt-8 flex flex-col gap-8 md:flex-1 md:mt-0 md:p-16 md:overflow-y-auto md:hide-scrollbar md:bg-white md:rounded-l-[4rem] md:shadow-2xl md:relative md:z-10 md:-ml-12 border-none">

                    {/* Identification & Discount */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-light px-3 py-1.5 rounded-full border border-gray-100">
                            <Store size={14} className="text-lime-600" />
                            <span className="text-[10px] font-black text-black uppercase tracking-widest">Seller: {product.vendor || 'Green Harvest'}</span>
                        </div>
                        {savingsPercentage > 0 && (
                            <div className="bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm animate-pulse">
                                Save {savingsPercentage}% OFF
                            </div>
                        )}
                    </div>

                    {/* Title & Price Header */}
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-black leading-[0.9] tracking-tighter uppercase mb-2">
                            {product.name}
                        </h1>
                        <p className="text-gray-400 text-[10px] font-black uppercase mb-6 flex items-center gap-2">
                            <Scale size={14} /> Freshness Guaranteed
                        </p>

                        <div className="flex items-center gap-4">
                            <div className="flex flex-col">
                                {activeOriginalPrice && (
                                    <span className="text-xs font-bold text-gray-300 line-through leading-none mb-1">Rs. {activeOriginalPrice.toFixed(0)}</span>
                                )}
                                <div className="text-4xl font-black text-lime-600 tracking-tighter leading-none">Rs.{activePrice.toFixed(0)}</div>
                            </div>
                            <div className="h-10 w-px bg-gray-100" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Unit Weight</span>
                                <span className="text-sm font-black text-black uppercase">{selectedWeight}</span>
                            </div>
                        </div>
                    </div>

                    {/* Weight / Unit Selector */}
                    <div>
                        <span className="text-[10px] font-black text-black uppercase tracking-widest mb-4 block">Select Package Unit</span>
                        <div className="flex flex-wrap gap-3">
                            {(product.weightOptions || [{ label: product.weight, price: product.price }]).map((opt) => (
                                <button
                                    key={opt.label}
                                    onClick={() => setSelectedWeight(opt.label)}
                                    className={`px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border-2 ${selectedWeight === opt.label
                                        ? 'bg-black text-white border-black shadow-lg scale-105'
                                        : 'bg-light text-gray-400 border-transparent hover:border-gray-200'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Rating Interactive Bar */}
                    <div className="flex items-center gap-1 bg-light/50 p-4 rounded-3xl border border-gray-100">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onMouseEnter={() => setUserRating(star)}
                                onMouseLeave={() => setUserRating(0)}
                                onClick={() => setUserRating(star)}
                                className="transition-transform hover:scale-125 active:scale-95"
                            >
                                <Star
                                    size={24}
                                    fill={star <= (userRating || product.rating) ? "#FFDD00" : "transparent"}
                                    color={star <= (userRating || product.rating) ? "#FFDD00" : "#E5E7EB"}
                                    strokeWidth={2}
                                />
                            </button>
                        ))}
                        <span className="ml-4 text-sm font-black text-black tracking-tight">{product.rating} / 5.0</span>
                        <div className="w-1 h-1 bg-gray-300 rounded-full mx-2" />
                        <span className="text-gray-400 font-bold text-xs uppercase tracking-tighter">1.2k Total Reviews</span>
                    </div>

                    {/* Features Tiles */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-light/40 p-6 rounded-[3rem] flex items-center md:flex-col md:text-center gap-5 border border-gray-100/50 hover:bg-white transition-colors">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-lime-600 shadow-sm shrink-0">
                                <ShieldCheck size={28} />
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-black uppercase tracking-tight mb-1">Quality</h4>
                                <p className="text-[10px] font-bold text-gray-500 uppercase leading-tight">Certified Fresh</p>
                            </div>
                        </div>
                        <div className="bg-light/40 p-6 rounded-[3rem] flex items-center md:flex-col md:text-center gap-5 border border-gray-100/50 hover:bg-white transition-colors">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm shrink-0">
                                <Truck size={28} />
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-black uppercase tracking-tight mb-1">Express</h4>
                                <p className="text-[10px] font-bold text-gray-500 uppercase leading-tight">30 Min Delivery</p>
                            </div>
                        </div>
                        <div className="bg-light/40 p-6 rounded-[3rem] flex items-center md:flex-col md:text-center gap-5 border border-gray-100/50 hover:bg-white transition-colors">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-orange-500 shadow-sm shrink-0">
                                <Info size={28} />
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-black uppercase tracking-tight mb-1">Natural</h4>
                                <p className="text-[10px] font-bold text-gray-500 uppercase leading-tight">Pesticide Free</p>
                            </div>
                        </div>
                    </div>

                    {/* Premium Shopping Control Center */}
                    <div className="relative mt-8 group">
                        {/* Soft Ambient Glow */}
                        <div className="absolute -inset-4 bg-gradient-to-r from-lime/20 via-blue-500/10 to-lime/20 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000 -z-10" />

                        <div className="bg-white rounded-[3rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden">
                            {/* Top Tier: Selection Info */}
                            <div className="bg-light/50 px-8 py-5 flex items-center justify-between border-b border-gray-100">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Select Quantity</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-lime rounded-full" />
                                        <span className="text-xs font-black text-black uppercase tracking-tight">{selectedWeight} Fresh Pack</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 bg-white p-1 rounded-full shadow-sm border border-gray-100">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-10 bg-light hover:bg-gray-100 text-black rounded-full flex items-center justify-center transition-all active:scale-90"
                                    >
                                        <Minus size={18} strokeWidth={3} />
                                    </button>
                                    <span className="text-xl font-black text-black min-w-[30px] text-center">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-10 h-10 bg-lime text-black rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-90 shadow-glow"
                                    >
                                        <Plus size={18} strokeWidth={3} />
                                    </button>
                                </div>
                            </div>

                            {/* Main Lower Tier: Pricing & Action */}
                            <div className="p-8 pt-10 flex flex-col md:flex-row items-center gap-8">
                                <div className="flex-1 w-full text-center md:text-left">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 leading-none">Total Price</span>
                                        <div className="flex items-baseline justify-center md:justify-start gap-1">
                                            <span className="text-xl font-black text-black">Rs.</span>
                                            <span className="text-5xl font-black text-black tracking-tighter">{(activePrice * quantity).toFixed(0)}</span>
                                        </div>
                                        {savings > 0 && (
                                            <div className="mt-3 inline-flex items-center justify-center md:justify-start gap-2">
                                                <div className="px-2 py-1 bg-lime/20 rounded flex items-center">
                                                    <span className="text-[10px] font-black text-lime-700 uppercase tracking-tight">You Save Rs. {(savings * quantity).toFixed(0)}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Button
                                    onClick={handleAddToCart}
                                    className="h-24 w-full md:w-auto md:min-w-[280px] bg-black text-white rounded-[2.5rem] relative overflow-hidden group/btn shadow-xl hover:shadow-glow-lime transition-all duration-500"
                                >
                                    <div className="relative z-10 flex items-center justify-center gap-5 px-8">
                                        <span className="text-xl font-black uppercase tracking-widest">Add to Basket</span>
                                        <div className="w-12 h-12 bg-lime text-black rounded-full flex items-center justify-center shadow-lg group-hover/btn:scale-110 transition-transform">
                                            <ShoppingBag size={24} strokeWidth={3} />
                                        </div>
                                    </div>
                                    {/* Animated light effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Accordion List (Details & Reviews) */}
                    <div className="space-y-4 mb-10">
                        {/* Info Accordion */}
                        <div className="bg-light px-6 py-2 rounded-3xl border border-gray-100">
                            <button
                                onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                                className="w-full flex items-center justify-between py-4"
                            >
                                <span className="text-lg font-black text-black uppercase tracking-tight flex items-center gap-3">
                                    <Info size={20} className="text-lime-600" /> Information
                                </span>
                                <div className={`transition-transform duration-300 ${isDetailsOpen ? 'rotate-180' : ''}`}>
                                    <ChevronDown size={20} className="text-black" strokeWidth={3} />
                                </div>
                            </button>
                            <AnimatePresence>
                                {isDetailsOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="pb-6 pt-2">
                                            <p className="text-gray-500 font-medium leading-[1.6] text-sm md:text-base">
                                                Sourced directly from our partner farms in the heart of Nuwara Eliya.
                                                Our {product.name.toLowerCase()} are hand-selected for size, color, and texture
                                                to ensure you receive only the finest premium produce.
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Reviews Accordion */}
                        <div className="bg-light px-6 py-2 rounded-3xl border border-gray-100">
                            <button
                                onClick={() => setIsReviewsOpen(!isReviewsOpen)}
                                className="w-full flex items-center justify-between py-4"
                            >
                                <span className="text-lg font-black text-black uppercase tracking-tight flex items-center gap-3">
                                    <MessageSquare size={20} className="text-blue-500" /> Customer Reviews
                                </span>
                                <div className={`transition-transform duration-300 ${isReviewsOpen ? 'rotate-180' : ''}`}>
                                    <ChevronDown size={20} className="text-black" strokeWidth={3} />
                                </div>
                            </button>
                            <AnimatePresence>
                                {isReviewsOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="pb-6 pt-2 flex flex-col gap-4">
                                            {mockReviews.map(review => (
                                                <div key={review.id} className="bg-white p-4 rounded-2xl border border-gray-100">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h5 className="font-black text-black text-xs uppercase">{review.user}</h5>
                                                            <div className="flex gap-0.5 mt-1">
                                                                {[...Array(review.rating)].map((_, i) => <Star key={i} size={10} fill="#FFDD00" color="#FFDD00" />)}
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] font-bold text-gray-400">{review.date}</span>
                                                    </div>
                                                    <p className="text-xs font-medium text-gray-600 italic">"{review.comment}"</p>
                                                </div>
                                            ))}
                                            <Button variant="outline" className="w-full h-12 rounded-2xl border-dashed border-2 hover:bg-white flex items-center gap-2">
                                                <ThumbsUp size={16} /> Write a Review
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Mobile Action Bar */}
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="md:hidden absolute bottom-0 left-0 right-0 p-6 z-50 bg-white/90 backdrop-blur-xl border-t border-gray-100/50 rounded-t-[3rem] shadow-float-up flex items-center justify-between"
            >
                <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none block mb-1">Pay Now</span>
                    <span className="text-2xl font-black text-black tracking-tighter leading-none">Rs.{(activePrice * quantity).toFixed(0)}</span>
                </div>
                <Button
                    onClick={handleAddToCart}
                    className="h-14 px-8 rounded-full bg-black text-white font-black uppercase tracking-widest shadow-glow-lime flex items-center gap-3 active:scale-95 transition-transform"
                >
                    Add <ShoppingBag size={18} />
                </Button>
            </motion.div>
        </div>
    );
}
