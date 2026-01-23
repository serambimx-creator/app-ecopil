'use client';

import { Play, Pause, FileText, ExternalLink } from 'lucide-react';
import { useState, useRef } from 'react';
import type { Evidence } from '@/types/database';

interface MediaGridProps {
    items: Evidence[];
}

export default function MediaGrid({ items }: MediaGridProps) {
    if (items.length === 0) {
        return <div className="text-center py-8 text-white/20 text-sm">No hay evidencias aún.</div>;
    }

    return (
        <div className="grid grid-cols-3 gap-1">
            {items.map((item) => (
                <MediaItem key={item.id} item={item} />
            ))}
        </div>
    );
}

function MediaItem({ item }: { item: Evidence }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const toggleAudio = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    if (item.file_type === 'image') {
        return (
            <div className="aspect-square bg-white/5 relative group overflow-hidden cursor-pointer">
                <img
                    src={item.file_url}
                    alt={item.description || 'Evidence'}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            </div>
        );
    }

    if (item.file_type === 'video') {
        return (
            <div className="aspect-square bg-gray-900 relative group cursor-pointer overflow-hidden">
                <video src={item.file_url} className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Play size={14} fill="white" className="ml-0.5 text-white" />
                    </div>
                </div>
            </div>
        );
    }

    if (item.file_type === 'audio') {
        return (
            <div className="aspect-square bg-gradient-to-br from-purple-900/50 to-blue-900/50 flex flex-col items-center justify-center p-2 relative group">
                <audio
                    ref={audioRef}
                    src={item.file_url}
                    onEnded={() => setIsPlaying(false)}
                    className="hidden"
                />
                <button
                    onClick={toggleAudio}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all scale-100 active:scale-95"
                >
                    {isPlaying ? <Pause size={18} fill="white" className="text-white" /> : <Play size={18} fill="white" className="ml-1 text-white" />}
                </button>
                <span className="text-[10px] text-white/50 mt-2 truncate w-full text-center">
                    {item.description || 'Audio clip'}
                </span>
                {isPlaying && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-green/50 animate-pulse" />
                )}
            </div>
        );
    }

    // Documents
    return (
        <div className="aspect-square bg-white/5 flex flex-col items-center justify-center p-2 text-white/50 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => window.open(item.file_url, '_blank')}>
            <FileText size={24} />
            <span className="text-[10px] mt-2 truncate w-full text-center">{item.description || 'Documento'}</span>
            <ExternalLink size={10} className="absolute top-2 right-2 opacity-50" />
        </div>
    );
}
