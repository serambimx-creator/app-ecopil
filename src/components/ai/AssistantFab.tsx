'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, RotateCcw } from 'lucide-react';
import { sendMessageToGemini, rollbackLastAction } from '@/lib/chatbot';
import { useAuth } from '@/context/AuthContext';
import { clsx } from 'clsx';

interface Message {
    id: string;
    role: 'user' | 'bot';
    text: string;
    actionPerformed?: boolean;
}

export default function AssistantFab() {
    const { userId } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: 'welcome', role: 'bot', text: '¡Hola! Soy tu asistente Ecopil. Pregúntame sobre proyectos, finanzas o actividades.' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: inputValue
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await sendMessageToGemini(userMsg.text, userId);

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'bot',
                text: response.text,
                actionPerformed: response.actionPerformed
            };

            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { id: 'err', role: 'bot', text: 'Error de conexión.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRollback = async () => {
        setIsLoading(true);
        try {
            const resultText = await rollbackLastAction();
            // Add system message
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'bot',
                text: `Revertir cambios: ${resultText}`
            }]);
        } catch (error) {
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'bot', text: 'Error al deshacer.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!isMounted) return null;

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "fixed bottom-24 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95",
                    isOpen ? "bg-status-red text-white rotate-90" : "bg-brand-green text-dark-surface"
                )}
                aria-label="Abrir Asistente"
            >
                {isOpen ? <X size={28} /> : <Sparkles size={28} />}
            </button>

            <div
                className={clsx(
                    "fixed bottom-24 right-6 z-40 w-[90vw] md:w-[400px] h-[500px] bg-dark-surface/95 backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right",
                    isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-90 translate-y-10 pointer-events-none"
                )}
            >
                <div className="p-4 border-b border-white/10 bg-white/5 flex items-center gap-3">
                    <div className="p-2 bg-brand-green/20 rounded-full">
                        <Bot size={20} className="text-brand-green" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">Asistente Ecopil</h3>
                        <p className="text-xs text-gray-400">Impulsado por Gemini AI</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {messages.map((msg) => (
                        <div key={msg.id} className="flex flex-col w-full">
                            <div
                                className={clsx(
                                    "flex w-full",
                                    msg.role === 'user' ? "justify-end" : "justify-start"
                                )}
                            >
                                <div
                                    className={clsx(
                                        "max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed",
                                        msg.role === 'user'
                                            ? "bg-brand-green text-dark-surface rounded-br-none font-medium"
                                            : "bg-white/10 text-gray-200 rounded-bl-none border border-white/5"
                                    )}
                                >
                                    {msg.text}
                                </div>
                            </div>
                            {msg.actionPerformed && msg.role === 'bot' && (
                                <div className="flex justify-start mt-2">
                                    <button
                                        onClick={handleRollback}
                                        className="text-xs flex items-center gap-1 text-gray-400 hover:text-status-red transition-colors ml-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10"
                                    >
                                        <RotateCcw size={12} />
                                        Deshacer acción
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white/10 text-gray-200 p-3 rounded-2xl rounded-bl-none flex items-center gap-2">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-3 border-t border-white/10 bg-white/5 flex gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Escribe tu pregunta..."
                        className="flex-1 bg-black/20 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-green/50 text-sm"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!inputValue.trim() || isLoading}
                        className="p-3 bg-brand-green text-dark-surface rounded-xl hover:bg-brand-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </>
    );
}
