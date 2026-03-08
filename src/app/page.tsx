"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';

export default function SplashScreen() {
  const router = useRouter();

  return (
    <main className="relative flex-1 w-full overflow-hidden bg-light">
      {/* Background Image (High quality) */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=2574&ixlib=rb-4.0.3"
          alt="Fresh Groceries"
          className="w-full h-full object-cover"
        />
        {/* Soft overlay to ensure readability */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Floating Bubbles */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <motion.div
          animate={{ y: [0, -15, 0], x: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="absolute top-[15%] right-[10%] glass text-black font-semibold px-5 py-3 rounded-full shadow-float text-sm"
        >
          Delivery in 30 mins 🚀
        </motion.div>

        <motion.div
          animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
          className="absolute top-[35%] left-[5%] glass text-black font-semibold px-5 py-3 rounded-full shadow-float text-sm"
        >
          Fresh & Organic 🥬
        </motion.div>

        <motion.div
          animate={{ y: [0, -10, 0], x: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 2 }}
          className="absolute top-[50%] right-[15%] glass text-black font-semibold px-5 py-3 rounded-full shadow-float text-sm"
        >
          Best Prices 🏷️
        </motion.div>
      </div>

      {/* Bottom Sheet via Framer Motion */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200, delay: 0.5 }}
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-5xl pt-10 pb-12 px-8 shadow-[0_-20px_40px_-5px_rgba(0,0,0,0.1)] z-20 flex flex-col items-center text-center"
      >
        <div className="w-16 h-1.5 bg-gray-200 rounded-full mb-8 absolute top-4 left-1/2 -translate-x-1/2" />

        <div className="mb-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Logo iconSize={24} textSize="text-2xl" />
          </motion.div>
        </div>

        <h1 className="text-4xl font-extrabold text-black leading-[1.1] mb-4 tracking-tight">
          Eat Your Way.<br />
          <span className="text-lime-600">Anytime.</span>
        </h1>

        <p className="text-gray-500 mb-10 text-base font-medium max-w-[280px]">
          Discover fresh groceries delivered to your doorstep in minutes with <b>webshopping.lk</b>
        </p>

        <Button
          size="lg"
          onClick={() => router.push('/home')}
          className="w-full flex justify-between items-center group py-4 h-16 text-lg"
        >
          <span className="font-bold ml-4">Start Shopping</span>
          <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center mr-[-10px] shadow-sm transform group-hover:scale-105 transition-transform text-black">
            <ArrowRight size={20} className="stroke-[3px]" />
          </div>
        </Button>
      </motion.div>
    </main>
  );
}
