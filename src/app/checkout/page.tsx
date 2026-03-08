"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, MapPin, CreditCard, Apple, Receipt, ArrowRight, Loader2, Info, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/CartContext';
import { useProducts } from '@/lib/useProducts';
import { supabase } from '@/lib/supabase';

export default function CheckoutScreen() {
    const router = useRouter();
    const { items, totalPrice, discountTotal, clearCart } = useCart();
    const { products, loading: productsLoading } = useProducts();
    const [address, setAddress] = React.useState<any>(null);
    const [selectedPayment, setSelectedPayment] = React.useState('cod');
    const [isProcessing, setIsProcessing] = React.useState(false);

    React.useEffect(() => {
        const saved = localStorage.getItem('selectedAddress');
        if (saved) {
            setAddress(JSON.parse(saved));
        }
    }, []);

    // Calculate final totals
    const deliveryFee = 250;
    const finalTotal = totalPrice > 0 ? totalPrice + deliveryFee : 0;

    const [debugMsg, setDebugMsg] = React.useState<string>('');
    const [actionError, setActionError] = React.useState<string | null>(null);

    const handlePlaceOrder = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        setActionError(null);
        setDebugMsg("Step 1: Starting order process...");

        if (items.length === 0) {
            setActionError("Your cart is empty. Please add products first.");
            return;
        }
        if (!address) {
            setActionError("Delivery location not confirmed. Please select your address on the map.");
            return;
        }

        setIsProcessing(true);

        try {
            setDebugMsg("Step 2: Identifying merchant...");
            const firstItemProduct = products.find(p => p.id === items[0].productId);
            let shopId = firstItemProduct?.shopId;

            if (!shopId) {
                const { data: fallbackShop } = await supabase.from('shops').select('id').limit(1).single();
                shopId = fallbackShop?.id;
            }

            if (!shopId) {
                throw new Error("Merchant identification failed. Please refresh and try again.");
            }

            setDebugMsg("Step 3: Checking inventory...");
            for (const item of items) {
                const dbProd = products.find(p => p.id === item.productId);
                const { data: currentStockData, error: stockFetchError } = await supabase
                    .from('products')
                    .select('stock_quantity')
                    .eq('id', item.productId)
                    .single();

                if (stockFetchError) throw stockFetchError;

                const currentStock = currentStockData?.stock_quantity || 0;
                if (currentStock < item.quantity) {
                    throw new Error(`Limited stock for ${dbProd?.name || 'Item'}. available: ${currentStock}`);
                }

                const { error: updateError } = await supabase
                    .from('products')
                    .update({ stock_quantity: currentStock - item.quantity })
                    .eq('id', item.productId);

                if (updateError) throw updateError;
            }

            setDebugMsg("Step 4: Submitting order to Cloud...");
            const orderPayload = {
                shop_id: shopId,
                total_amount: finalTotal,
                status: 'pending',
                items: items.map(item => {
                    const p = products.find(prod => prod.id === item.productId);
                    return {
                        product_id: item.productId,
                        name: p?.name || 'Item',
                        price: p?.price || 0,
                        quantity: item.quantity
                    };
                })
            };

            const { error: orderError } = await supabase.from('orders').insert([orderPayload]);

            if (orderError) throw new Error("Database Error: " + orderError.message);

            setDebugMsg("Step 5: Success! Finalizing...");
            clearCart();
            router.push('/thank-you');
        } catch (error: any) {
            console.error("DEBUG ERROR:", error);
            setActionError(error.message || "System encountered an unexpected error.");
            setDebugMsg("Process halted due to error.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (productsLoading) {
        return (
            <div className="h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-lime animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-full bg-light flex flex-col font-sans overflow-hidden">
            {/* Header */}
            <div className="pt-8 pb-4 px-6 bg-white/80 backdrop-blur-xl shadow-sm sticky top-0 z-50 flex items-center justify-between shrink-0 border-b border-gray-100/50">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 bg-light rounded-full flex items-center justify-center hover:scale-105 transition-transform outline-none"
                >
                    <ChevronLeft size={24} className="text-black" />
                </button>
                <h1 className="text-xl font-extrabold tracking-tight text-black flex items-center gap-2">
                    Checkout
                    <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-black">STABLE</span>
                </h1>
                <div className="w-10 h-10" /> {/* Spacer */}
            </div>

            <div className="flex-1 overflow-y-auto hide-scrollbar p-6 flex flex-col gap-6 pb-40">
                {/* Debug & Error Banner */}
                {(isProcessing || debugMsg || actionError) && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`p-5 rounded-[2rem] border-2 shadow-sm ${actionError ? 'bg-red-50 border-red-200 text-red-700' : 'bg-lime/10 border-lime/30 text-lime-800'}`}
                    >
                        <div className="flex items-center gap-3">
                            {isProcessing ? <Loader2 className="animate-spin" size={18} /> : actionError ? <Info size={18} /> : <CheckCircle2 size={18} />}
                            <span className="font-extrabold text-sm uppercase tracking-tight">
                                {actionError ? "Processing Failed" : "System Status"}
                            </span>
                        </div>
                        <p className="mt-2 text-xs font-bold leading-relaxed">
                            {actionError || debugMsg}
                        </p>
                        {actionError && (
                            <button
                                onClick={() => handlePlaceOrder()}
                                className="mt-3 px-4 py-2 bg-red-600 text-white text-[10px] font-black uppercase rounded-full shadow-lg"
                            >
                                Try Again
                            </button>
                        )}
                    </motion.div>
                )}
                {/* Order Summary */}
                <section>
                    <h2 className="text-lg font-bold text-black mb-3">Order Summary</h2>
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-5">

                        {/* Detailed Items List */}
                        <div className="flex flex-col gap-4 max-h-[40vh] overflow-y-auto hide-scrollbar">
                            {items.map((cartItem, idx) => {
                                const prod = products.find(p => p.id === cartItem.productId);
                                if (!prod) return null;
                                return (
                                    <div key={idx} className="flex items-center gap-3">
                                        <div className="w-16 h-16 bg-gray-50 rounded-2xl p-2 border border-gray-100 shrink-0 relative">
                                            <img src={prod.image} alt={prod.name} className="w-full h-full object-contain mix-blend-multiply" />
                                            <div className="absolute -top-2 -right-2 bg-black text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                                                {cartItem.quantity}
                                            </div>
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center">
                                            <h3 className="text-sm font-bold text-black leading-tight line-clamp-2 mb-0.5">{prod.name}</h3>
                                            <p className="text-xs text-gray-500 font-medium">{prod.weight}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-black">Rs. {(prod.price * cartItem.quantity).toFixed(2)}</p>
                                        </div>
                                    </div>
                                )
                            })}
                            {items.length === 0 && <p className="text-sm text-gray-400">Your cart is empty.</p>}
                        </div>

                        <div className="h-px w-full bg-gray-100" />

                        {/* Cost Breakdown */}
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium">Subtotal</span>
                                <span className="font-bold text-black">Rs. {(totalPrice + discountTotal).toFixed(2)}</span>
                            </div>

                            {discountTotal > 0 && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-lime-600 font-medium flex items-center gap-1">
                                        <Receipt size={14} /> Discount
                                    </span>
                                    <span className="font-bold text-lime-600">-Rs. {discountTotal.toFixed(2)}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium">Delivery Fee</span>
                                <span className="font-bold text-black">Rs. {deliveryFee.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="h-px w-full bg-gray-100 border-dashed border-b" />

                        <div className="flex justify-between items-center">
                            <span className="font-extrabold text-black text-lg">Total</span>
                            <span className="font-black text-black text-2xl">Rs. {finalTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </section>

                {/* Delivery Address */}
                <section>
                    <h2 className="text-lg font-bold text-black mb-3">Delivery Address</h2>
                    <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-lime/10 rounded-2xl flex items-center justify-center shrink-0">
                            <MapPin className="text-lime-600" size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-black text-sm truncate">{address?.mainText || 'Select Location'}</h3>
                            <p className="text-gray-400 text-xs mt-0.5 line-clamp-1 truncate">
                                {address?.subText || 'Please pinpoint your address on the map'}
                            </p>
                        </div>
                        <button
                            onClick={() => router.push('/address')}
                            className="text-lime-600 font-bold text-sm bg-lime/10 px-3 py-1.5 rounded-full hover:bg-lime/20 transition-colors shrink-0"
                        >
                            Edit
                        </button>
                    </div>
                </section>

                {/* Payment Method */}
                <section>
                    <h2 className="text-lg font-bold text-black mb-3">Payment Method</h2>
                    <div className="flex flex-col gap-3">
                        {/* Cash on Delivery */}
                        <label
                            onClick={() => setSelectedPayment('cod')}
                            className={`bg-white p-4 rounded-3xl shadow-sm border transition-all cursor-pointer flex items-center justify-between ${selectedPayment === 'cod' ? 'border-lime ring-2 ring-lime/20' : 'border-gray-100 opacity-70 hover:opacity-100'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                                    <Receipt size={20} />
                                </div>
                                <span className="font-bold text-black text-sm">Cash on Delivery</span>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPayment === 'cod' ? 'border-lime bg-lime' : 'border-gray-200'}`}>
                                {selectedPayment === 'cod' && <div className="w-2 h-2 bg-black rounded-full" />}
                            </div>
                        </label>

                        {/* PayHere */}
                        <label
                            onClick={() => setSelectedPayment('payhere')}
                            className={`bg-white p-4 rounded-3xl shadow-sm border transition-all cursor-pointer flex items-center justify-between ${selectedPayment === 'payhere' ? 'border-lime ring-2 ring-lime/20' : 'border-gray-100 opacity-70 hover:opacity-100'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                    <CreditCard size={20} />
                                </div>
                                <div>
                                    <span className="font-bold text-black text-sm">PayHere</span>
                                    <span className="text-[10px] text-gray-500 font-medium block">Cards / Mobile Wallets</span>
                                </div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPayment === 'payhere' ? 'border-lime bg-lime' : 'border-gray-200'}`}>
                                {selectedPayment === 'payhere' && <div className="w-2 h-2 bg-black rounded-full" />}
                            </div>
                        </label>

                        {/* Koko */}
                        <label
                            onClick={() => setSelectedPayment('koko')}
                            className={`bg-white p-4 rounded-3xl shadow-sm border transition-all cursor-pointer flex items-center justify-between ${selectedPayment === 'koko' ? 'border-lime ring-2 ring-lime/20' : 'border-gray-100 opacity-70 hover:opacity-100'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                                    <div className="font-black italic text-xs text-center leading-none">koko</div>
                                </div>
                                <div>
                                    <span className="font-bold text-black text-sm">Koko Pay</span>
                                    <span className="text-[10px] text-gray-500 font-medium block">Pay in 3 installments</span>
                                </div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPayment === 'koko' ? 'border-lime bg-lime' : 'border-gray-200'}`}>
                                {selectedPayment === 'koko' && <div className="w-2 h-2 bg-black rounded-full" />}
                            </div>
                        </label>

                        {/* Mintpay */}
                        <label
                            onClick={() => setSelectedPayment('mintpay')}
                            className={`bg-white p-4 rounded-3xl shadow-sm border transition-all cursor-pointer flex items-center justify-between ${selectedPayment === 'mintpay' ? 'border-lime ring-2 ring-lime/20' : 'border-gray-100 opacity-70 hover:opacity-100'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
                                    <div className="font-black text-[10px] uppercase tracking-tighter text-center leading-none">Mint</div>
                                </div>
                                <div>
                                    <span className="font-bold text-black text-sm">Mintpay</span>
                                    <span className="text-[10px] text-gray-500 font-medium block">Split into 3 monthly</span>
                                </div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPayment === 'mintpay' ? 'border-lime bg-lime' : 'border-gray-200'}`}>
                                {selectedPayment === 'mintpay' && <div className="w-2 h-2 bg-black rounded-full" />}
                            </div>
                        </label>
                    </div>
                </section>

            </div>

            {/* Bottom Action Bar */}
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute bottom-0 left-0 right-0 p-4 z-40 bg-white shadow-[0_-20px_40px_-5px_rgba(0,0,0,0.05)] border-t border-gray-100/50"
            >
                <button
                    disabled={items.length === 0 || isProcessing}
                    onClick={handlePlaceOrder}
                    className="w-full h-16 bg-lime text-black rounded-[2rem] font-bold shadow-glow hover:scale-105 active:scale-95 transition-all flex items-center justify-center text-lg disabled:opacity-50 disabled:pointer-events-none group relative overflow-hidden"
                >
                    {isProcessing ? (
                        <div className="flex items-center gap-3">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            >
                                <Loader2 size={24} />
                            </motion.div>
                            Processing...
                        </div>
                    ) : (
                        <>
                            Place Order
                            <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </motion.div>
        </div>
    );
}
