"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    ShoppingCart,
    Box,
    Settings,
    Plus,
    Search,
    Save,
    Trash2,
    Store,
    MapPin,
    ArrowUpRight,
    TrendingUp,
    Package,
    Edit3,
    CheckCircle2,
    X,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';

// Types for our POS
interface Shop {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
}

interface Product {
    id: string;
    shop_id: string;
    name: string;
    price: number;
    original_price?: number;
    stock_quantity: number;
    category: string;
    image_url?: string;
}

export default function MerchantPOS() {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'inventory' | 'billing' | 'settings'>('dashboard');
    const [isLoading, setIsLoading] = useState(true);
    const [isRegistering, setIsRegistering] = useState(false);
    const [shop, setShop] = useState<Shop | null>(null);
    const [newShopName, setNewShopName] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [todayOrders, setTodayOrders] = useState<any[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAddingProduct, setIsAddingProduct] = useState(false);

    // Inventory State
    const [inventorySearchQuery, setInventorySearchQuery] = useState('');
    const [inventoryFilterCategory, setInventoryFilterCategory] = useState('All');

    // Billing State
    const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
    const [billingSearchQuery, setBillingSearchQuery] = useState('');
    const [isProcessingBill, setIsProcessingBill] = useState(false);

    // Derived Billing Data
    const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const dailyRevenue = todayOrders.reduce((acc, order) => acc + order.total_amount, 0);
    const grandTotal = subtotal; // Can add tax/discount logic here later

    // New Product State
    const [newProduct, setNewProduct] = useState({
        name: '',
        price: '',
        category: 'Vegetables',
        stock: '10'
    });

    // Initial Data Fetch
    useEffect(() => {
        fetchInitialData();

        // Real-time subscription for POS sync
        const channel = supabase
            .channel('pos-sync')
            .on('postgres_changes', { event: '*', table: 'products', schema: 'public' }, () => {
                fetchInitialData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    async function fetchInitialData() {
        setIsLoading(true);
        try {
            // For testing, we'll fetch the first shop in the database
            const { data: shopData } = await supabase.from('shops').select('*').limit(1).single();
            if (shopData) {
                setShop(shopData);
                const { data: productsData } = await supabase
                    .from('products')
                    .select('*')
                    .eq('shop_id', shopData.id)
                    .order('name', { ascending: true });
                setProducts(productsData || []);

                // Fetch Today's Orders
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const { data: ordersData } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('shop_id', shopData.id)
                    .order('created_at', { ascending: false }); // Fetch all recent to manage
                setTodayOrders(ordersData || []);
            }
        } catch (error) {
            console.error('Error fetching POS data:', error);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleUpdateOrderStatus(orderId: string, newStatus: string) {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId);

            if (error) throw error;

            setTodayOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        } catch (error) {
            console.error("Status update failed", error);
            alert("Failed to update status");
        }
    }

    async function handleRegisterShop() {
        if (!newShopName.trim()) return;
        setIsRegistering(true);
        try {
            const { data, error } = await supabase
                .from('shops')
                .insert([{
                    name: newShopName,
                    owner_email: 'demo@webshopping.lk',
                    latitude: 6.9271, // Demo Colombo Lat
                    longitude: 79.8612 // Demo Colombo Lng
                }])
                .select()
                .single();

            if (error) {
                console.error('Supabase Insert Error:', error);
                alert('Database registration failed: ' + error.message);
                throw error;
            }

            if (data) {
                console.log('Shop Registered Successfully:', data);
                setShop(data);
                setProducts([]);
            }
        } catch (error) {
            console.error('Registration failed:', error);
        } finally {
            setIsRegistering(false);
        }
    }

    async function handleAddProduct() {
        if (!shop || !newProduct.name || !newProduct.price) return;
        setIsAddingProduct(true);
        try {
            const { error } = await supabase
                .from('products')
                .insert([{
                    shop_id: shop.id,
                    name: newProduct.name,
                    price: parseFloat(newProduct.price),
                    stock_quantity: parseInt(newProduct.stock),
                    category: newProduct.category
                }]);

            if (error) throw error;

            // Reset and refresh
            setNewProduct({ name: '', price: '', category: 'Vegetables', stock: '10' });
            setIsAddModalOpen(false);
            fetchInitialData();
        } catch (error) {
            console.error('Add product failed:', error);
            alert('Failed to add product');
        } finally {
            setIsAddingProduct(false);
        }
    }

    // Billing Logic Functions
    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
        setBillingSearchQuery(''); // Clear search after adding
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.product.id === productId) {
                const newQty = Math.max(0, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const handleCheckout = async () => {
        if (cart.length === 0 || !shop) return;
        setIsProcessingBill(true);
        try {
            // Update stock for each product in Supabase
            for (const item of cart) {
                const { error } = await supabase
                    .from('products')
                    .update({ stock_quantity: item.product.stock_quantity - item.quantity })
                    .eq('id', item.product.id);

                if (error) throw error;
            }

            // Record the sale (Optional but good for history)
            await supabase.from('orders').insert([{
                shop_id: shop.id,
                total_amount: grandTotal,
                status: 'completed',
                items: cart.map(item => ({
                    product_id: item.product.id,
                    name: item.product.name,
                    price: item.product.price,
                    quantity: item.quantity
                }))
            }]);

            alert('Bill Processed Successfully!');
            setCart([]);
            fetchInitialData(); // Refresh inventory
        } catch (error) {
            console.error('Checkout failed:', error);
            alert('Error processing checkout. Please try again.');
        } finally {
            setIsProcessingBill(false);
        }
    };

    if (isLoading) {
        return (
            <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center text-white">
                <Loader2 className="w-12 h-12 animate-spin text-lime mb-4" />
                <p className="font-black uppercase tracking-widest text-xs opacity-50">Initializing Control Center...</p>
            </div>
        );
    }

    // If no shop exists, show a simple setup screen
    if (!shop) {
        return (
            <div className="h-screen w-full bg-slate-950 flex items-center justify-center p-6">
                <div className="bg-slate-900 border border-white/10 p-10 rounded-[2.5rem] max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-lime/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Store size={40} className="text-lime" />
                    </div>
                    <h1 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase">Welcome, Partner!</h1>
                    <p className="text-white/40 text-sm mb-8 leading-relaxed">
                        Start your digital journey by registering your shop. It's free and takes 30 seconds.
                    </p>

                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Enter Shop Name (e.g. Perera Stores)"
                            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-white font-bold focus:outline-none focus:border-lime/50 transition-all"
                            value={newShopName}
                            onChange={(e) => setNewShopName(e.target.value)}
                        />
                        <Button
                            onClick={handleRegisterShop}
                            disabled={isRegistering || !newShopName}
                            className="w-full h-14 bg-white text-black rounded-2xl font-black uppercase tracking-widest disabled:opacity-50"
                        >
                            {isRegistering ? 'Registering...' : 'Launch My Store'}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-black text-white flex font-sans overflow-hidden">

            {/* Engineering Sidebar - Only visible if shop exists */}
            {shop && (
                <aside className="w-24 md:w-64 bg-slate-950 border-r border-white/5 flex flex-col p-4 md:p-6 shrink-0 relative z-[60]">
                    <div className="flex items-center gap-3 mb-12 px-2">
                        <div className="w-10 h-10 bg-lime rounded-xl flex items-center justify-center shadow-glow-lime shrink-0">
                            <Store size={20} className="text-black stroke-[3px]" />
                        </div>
                        <div className="hidden md:flex flex-col overflow-hidden">
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-white/40 leading-none mb-1">POS Central</span>
                            <span className="text-sm font-black text-white truncate uppercase">{shop.name}</span>
                        </div>
                    </div>

                    <nav className="flex flex-col gap-2">
                        {[
                            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                            { id: 'orders', icon: Package, label: 'Live Orders' },
                            { id: 'inventory', icon: Box, label: 'Inventory' },
                            { id: 'billing', icon: ShoppingCart, label: 'Fast Billing' },
                            { id: 'settings', icon: Settings, label: 'Settings' }
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id as any)}
                                className={`flex items-center gap-4 p-4 rounded-2xl transition-all group ${activeTab === item.id
                                    ? 'bg-lime text-black shadow-glow-lime'
                                    : 'text-white/40 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <item.icon size={22} strokeWidth={activeTab === item.id ? 3 : 2} />
                                <span className="hidden md:block font-black text-xs uppercase tracking-widest">{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    <div className="mt-auto md:p-4 bg-white/5 rounded-3xl border border-white/5 hidden md:block">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-800" />
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">Operator</span>
                                <span className="text-xs font-black truncate">Main Counter</span>
                            </div>
                        </div>
                    </div>
                </aside>
            )}

            {/* Main Operational Area */}
            <main className="flex-1 overflow-y-auto p-6 md:p-12 relative">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lime/10 blur-[150px] rounded-full -z-10 pointer-events-none" />

                <AnimatePresence mode="wait">
                    {activeTab === 'dashboard' && (
                        <motion.div
                            key="dashboard"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex flex-col gap-8"
                        >
                            <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-4">
                                <div className="flex flex-col">
                                    <h2 className="text-4xl font-black tracking-tighter uppercase mb-2">Operation Dashboard</h2>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-lime rounded-full animate-pulse" />
                                        <span className="text-xs font-black text-white/40 uppercase tracking-widest">Real-time Stock Sync Enabled</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] block mb-2">Daily Revenue</span>
                                    <span className="text-5xl font-black text-lime">Rs. {dailyRevenue.toFixed(0)}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-8 rounded-[2.5rem] flex flex-col gap-4">
                                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-lime">
                                        <Package size={24} />
                                    </div>
                                    <div>
                                        <span className="text-xs font-black text-white/40 uppercase tracking-widest block mb-1">Active SKUs</span>
                                        <span className="text-3xl font-black">{products.length}</span>
                                    </div>
                                </div>
                                <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-8 rounded-[2.5rem] flex flex-col gap-4">
                                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-blue-500">
                                        <ArrowUpRight size={24} />
                                    </div>
                                    <div>
                                        <span className="text-xs font-black text-white/40 uppercase tracking-widest block mb-1">Today's Bills</span>
                                        <span className="text-3xl font-black">{todayOrders.length}</span>
                                    </div>
                                </div>
                                <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-8 rounded-[2.5rem] flex flex-col gap-4">
                                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-orange-500">
                                        <TrendingUp size={24} />
                                    </div>
                                    <div>
                                        <span className="text-xs font-black text-white/40 uppercase tracking-widest block mb-1">Pending Orders</span>
                                        <span className="text-3xl font-black">{todayOrders.filter(o => o.status === 'pending').length}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Beautiful Animated Chart */}
                            <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-8 rounded-[2.5rem] mt-4 flex flex-col h-[300px]">
                                <div className="flex justify-between items-end mb-8">
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/50">Revenue Trend (Last 7 Days)</h3>
                                    <span className="text-[10px] bg-lime/10 text-lime px-3 py-1.5 rounded-full font-black uppercase tracking-widest">+12% Growth</span>
                                </div>
                                <div className="flex-1 flex items-end justify-between gap-2 overflow-hidden relative border-b border-white/10 pb-4">
                                    {/* Mock Chart Data Generation */}
                                    {[40, 65, 30, 80, 50, 95, 75].map((height, i) => (
                                        <div key={i} className="relative flex-1 flex justify-center group h-full items-end">
                                            {/* Bar */}
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${height}%` }}
                                                transition={{ duration: 1, delay: i * 0.1, type: 'spring', damping: 15 }}
                                                className={`w-full max-w-[40px] rounded-t-xl transition-colors relative overflow-hidden ${i === 6 ? 'bg-lime' : 'bg-white/10 group-hover:bg-white/20'}`}
                                            >
                                                {/* Sparkle effect on latest */}
                                                {i === 6 && (
                                                    <motion.div
                                                        animate={{ y: ['100%', '-100%'] }}
                                                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                                        className="absolute inset-x-0 h-10 bg-gradient-to-t from-transparent via-white/50 to-transparent"
                                                    />
                                                )}
                                            </motion.div>
                                            {/* Tooltip on hover */}
                                            <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black flex items-center justify-center border border-white/10 px-3 py-2 rounded-xl">
                                                <span className="text-xs font-black font-mono">Rs. {height * 100}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between mt-4 px-2">
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'].map((day, i) => (
                                        <span key={i} className={`text-[10px] font-black uppercase tracking-widest ${i === 6 ? 'text-lime' : 'text-white/30'}`}>{day}</span>
                                    ))}
                                </div>
                            </div>

                        </motion.div>
                    )}

                    {activeTab === 'orders' && (
                        <motion.div
                            key="orders"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex flex-col gap-8 h-full"
                        >
                            <div className="flex items-center justify-between">
                                <h1 className="text-4xl font-black tracking-tighter uppercase">Live Orders</h1>
                                <div className="flex items-center gap-2 bg-lime/10 px-4 py-2 rounded-full border border-lime/20">
                                    <div className="w-2 h-2 rounded-full bg-lime animate-pulse" />
                                    <span className="text-[10px] text-lime font-black uppercase tracking-widest">Auto-Updating</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {todayOrders.length > 0 ? todayOrders.map((order) => (
                                    <div key={order.id} className="bg-slate-900/50 border border-white/10 rounded-[2.5rem] p-6 flex flex-col relative overflow-hidden group">
                                        <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full -z-10 ${order.status === 'pending' ? 'bg-orange-500/20' : order.status === 'processing' ? 'bg-blue-500/20' : 'bg-lime/20'}`} />

                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] block mb-1">Order ID</span>
                                                <span className="text-sm font-black font-mono">#{order.id.slice(0, 8)}</span>
                                            </div>
                                            <div className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${order.status === 'pending' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                                order.status === 'processing' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                    'bg-lime/10 text-lime border-lime/20'
                                                }`}>
                                                {order.status}
                                            </div>
                                        </div>

                                        <div className="flex-1 bg-white/5 rounded-3xl p-4 mb-6">
                                            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] block mb-3">Items list</span>
                                            <div className="flex flex-col gap-3 max-h-32 overflow-y-auto hide-scrollbar">
                                                {order.items && order.items.map((item: any, idx: number) => (
                                                    <div key={idx} className="flex justify-between items-center">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-[10px] font-black">{item.quantity}x</div>
                                                            <span className="text-sm font-bold truncate max-w-[120px]">{item.name}</span>
                                                        </div>
                                                        <span className="text-xs font-black text-white/50">Rs. {item.price * item.quantity}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-end mb-6">
                                            <span className="text-xs font-black text-white/40 uppercase tracking-widest">Total</span>
                                            <span className="text-2xl font-black text-lime">Rs. {order.total_amount}</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mt-auto">
                                            {order.status === 'pending' && (
                                                <Button
                                                    onClick={() => handleUpdateOrderStatus(order.id, 'processing')}
                                                    className="col-span-2 bg-blue-500 hover:bg-blue-600 text-white font-black uppercase tracking-widest rounded-2xl h-12 text-xs border border-white/5"
                                                >
                                                    Accept & Process
                                                </Button>
                                            )}
                                            {order.status === 'processing' && (
                                                <Button
                                                    onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                                                    className="col-span-2 bg-lime hover:bg-lime/90 text-black font-black uppercase tracking-widest rounded-2xl h-12 text-xs shadow-[0_0_20px_rgba(163,230,53,0.3)]"
                                                >
                                                    Mark as Delivered ✓
                                                </Button>
                                            )}
                                            {order.status === 'delivered' && (
                                                <div className="col-span-2 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl">
                                                    <span className="text-xs font-black text-white/50 uppercase tracking-widest flex items-center gap-2"><CheckCircle2 size={16} /> Completed</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-3 flex flex-col items-center justify-center h-64 opacity-20 border-2 border-dashed border-white/10 rounded-[3rem]">
                                        <Package size={48} className="mb-4" />
                                        <p className="font-black uppercase tracking-[0.2em] text-xs">No Recent Orders Found</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'inventory' && (
                        <motion.div
                            key="inventory"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex flex-col gap-8"
                        >
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <h2 className="text-4xl font-black tracking-tighter uppercase shrink-0">Inventory Console</h2>

                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className="flex gap-2 relative flex-1 md:w-[450px]">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                                            <input
                                                type="text"
                                                placeholder="Search name..."
                                                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-sm focus:outline-none focus:border-lime/50 transition-all font-bold"
                                                value={inventorySearchQuery}
                                                onChange={(e) => setInventorySearchQuery(e.target.value)}
                                            />
                                        </div>
                                        <select
                                            className="h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-sm font-bold focus:outline-none focus:border-lime/50 transition-all cursor-pointer text-white/80"
                                            value={inventoryFilterCategory}
                                            onChange={(e) => setInventoryFilterCategory(e.target.value)}
                                        >
                                            <option value="All" className="bg-slate-900">All Categories</option>
                                            <option value="Vegetables" className="bg-slate-900">Vegetables</option>
                                            <option value="Fruits" className="bg-slate-900">Fruits</option>
                                            <option value="Dairy" className="bg-slate-900">Dairy</option>
                                            <option value="Meat" className="bg-slate-900">Meat</option>
                                            <option value="Bakery" className="bg-slate-900">Bakery</option>
                                        </select>
                                    </div>
                                    <Button
                                        onClick={() => setIsAddModalOpen(true)}
                                        className="h-14 bg-white text-black px-8 rounded-2xl font-black uppercase tracking-widest flex items-center gap-2"
                                    >
                                        <Plus size={18} strokeWidth={3} />
                                        <span className="hidden md:inline">Add Item</span>
                                    </Button>
                                </div>
                            </div>

                            <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-[2.5rem] overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white/5">
                                            <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Product Details</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Category</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Price</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Stock Status</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {products
                                            .filter(p => p.name.toLowerCase().includes(inventorySearchQuery.toLowerCase()) && (inventoryFilterCategory === 'All' || p.category === inventoryFilterCategory))
                                            .length > 0 ? products
                                                .filter(p => p.name.toLowerCase().includes(inventorySearchQuery.toLowerCase()) && (inventoryFilterCategory === 'All' || p.category === inventoryFilterCategory))
                                                .map((product) => (
                                                    <tr key={product.id} className="hover:bg-white/[0.02] transition-colors group">
                                                        <td className="px-8 py-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center overflow-hidden">
                                                                    {product.image_url ? (
                                                                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <Package className="text-white/20" size={20} />
                                                                    )}
                                                                </div>
                                                                <span className="font-black text-sm uppercase tracking-tight">{product.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <span className="text-[10px] bg-white/10 px-3 py-1.5 rounded-full font-black uppercase tracking-widest">
                                                                {product.category}
                                                            </span>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <span className="font-black text-sm">Rs. {product.price}</span>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-2 h-2 rounded-full ${product.stock_quantity > 10 ? 'bg-lime' : 'bg-red-500'}`} />
                                                                <span className="text-xs font-black">{product.stock_quantity} Units</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6 text-right">
                                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button className="p-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors">
                                                                    <Edit3 size={16} />
                                                                </button>
                                                                <button className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors">
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )) : (
                                            <tr>
                                                <td colSpan={5} className="px-8 py-20 text-center">
                                                    <div className="flex flex-col items-center opacity-20">
                                                        <Box size={48} className="mb-4" />
                                                        <p className="font-black uppercase tracking-[0.2em] text-xs">No products in current inventory</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'billing' && (
                        <motion.div
                            key="billing"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex flex-col gap-8 h-full"
                        >
                            <div className="flex items-center justify-between">
                                <h1 className="text-4xl font-black tracking-tighter uppercase">Fast Billing Terminal</h1>
                                <span className="text-xs font-black text-lime animate-pulse uppercase tracking-[0.2em]">Operation Active</span>
                            </div>

                            <div className="flex-1 flex gap-8">
                                {/* Left Side: Cart/Bill */}
                                <div className="flex-[1.5] flex flex-col gap-6">
                                    <div className="bg-slate-900/50 border border-white/10 rounded-[2.5rem] p-8 flex-1 overflow-y-auto">
                                        <div className="flex justify-between items-center mb-8">
                                            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Customer Cart</span>
                                            <button
                                                onClick={() => setCart([])}
                                                className="text-[9px] font-black text-red-500 uppercase tracking-widest hover:underline"
                                            >
                                                Clear List
                                            </button>
                                        </div>

                                        {cart.length > 0 ? (
                                            <div className="flex flex-col gap-4">
                                                {cart.map((item) => (
                                                    <div key={item.product.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-lime font-black">
                                                                {item.product.name[0]}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-sm uppercase">{item.product.name}</span>
                                                                <span className="text-[10px] text-white/40 font-black">Rs. {item.product.price} / unit</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-6">
                                                            <div className="flex items-center gap-3 bg-black/40 p-1.5 rounded-xl border border-white/5">
                                                                <button
                                                                    onClick={() => updateQuantity(item.product.id, -1)}
                                                                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/10"
                                                                >
                                                                    <X size={14} className="rotate-45" />
                                                                </button>
                                                                <span className="font-black w-4 text-center">{item.quantity}</span>
                                                                <button
                                                                    onClick={() => updateQuantity(item.product.id, 1)}
                                                                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-lime text-black"
                                                                >
                                                                    <Plus size={14} strokeWidth={4} />
                                                                </button>
                                                            </div>
                                                            <span className="font-black text-lime min-w-[80px] text-right">Rs. {item.product.price * item.quantity}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-64 opacity-20 border-2 border-dashed border-white/10 rounded-[2rem]">
                                                <ShoppingCart size={40} className="mb-4" />
                                                <p className="font-black uppercase tracking-widest text-[10px]">Ready to process items</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Side: Search & Total */}
                                <div className="flex-1 flex flex-col gap-6">
                                    <div className="bg-slate-900/50 border border-white/10 rounded-[2.5rem] p-8">
                                        <div className="relative mb-6">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                                            <input
                                                type="text"
                                                placeholder="Quick Search (Item / Code)..."
                                                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-lime/50 transition-all"
                                                value={billingSearchQuery}
                                                onChange={(e) => setBillingSearchQuery(e.target.value)}
                                            />

                                            {/* Search Results Dropdown */}
                                            {billingSearchQuery && (
                                                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl max-h-60 overflow-y-auto">
                                                    {products.filter(p => p.name.toLowerCase().includes(billingSearchQuery.toLowerCase())).map(product => (
                                                        <button
                                                            key={product.id}
                                                            onClick={() => addToCart(product)}
                                                            className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                                                        >
                                                            <div className="flex flex-col items-start">
                                                                <span className="font-bold text-xs uppercase">{product.name}</span>
                                                                <span className="text-[10px] text-white/40 font-black">Stock: {product.stock_quantity}</span>
                                                            </div>
                                                            <span className="font-black text-lime">Rs. {product.price}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-black text-white/40 uppercase tracking-widest">Subtotal</span>
                                                <span className="font-black">Rs. {subtotal}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-black text-white/40 uppercase tracking-widest">Discounts</span>
                                                <span className="text-lime font-black">- Rs. 0</span>
                                            </div>
                                            <div className="h-px bg-white/5 my-2" />
                                            <div className="flex justify-between items-end">
                                                <span className="text-lg font-black uppercase tracking-widest">Grand Total</span>
                                                <span className="text-4xl font-black text-lime tracking-tighter">Rs. {grandTotal}</span>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={handleCheckout}
                                            disabled={cart.length === 0 || isProcessingBill}
                                            className="w-full h-20 bg-lime text-black rounded-3xl mt-8 font-black uppercase tracking-[0.2em] shadow-glow-lime text-lg disabled:opacity-50 disabled:shadow-none"
                                        >
                                            {isProcessingBill ? 'Finalizing...' : 'Finish & Bill'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* High-End Add Product Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAddModalOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-[2.5rem] p-10 relative z-10 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-lime/20 rounded-xl flex items-center justify-center text-lime">
                                        <Plus size={20} strokeWidth={3} />
                                    </div>
                                    <h3 className="text-xl font-black uppercase tracking-tight">New Inventory Unit</h3>
                                </div>
                                <button onClick={() => setIsAddModalOpen(false)} className="text-white/20 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-2">Product Identification</label>
                                    <input
                                        type="text"
                                        placeholder="Product Name (e.g. Red Onions)"
                                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 font-bold focus:outline-none focus:border-lime/50 transition-all"
                                        value={newProduct.name}
                                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-2">Unit Price (Rs)</label>
                                        <input
                                            type="number"
                                            placeholder="150"
                                            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 font-bold focus:outline-none"
                                            value={newProduct.price}
                                            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-2">Initial Stock</label>
                                        <input
                                            type="number"
                                            placeholder="50"
                                            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 font-bold focus:outline-none"
                                            value={newProduct.stock}
                                            onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-2">Classification</label>
                                    <select
                                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 font-bold focus:outline-none appearance-none cursor-pointer"
                                        value={newProduct.category}
                                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                    >
                                        <option value="Vegetables" className="bg-slate-900">Vegetables</option>
                                        <option value="Fruits" className="bg-slate-900">Fruits</option>
                                        <option value="Dairy" className="bg-slate-900">Dairy</option>
                                        <option value="Meat" className="bg-slate-900">Meat</option>
                                        <option value="Bakery" className="bg-slate-900">Bakery</option>
                                    </select>
                                </div>

                                <Button
                                    onClick={handleAddProduct}
                                    disabled={isAddingProduct || !newProduct.name || !newProduct.price}
                                    className="w-full h-16 bg-lime text-black rounded-3xl font-black uppercase tracking-[0.2em] shadow-glow-lime mt-4 text-sm"
                                >
                                    {isAddingProduct ? 'Syncing...' : 'Deploy To Website'}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
