'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

// Mock list of Allies (In real app, could fetch from DB)
const ALLIES = [
    { name: 'Semarnat', logo: 'https://via.placeholder.com/150x80?text=SEMARNAT' },
    { name: 'Conafor', logo: 'https://via.placeholder.com/150x80?text=CONAFOR' },
    { name: 'Alpura', logo: 'https://via.placeholder.com/150x80?text=ALPURA' },
    { name: 'Aeromexico', logo: 'https://via.placeholder.com/150x80?text=AEROMEXICO' },
    { name: 'Gobierno Hidalgo', logo: 'https://via.placeholder.com/150x80?text=GOB+HIDALGO' },
    { name: 'Conanp', logo: 'https://via.placeholder.com/150x80?text=CONANP' },
    { name: 'Ecopil', logo: 'https://via.placeholder.com/150x80?text=ECOPIL' }, // Self
];

export default function AlliesCarousel() {
    return (
        <section className="py-12 bg-black border-t border-white/5 relative overflow-hidden">
            <div className="text-center mb-8">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">Nuestros Aliados & Partners</p>
            </div>

            {/* Infinite Scroll Container */}
            <div className="flex gap-12 animate-scroll-infinite min-w-max px-4">
                {/* Duplicate logic for infinite effect */}
                {[...ALLIES, ...ALLIES, ...ALLIES].map((ally, i) => (
                    <div key={i} className="flex items-center grayscale hover:grayscale-0 transition-all opacity-50 hover:opacity-100 duration-300 cursor-pointer">
                        {/* Placeholder Styling matching Glass look */}
                        <div className="h-16 w-32 bg-white/5 rounded-lg border border-white/5 flex items-center justify-center font-bold text-[10px] text-gray-400">
                            {/* In real app: <img src={ally.logo} /> */}
                            {ally.name}
                        </div>
                    </div>
                ))}
            </div>

            {/* Fade Edges */}
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black to-transparent pointer-events-none" />
        </section>
    );
}

// Add this to globals.css for animation
// @keyframes scroll-infinite {
//     0% { transform: translateX(0); }
//     100% { transform: translateX(-50%); }
// }
// .animate-scroll-infinite {
//     animation: scroll-infinite 20s linear infinite;
// }
