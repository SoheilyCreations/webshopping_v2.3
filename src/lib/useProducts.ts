"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Product as MockProduct } from '@/lib/mockData';

export function useProducts() {
    const [products, setProducts] = useState<MockProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('name', { ascending: true });

            if (data) {
                const transformed = data.map(transformProduct);
                setProducts(transformed);
            }
            setLoading(false);
        };

        fetchProducts();

        // Real-time subscription
        const channel = supabase
            .channel('public:products')
            .on('postgres_changes', { event: '*', table: 'products', schema: 'public' }, (payload) => {
                console.log('Real-time update received:', payload);
                if (payload.eventType === 'INSERT') {
                    setProducts(prev => [...prev, transformProduct(payload.new)]);
                } else if (payload.eventType === 'UPDATE') {
                    setProducts(prev => prev.map(p => p.id === payload.new.id ? transformProduct(payload.new) : p));
                } else if (payload.eventType === 'DELETE') {
                    setProducts(prev => prev.filter(p => p.id === payload.old.id));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    function transformProduct(dbProduct: any): MockProduct {
        return {
            id: dbProduct.id,
            shopId: dbProduct.shop_id,
            name: dbProduct.name,
            price: dbProduct.price,
            image: dbProduct.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600',
            categoryId: dbProduct.category?.toLowerCase() || 'all',
            weight: dbProduct.weight_options ? (typeof dbProduct.weight_options === 'string' ? JSON.parse(dbProduct.weight_options)[0]?.label : dbProduct.weight_options[0]?.label) : 'Unit',
            prepTime: '2 hrs',
            rating: 4.8,
            sold: 100,
            variants: [dbProduct.image_url],
            soldOut: dbProduct.stock_quantity <= 0,
            originalPrice: dbProduct.price + 50, // Mock discount
            discount: '10% OFF'
        };
    }

    return { products, loading };
}
