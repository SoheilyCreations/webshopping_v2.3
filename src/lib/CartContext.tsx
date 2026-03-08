"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useProducts } from './useProducts';

type CartItem = {
    productId: string;
    quantity: number;
    selectedWeight?: string;
};

type CartContextType = {
    items: CartItem[];
    addItem: (productId: string, qty: number, weight?: string) => void;
    removeItem: (productId: string, weight?: string) => void;
    updateQuantity: (productId: string, qty: number, weight?: string) => void;
    totalItems: number;
    subtotal: number;
    discountTotal: number;
    totalPrice: number;
    getQuantity: (productId: string, weight?: string) => number;
    clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const { products } = useProducts();

    const addItem = (productId: string, qty: number, weight?: string) => {
        setItems((prev) => {
            const existing = prev.find(item => item.productId === productId && item.selectedWeight === weight);
            if (existing) {
                return prev.map(item =>
                    (item.productId === productId && item.selectedWeight === weight)
                        ? { ...item, quantity: item.quantity + qty }
                        : item
                );
            }
            return [...prev, { productId, quantity: qty, selectedWeight: weight }];
        });
    };

    const removeItem = (productId: string, weight?: string) => {
        setItems((prev) => prev.filter(item => !(item.productId === productId && item.selectedWeight === weight)));
    };

    const updateQuantity = (productId: string, qty: number, weight?: string) => {
        if (qty <= 0) {
            removeItem(productId, weight);
            return;
        }
        setItems((prev) => prev.map(item =>
            (item.productId === productId && item.selectedWeight === weight)
                ? { ...item, quantity: qty }
                : item
        ));
    };

    const getQuantity = (productId: string, weight?: string) => {
        return items.find(item => item.productId === productId && item.selectedWeight === weight)?.quantity || 0;
    };

    const cartDetails = items.map(item => {
        const product = products.find(p => p.id === item.productId);
        let price = product?.price || 0;
        let originalPrice = product?.originalPrice || price;

        // Find specific price if weight options exist
        if (item.selectedWeight && product?.weightOptions) {
            const option = product.weightOptions.find(o => o.label === item.selectedWeight);
            if (option) {
                price = option.price;
                originalPrice = option.originalPrice || price;
            }
        }

        return {
            price,
            originalPrice,
            quantity: item.quantity
        };
    });

    const subtotal = cartDetails.reduce((acc, curr) => acc + (curr.originalPrice * curr.quantity), 0);
    const totalPrice = cartDetails.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    const discountTotal = subtotal - totalPrice;
    const totalItems = items.reduce((acc, curr) => acc + curr.quantity, 0);

    const clearCart = () => {
        setItems([]);
    };

    return (
        <CartContext.Provider value={{
            items,
            addItem,
            removeItem,
            updateQuantity,
            getQuantity,
            totalItems,
            subtotal,
            discountTotal,
            totalPrice,
            clearCart
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
