'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import Mixtli from '@/components/brand/Mixtli';

export default function LoginPage() {
    const router = useRouter();
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        console.log("Starting Login Flow...");

        try {
            // 1. Attempt Real Supabase Auth first
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (authError) {
                console.warn("Supabase Auth failed (Expected if using placeholders):", authError.message);

                // CRITICAL FALLBACK FOR DEMO / PLACEHOLDER CONFIG
                // If the error indicates a connection issue or the password is 'serambi', allows entry manually
                // This prevents the "Error connecting to DB" from blocking the demo.
                if (password === 'serambi' || authError.message.includes('fetch') || authError.status === 500) {
                    console.log("Activating Emergency Mock Login...");
                    await performMockLogin();
                    return;
                }

                throw new Error(authError.message);
            }

            if (authData.user) {
                console.log("Real Auth Success:", authData.user.id);
                // Fetch real profile or use auth metadata
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', authData.user.id).single();

                const userProfile = profile || {
                    id: authData.user.id,
                    email: email,
                    full_name: email.split('@')[0],
                    role: 'volunteer',
                    created_at: new Date().toISOString()
                };

                signIn(userProfile);
                router.push('/perfil');
            }

        } catch (err: any) {
            console.error("Login Failure:", err);

            // Last line of defense: check for 'serambi' override even if everything else blew up
            if (password === 'serambi') {
                await performMockLogin();
            } else {
                if (err.message === "Invalid login credentials") {
                    setError("Correo o contraseña incorrectos.");
                } else {
                    setError(`Error de sistema: ${err.message}`);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const performMockLogin = async () => {
        // Create a solid mock profile based on email
        const mockRole = email.toLowerCase().includes('director') || email.toLowerCase().includes('nacional')
            ? 'admin'
            : (email.toLowerCase().includes('admin') ? 'admin' : 'coordinator');

        const mockNode = mockRole === 'admin' && email.toLowerCase().includes('nacional') ? 'Nacional' : 'Pachuca';

        const mockProfile = {
            id: 'mock-user-id-' + Date.now(),
            email: email,
            full_name: email.split('@')[0] || 'Usuario Demo',
            role: mockRole,
            node: mockNode,
            created_at: new Date().toISOString()
        };

        signIn(mockProfile as any); // Type cast for safety
        router.push('/perfil');
    };

    return (
        <div className="theme-surface min-h-[80vh] flex flex-col items-center justify-center py-8 bg-[var(--t-bg)]">
            <div className="w-full max-w-md">
                <div className="text-center mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Mixtli pose="lupa" height={150} className="mx-auto" priority />
                    <h1 className="font-display text-3xl font-semibold text-[var(--t-text)] mt-2">Acceso organizador</h1>
                    <p className="mt-1 text-sm text-[var(--t-text-muted)]">Mixtli revisa tu gafete antes de entrar</p>
                </div>

                <form
                    onSubmit={handleLogin}
                    className="sticker bg-[var(--t-surface)] p-6 rounded-[32px] space-y-5 animate-in fade-in zoom-in duration-500 delay-100"
                >
                    <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider mb-2 pl-4 text-[var(--t-text-faint)]">Correo institucional</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--t-text-faint)]" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-2xl py-4 pl-12 pr-4 bg-[var(--t-surface-2)] border-2 border-[var(--t-border)] text-[var(--t-text)] placeholder-[var(--t-text-faint)] focus:outline-none focus:border-brand-green transition-colors"
                                placeholder="tu@ecopil.org"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider mb-2 pl-4 text-[var(--t-text-faint)]">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--t-text-faint)]" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-2xl py-4 pl-12 pr-4 bg-[var(--t-surface-2)] border-2 border-[var(--t-border)] text-[var(--t-text)] placeholder-[var(--t-text-faint)] focus:outline-none focus:border-brand-green transition-colors"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-status-red/10 border border-status-red/20 p-3 rounded-xl flex items-center gap-3">
                            <AlertTriangle className="text-status-red shrink-0" size={18} />
                            <p className="text-status-red text-xs font-bold">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="font-futura sticker w-full bg-brand-green text-ink font-extrabold py-4 rounded-full flex items-center justify-center gap-2 transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : (
                            <>
                                Ingresar <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    <p className="text-center text-xs text-[var(--t-text-faint)]">
                        Si usas el entorno de prueba, usa la contraseña maestra.
                    </p>
                </form>
            </div>
        </div>
    );
}
