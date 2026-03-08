import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends HTMLMotionProps<'button'> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
        return (
            <motion.button
                ref={ref}
                whileTap={{ scale: 0.96 }}
                className={cn(
                    'inline-flex items-center justify-center font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none',
                    {
                        'bg-lime text-black hover:bg-lime-600 shadow-glow': variant === 'primary',
                        'bg-white text-black shadow-soft hover:shadow-float': variant === 'secondary',
                        'border-2 border-lime text-black hover:bg-lime/10': variant === 'outline',
                        'bg-transparent hover:bg-black/5 text-black': variant === 'ghost',
                        'h-9 px-4 rounded-full text-sm': size === 'sm',
                        'h-12 px-6 rounded-full text-base': size === 'md',
                        'h-14 px-8 rounded-full text-lg w-full': size === 'lg',
                        'h-12 w-12 rounded-full p-0': size === 'icon',
                    },
                    className
                )}
                {...props}
            />
        );
    }
);
Button.displayName = 'Button';
