'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Trophy, Shuffle, User, Filter, PartyPopper } from 'lucide-react';
import confetti from 'canvas-confetti';
import { clsx } from 'clsx';

// Mock Profiles until real users seeded
const MOCK_PARTICIPANTS = [
    { id: '1', full_name: 'Luis Gerardo', node: 'Hidalgo', avatar: null },
    { id: '2', full_name: 'Ana María', node: 'CDMX', avatar: null },
    { id: '3', full_name: 'Carlos Ruiz', node: 'Puebla', avatar: null },
    { id: '4', full_name: 'Fernanda L.', node: 'Hidalgo', avatar: null },
    { id: '5', full_name: 'Jorge Dev', node: 'Veracruz', avatar: null },
    { id: '6', full_name: 'Mariana T.', node: 'Morelos', avatar: null },
    { id: '7', full_name: 'Roberto V.', node: 'Hidalgo', avatar: null },
    { id: '8', full_name: 'Sofia G.', node: 'Querétaro', avatar: null },
];

export default function SorteoPage() {
    const [participants, setParticipants] = useState<any[]>([]);
    const [filteredParticipants, setFilteredParticipants] = useState<any[]>([]);
    const [selectedNode, setSelectedNode] = useState<string>('all');

    // Animation State
    const [isSpinning, setIsSpinning] = useState(false);
    const [currentName, setCurrentName] = useState('???');
    const [winner, setWinner] = useState<any>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Fetch Profiles
        async function fetchProfiles() {
            const { data } = await supabase.from('profiles').select('*');
            if (data && data.length > 0) {
                setParticipants(data);
                setFilteredParticipants(data);
            } else {
                // Fallback to mock if DB empty
                setParticipants(MOCK_PARTICIPANTS);
                setFilteredParticipants(MOCK_PARTICIPANTS);
            }
        }
        fetchProfiles();
    }, []);

    useEffect(() => {
        if (selectedNode === 'all') {
            setFilteredParticipants(participants);
        } else {
            setFilteredParticipants(participants.filter(p => p.node === selectedNode));
        }
    }, [selectedNode, participants]);

    const handleSpin = () => {
        if (filteredParticipants.length < 2) {
            alert("No hay suficientes participantes para sortear.");
            return;
        }

        setIsSpinning(true);
        setWinner(null);

        let counter = 0;
        const speed = 50; // ms

        intervalRef.current = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * filteredParticipants.length);
            setCurrentName(filteredParticipants[randomIndex].full_name);
            counter++;

            // Artificial stop logic
            if (counter > 40) { // Approx 2 seconds
                clearInterval(intervalRef.current!);
                const finalIndex = Math.floor(Math.random() * filteredParticipants.length);
                finishSpin(filteredParticipants[finalIndex]);
            }
        }, speed);
    };

    const finishSpin = (winr: any) => {
        setIsSpinning(false);
        setWinner(winr);
        setCurrentName(winr.full_name);

        // Confetti Explosion
        const duration = 3000;
        const end = Date.now() + duration;

        (function frame() {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#00DF81', '#FFD233', '#FF4B4B']
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#00DF81', '#FFD233', '#FF4B4B']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">

            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-green/10 via-black to-black animate-pulse" />

            {/* Header Controls */}
            <div className="absolute top-4 left-0 right-0 flex justify-between items-center px-6 z-10 w-full max-w-4xl mx-auto">
                <div className="flex items-center gap-2 text-brand-green font-bold text-xl uppercase tracking-widest">
                    <Trophy /> Sorteo Ecopil
                </div>

                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 border border-white/10">
                    <Filter size={14} className="text-gray-400" />
                    <select
                        value={selectedNode}
                        onChange={(e) => setSelectedNode(e.target.value)}
                        className="bg-transparent text-white text-sm focus:outline-none appearance-none font-bold uppercase"
                    >
                        <option value="all" className="bg-black">Todos los Nodos</option>
                        <option value="Hidalgo" className="bg-black">Hidalgo</option>
                        <option value="CDMX" className="bg-black">CDMX</option>
                        <option value="Puebla" className="bg-black">Puebla</option>
                    </select>
                </div>
            </div>

            {/* Main Stage */}
            <div className="relative z-20 w-full max-w-2xl text-center space-y-12">

                {/* Name Display */}
                <div className={clsx(
                    "relative bg-dark-surface border rounded-3xl p-12 transition-all duration-300 flex items-center justify-center min-h-[300px]",
                    isSpinning
                        ? "border-brand-green shadow-[0_0_50px_rgba(0,223,129,0.3)] scale-105"
                        : winner
                            ? "border-brand-green bg-brand-green/10 shadow-[0_0_100px_rgba(0,223,129,0.6)] scale-110"
                            : "border-white/10 shadow-2xl"
                )}>
                    {winner && (
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-brand-green animate-bounce">
                            <Trophy size={64} fill="currentColor" />
                        </div>
                    )}

                    <div>
                        {winner && <div className="text-brand-green font-bold uppercase tracking-[0.5em] mb-4 animate-in fade-in slide-in-from-bottom-2">¡Ganador!</div>}
                        <h1 className={clsx(
                            "font-black text-white leading-none transition-all",
                            isSpinning ? "text-6xl opacity-80 blur-[2px]" : "text-7xl md:text-8xl",
                            winner && "text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-blue-400"
                        )}>
                            {currentName}
                        </h1>
                        {winner && (
                            <div className="mt-6 flex items-center justify-center gap-2 text-gray-400 animate-in fade-in delay-300">
                                <User size={20} />
                                {winner.node || 'Participante'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Trigger Button */}
                <button
                    onClick={handleSpin}
                    disabled={isSpinning}
                    className={clsx(
                        "group relative px-12 py-6 rounded-full font-black text-xl uppercase tracking-widest transition-all",
                        isSpinning
                            ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                            : "bg-white text-black hover:scale-105 hover:bg-brand-green hover:shadow-[0_0_40px_rgba(0,223,129,0.5)] active:scale-95"
                    )}
                >
                    <span className="flex items-center gap-3">
                        {isSpinning ? "Girando..." : "Girar Tómbola"}
                        {!isSpinning && <Shuffle className="group-hover:rotate-180 transition-transform duration-500" />}
                    </span>
                </button>

                <p className="text-gray-500 text-sm">
                    Participantes habilitados: <strong className="text-white">{filteredParticipants.length}</strong>
                </p>
            </div>

        </div>
    );
}
