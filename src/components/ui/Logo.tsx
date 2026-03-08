"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

interface LogoProps {
    className?: string;
    iconSize?: number;
    textSize?: string;
    showIcon?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
    className = "",
    iconSize = 24,
    textSize = "text-2xl",
    showIcon = true
}) => {
    return (
        <div className={`flex items-center gap-2.5 ${className}`}>
            {showIcon && (
                <div className="relative">
                    <div className="w-10 h-10 bg-lime rounded-xl flex items-center justify-center shadow-[0_8px_16px_-4px_rgba(163,230,53,0.4)] relative z-10">
                        <ShoppingBag size={iconSize} className="text-black stroke-[2.5px]" />
                    </div>
                    {/* Decorative Background Element */}
                    <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-black/5 rounded-xl -z-0" />
                </div>
            )}

            <div className={`${textSize} font-black tracking-tighter flex items-baseline`}>
                <span className="text-black">webshopping</span>
                <span className="text-lime-600">.lk</span>
            </div>
        </div>
    );
};
