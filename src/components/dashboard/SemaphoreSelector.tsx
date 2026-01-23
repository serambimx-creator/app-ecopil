'use client';

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Status } from '@/types/database';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SemaphoreSelectorProps {
    currentStatus: Status;
    onStatusChange: (status: Status) => void;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export default function SemaphoreSelector({ currentStatus, onStatusChange, className, size = 'md' }: SemaphoreSelectorProps) {

    const sizeClasses = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-6 h-6'
    };

    const containerGap = {
        sm: 'gap-1.5',
        md: 'gap-2',
        lg: 'gap-3'
    };

    return (
        <div className={cn("flex items-center bg-black/40 rounded-full px-2 py-1.5 border border-white/10 backdrop-blur-sm", containerGap[size], className)}>
            {/* Red */}
            <button
                onClick={(e) => { e.stopPropagation(); onStatusChange('red'); }}
                className={cn(
                    "rounded-full transition-all duration-300 relative",
                    sizeClasses[size],
                    currentStatus === 'red' ? "bg-status-red shadow-[0_0_10px_rgba(255,75,75,0.6)] scale-110" : "bg-status-red/20 hover:bg-status-red/50"
                )}
                aria-label="Set status to Red"
            />

            {/* Yellow */}
            <button
                onClick={(e) => { e.stopPropagation(); onStatusChange('yellow'); }}
                className={cn(
                    "rounded-full transition-all duration-300 relative",
                    sizeClasses[size],
                    currentStatus === 'yellow' ? "bg-status-yellow shadow-[0_0_10px_rgba(255,210,51,0.6)] scale-110" : "bg-status-yellow/20 hover:bg-status-yellow/50"
                )}
                aria-label="Set status to Yellow"
            />

            {/* Green */}
            <button
                onClick={(e) => { e.stopPropagation(); onStatusChange('green'); }}
                className={cn(
                    "rounded-full transition-all duration-300 relative",
                    sizeClasses[size],
                    currentStatus === 'green' ? "bg-brand-green shadow-[0_0_10px_rgba(0,223,129,0.6)] scale-110" : "bg-brand-green/20 hover:bg-brand-green/50"
                )}
                aria-label="Set status to Green"
            />
        </div>
    );
}
