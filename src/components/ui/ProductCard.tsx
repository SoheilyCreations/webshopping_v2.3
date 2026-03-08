import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

import { useCart } from '@/lib/CartContext';

interface ProductCardProps {
    product: any;
    onClick?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
    const { getQuantity, addItem, updateQuantity } = useCart();
    const quantity = getQuantity(product.id);

    const handleAdd = (e: React.MouseEvent) => {
        e.stopPropagation();
        addItem(product.id, 1);
    };

    const handleIncrement = (e: React.MouseEvent) => {
        e.stopPropagation();
        updateQuantity(product.id, quantity + 1);
    };

    const handleDecrement = (e: React.MouseEvent) => {
        e.stopPropagation();
        updateQuantity(product.id, quantity - 1);
    };

    return (
        <motion.div
            onClick={onClick}
            whileHover={{ y: -4 }}
            className="relative bg-white/70 backdrop-blur-xl rounded-[1.5rem] p-3 shadow-sm border border-white/50 cursor-pointer flex flex-col h-full overflow-hidden hover:shadow-soft transition-all"
        >
            {/* Discount Badge */}
            {product.discount && (
                <div className="absolute top-2 left-2 z-10 bg-[#FFDD00] text-black text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                    {product.discount}
                </div>
            )}

            {/* Sold Out Overlay */}
            {product.soldOut && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-[1.5rem]">
                    <span className="bg-black/80 text-white px-3 py-1.5 rounded-full font-bold text-xs tracking-wider shadow-md">
                        SOLD OUT
                    </span>
                </div>
            )}

            {/* Image Container - Modern soft look */}
            <div className="relative aspect-[4/3] w-full mb-3 bg-gradient-to-b from-transparent to-gray-50/50 rounded-xl flex items-center justify-center p-2 group overflow-hidden">
                <motion.img
                    initial={false}
                    whileHover={{ scale: 1.05 }}
                    src={product.image}
                    alt={product.name}
                    className="object-contain max-h-full drop-shadow-md mix-blend-multiply transition-transform duration-300"
                />
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1">
                <div className="flex justify-between items-start mb-1 gap-1">
                    <h3 className="text-[13px] font-bold text-gray-900 leading-tight line-clamp-2 flex-1">
                        {product.name}
                    </h3>
                    <span className="text-[10px] font-bold text-lime-600 bg-lime/10 px-1.5 py-0.5 rounded-md whitespace-nowrap">
                        ★ {product.rating}
                    </span>
                </div>

                <span className="text-gray-400 text-[11px] font-semibold mb-3">{product.weight}</span>

                <div className="flex items-end justify-between mt-auto h-9">
                    <div className="flex flex-col justify-end">
                        {product.originalPrice && (
                            <span className="text-gray-300 text-[10px] line-through leading-none font-medium mb-0.5">
                                Rs. {product.originalPrice.toFixed(2)}
                            </span>
                        )}
                        <span className="text-[15px] font-black text-black leading-none">
                            Rs. {product.price.toFixed(2)}
                        </span>
                    </div>

                    {/* Add to Cart / Quantity Selector */}
                    <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                        <AnimatePresence mode="wait">
                            {quantity === 0 ? (
                                <motion.button
                                    key="add-btn"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    onClick={handleAdd}
                                    disabled={product.soldOut}
                                    className="h-8 w-8 bg-black text-lime rounded-full flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    <Plus size={16} className="stroke-[3px]" />
                                </motion.button>
                            ) : (
                                <motion.div
                                    key="qty-selector"
                                    initial={{ opacity: 0, width: 32 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 32 }}
                                    className="h-8 bg-lime flex items-center justify-between rounded-full shadow-glow px-1 gap-2"
                                >
                                    <button
                                        onClick={handleDecrement}
                                        className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-colors text-black"
                                    >
                                        <Minus size={14} className="stroke-[3px]" />
                                    </button>
                                    <span className="font-bold text-black text-xs w-3 text-center">{quantity}</span>
                                    <button
                                        onClick={handleIncrement}
                                        className="w-6 h-6 rounded-full bg-black text-lime flex items-center justify-center hover:bg-gray-900 transition-colors"
                                    >
                                        <Plus size={14} className="stroke-[3px]" />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
