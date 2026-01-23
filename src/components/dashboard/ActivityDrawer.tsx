'use client'; // Rebuild trigger


import { useState, useEffect, useRef } from 'react';
import { Drawer } from 'vaul';
import { X, Calendar, MapPin, DollarSign, Users, FileText, Plus, Check, Lock, Image as ImageIcon, Loader2, Trash } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from '@/lib/supabase';
import type { AgendaActivity, Profile, Finance, PersonalTask, Status, Evidence, EvidenceType } from '@/types/database';
import SemaphoreSelector from './SemaphoreSelector';
import MediaGrid from './MediaGrid';
import { uploadToGoogleDrive } from '@/lib/googleDrive';
import dynamic from 'next/dynamic';
import SubBlocksEditor from './SubBlocksEditor';

// Dynamic import for Map Component (Client-side only)
const LocationPicker = dynamic(() => import('../maps/LocationPicker'), {
    ssr: false,
    loading: () => <div className="w-full h-[250px] bg-white/5 rounded-2xl flex items-center justify-center animate-pulse text-white/20">Cargando mapa...</div>
});

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ActivityDrawerProps {
    trigger?: React.ReactNode;
    activityId?: string; // If null, creating new
    onClose?: () => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export default function ActivityDrawer({ trigger, activityId, onClose, open, onOpenChange }: ActivityDrawerProps) {
    const [internalOpen, setInternalOpen] = useState(false);

    // Controlled vs Uncontrolled logic
    const isControlled = open !== undefined;
    const isOpen = isControlled ? open : internalOpen;
    const setIsOpen = isControlled ? onOpenChange : setInternalOpen;

    if (!setIsOpen) throw new Error("ActivityDrawer: onOpenChange required if controlled");

    const [activeTab, setActiveTab] = useState<'general' | 'personal' | 'evidence'>('general');
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form State
    const [title, setTitle] = useState('');
    const [status, setStatus] = useState<Status>('yellow');
    const [date, setDate] = useState('');
    const [location, setLocation] = useState('');
    const [latitude, setLatitude] = useState<number | undefined>(undefined);
    const [longitude, setLongitude] = useState<number | undefined>(undefined);
    const [logistics, setLogistics] = useState('');
    const [agreements, setAgreements] = useState('');
    const [reportDetails, setReportDetails] = useState('');
    const [assignedUserIds, setAssignedUserIds] = useState<Set<string>>(new Set());

    // Personal Tasks State
    const [personalTasks, setPersonalTasks] = useState<PersonalTask[]>([]);
    const [newPersonalTask, setNewPersonalTask] = useState('');

    // Evidence State
    const [evidence, setEvidence] = useState<Evidence[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    // Finances State (Local for UI, usually would fetch/save separate table)
    const [expenses, setExpenses] = useState<Partial<Finance>[]>([]);
    const [newExpenseConcept, setNewExpenseConcept] = useState('');
    const [newExpenseAmount, setNewExpenseAmount] = useState('');

    // Fetch initial data if activityId present
    useEffect(() => {
        async function loadData() {
            // Fetch Profiles
            const { data: profilesData } = await supabase.from('profiles').select('*');
            if (profilesData) setProfiles(profilesData);

            // Fetch Personal Tasks (simulated user for now, in real app use auth.getUser())
            const userId = 'CURRENT_USER_ID_PLACEHOLDER'; // TODO: Replace with real auth user

            const { data: tasks } = await supabase
                .from('personal_tasks')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            if (tasks) setPersonalTasks(tasks);

            if (activityId) {
                // Fetch Activity
                const { data: act } = await supabase
                    .from('agenda_activities')
                    .select('*')
                    .eq('id', activityId)
                    .single();

                if (act) {
                    setTitle(act.title);
                    setStatus(act.status || 'yellow');
                    setDate(act.date ? new Date(act.date).toISOString().split('T')[0] : '');
                    setLocation(act.location || '');
                    setLatitude(act.latitude);
                    setLongitude(act.longitude);
                    setLogistics(act.logistics_instructions || '');
                    setAgreements(act.agreements || '');
                    setReportDetails(act.report_details || '');
                }

                // Fetch Assignments
                const { data: assigns } = await supabase
                    .from('activity_assignments')
                    .select('user_id')
                    .eq('activity_id', activityId);

                if (assigns) {
                    setAssignedUserIds(new Set(assigns.map(a => a.user_id)));
                }

                // Fetch Evidence
                const { data: ev } = await supabase
                    .from('evidence')
                    .select('*')
                    .eq('activity_id', activityId)
                    .order('created_at', { ascending: false });
                if (ev) setEvidence(ev);
            }
        }

        if (isOpen) loadData();
    }, [activityId, isOpen]);

    // Reactive Autosave (Debounced)
    useEffect(() => {
        if (!activityId) return;

        const timer = setTimeout(async () => {
            console.log('Autosaving...', { title, status, location, logistics, latitude, longitude });

            await supabase.from('agenda_activities').update({
                title,
                status,
                date: date ? `${date}T00:00:00` : null,
                location,
                latitude,
                longitude,
                logistics_instructions: logistics,
                agreements,
                report_details: reportDetails
            } as any).eq('id', activityId);

        }, 1000);

        return () => clearTimeout(timer);
    }, [title, status, date, location, latitude, longitude, logistics, agreements, reportDetails, activityId]);

    const handleDelete = async () => {
        if (!activityId || !confirm('¿Estás seguro de querer eliminar esta actividad? Esta acción no se puede deshacer.')) return;

        await supabase.from('agenda_activities').delete().eq('id', activityId);

        setIsOpen(false);
        // We rely on the parent AgendaPage refreshing its data when drawer closes
    };


    const handleAddExpense = async () => {
        if (!newExpenseConcept || !newExpenseAmount) return;
        const amount = parseFloat(newExpenseAmount);

        // Add to local list
        const newExp = { description: newExpenseConcept, amount, type: 'expense' as const };
        setExpenses([...expenses, newExp]);
        setNewExpenseConcept('');
        setNewExpenseAmount('');

        // Save to DB
        // await supabase.from('finances').insert({ ... })
    };

    const handleAddPersonalTask = async () => {
        if (!newPersonalTask.trim()) return;

        // Optimistic Update
        const newTask: PersonalTask = {
            id: crypto.randomUUID(),
            user_id: 'CURRENT_USER_ID_PLACEHOLDER',
            title: newPersonalTask,
            is_completed: false,
            created_at: new Date().toISOString()
        };

        setPersonalTasks([newTask, ...personalTasks]);
        setNewPersonalTask('');

        // In real app: save to DB
        // await supabase.from('personal_tasks').insert({ ... })
    };

    const toggleTaskCompletion = (taskId: string) => {
        setPersonalTasks(prev => prev.map(t =>
            t.id === taskId ? { ...t, is_completed: !t.is_completed } : t
        ));
        // In real app: update DB
    };

    const toggleAssignment = (userId: string) => {
        const newSet = new Set(assignedUserIds);
        if (newSet.has(userId)) {
            newSet.delete(userId);
        } else {
            newSet.add(userId);
        }
        setAssignedUserIds(newSet);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0] || !activityId) return;
        setIsUploading(true);
        const file = e.target.files[0];

        try {
            // 1. Upload to Drive (Mock)
            const url = await uploadToGoogleDrive(file);

            // Determine type
            let type: EvidenceType = 'document';
            if (file.type.startsWith('image/')) type = 'image';
            if (file.type.startsWith('video/')) type = 'video';
            if (file.type.startsWith('audio/')) type = 'audio';

            // 2. Save to DB
            const newEvidence: Evidence = {
                id: crypto.randomUUID(),
                activity_id: activityId,
                file_url: url,
                file_type: type,
                uploaded_by: 'CURRENT_USER_ID_PLACEHOLDER',
                description: file.name,
                created_at: new Date().toISOString()
            };

            setEvidence([newEvidence, ...evidence]);
            // await supabase.from('evidence').insert(newEvidence);

        } catch (error) {
            console.error('Upload failed', error);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleLocationChange = (lat: number, lng: number) => {
        setLatitude(lat);
        setLongitude(lng);
    };

    return (
        <Drawer.Root open={isOpen} onOpenChange={setIsOpen} shouldScaleBackground>
            <Drawer.Trigger asChild>
                {trigger || <button className="px-4 py-2 bg-brand-green text-black rounded-full font-bold">Nueva Actividad</button>}
            </Drawer.Trigger>
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/60 z-50" />
                <Drawer.Content className={cn(
                    "border-status-yellow/50 shadow-[0_0_50px_rgba(255,210,51,0.1)]" // yellow default
                )}>

                    {/* Drawer Handle / Header */}
                    <div className="absolute top-3 left-0 right-0 flex justify-center z-10">
                        <div className="w-16 h-1.5 bg-white/20 rounded-full" />
                    </div>
                    {/* Delete Button (Absolute Top Right) */}
                    <button
                        onClick={handleDelete}
                        className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors z-20 p-2"
                        title="Eliminar Actividad"
                    >
                        <Trash size={18} />
                    </button>

                    {/* Tab Switcher */}
                    <div className="flex border-b border-white/10 bg-black/20 rounded-t-[10px] md:rounded-t-lg">
                        <button
                            onClick={() => setActiveTab('general')}
                            className={cn(
                                "flex-1 py-4 text-sm font-medium transition-colors cursor-pointer",
                                activeTab === 'general' ? "text-brand-green border-b-2 border-brand-green" : "text-gray-400 hover:text-white"
                            )}
                        >
                            General
                        </button>
                        <button
                            onClick={() => setActiveTab('evidence')}
                            className={cn(
                                "flex-1 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer",
                                activeTab === 'evidence' ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400 hover:text-white"
                            )}
                        >
                            <ImageIcon size={14} /> Evidencias
                        </button>
                        <button
                            onClick={() => setActiveTab('personal')}
                            className={cn(
                                "flex-1 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer",
                                activeTab === 'personal' ? "text-status-yellow border-b-2 border-status-yellow" : "text-gray-400 hover:text-white"
                            )}
                        >
                            <Lock size={14} /> Privado
                        </button>
                    </div>

                    <div className="p-4 bg-white/5 flex-1 overflow-y-auto">
                        {activeTab === 'general' && (
                            <div className="max-w-md mx-auto space-y-8 pb-10">
                                {/* Header Module */}
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        placeholder="Nombre de la actividad"
                                        className="w-full bg-transparent text-3xl font-bold text-white placeholder:text-white/20 focus:outline-none"
                                    />

                                    <div className="flex items-center gap-4">
                                        <span className="text-xs uppercase text-gray-500 font-bold tracking-wider">Estado:</span>
                                        <SemaphoreSelector
                                            currentStatus={status}
                                            onStatusChange={setStatus}
                                        />
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl border border-white/10 flex-1">
                                            <Calendar size={18} className="text-brand-green" />
                                            <input
                                                type="date"
                                                value={date}
                                                onChange={e => setDate(e.target.value)}
                                                className="bg-transparent text-sm w-full focus:outline-none dark:[color-scheme:dark]"
                                            />
                                        </div>
                                    </div>

                                    {/* Location Module */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl border border-white/10">
                                            <MapPin size={18} className="text-brand-green" />
                                            <input
                                                type="text"
                                                value={location}
                                                onChange={e => setLocation(e.target.value)}
                                                placeholder="Dirección o nombre del lugar"
                                                className="bg-transparent text-sm w-full focus:outline-none placeholder:text-white/30"
                                            />
                                        </div>

                                        {/* Map Location Picker */}
                                        <div className="mt-2">
                                            <LocationPicker
                                                latitude={latitude}
                                                longitude={longitude}
                                                onLocationChange={handleLocationChange}
                                            />
                                            {latitude && longitude && (
                                                <div className="text-[10px] text-gray-500 text-right mt-1 font-mono">
                                                    Lat: {latitude.toFixed(5)}, Lng: {longitude.toFixed(5)}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                </div>

                                <div className="h-px bg-white/10" />

                                {/* Sub-Blocks (Itinerary) Module */}
                                {activityId && <SubBlocksEditor activityId={activityId} />}

                                <div className="h-px bg-white/10" />

                                {/* Logistics Module */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-brand-green font-medium">
                                        <FileText size={20} />
                                        <h3>Logística & Instrucciones</h3>
                                    </div>
                                    <textarea
                                        value={logistics}
                                        onChange={e => setLogistics(e.target.value)}
                                        className="w-full h-32 bg-black/20 rounded-2xl p-4 text-sm text-gray-300 resize-none focus:outline-none focus:ring-1 focus:ring-brand-green/50 placeholder:text-white/10"
                                        placeholder="Escribe aquí las instrucciones de preparación, materiales necesarios y pasos logísticos..."
                                    />
                                </div>

                                {/* Mentions Module */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-brand-green font-medium">
                                        <Users size={20} />
                                        <h3>Equipo & Responsabilidades</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {profiles.length === 0 && <p className="text-xs text-white/40">Cargando perfiles...</p>}
                                        {profiles.map(profile => (
                                            <button
                                                key={profile.id}
                                                onClick={() => toggleAssignment(profile.id)}
                                                className={cn(
                                                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border transition-all",
                                                    assignedUserIds.has(profile.id)
                                                        ? "bg-brand-green/20 border-brand-green text-brand-green"
                                                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                                                )}
                                            >
                                                {/* Avatar placeholder if no url */}
                                                <div className="w-5 h-5 rounded-full bg-white/20 overflow-hidden">
                                                    {profile.avatar_url && <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />}
                                                </div>
                                                {profile.full_name.split(' ')[0]}
                                            </button>
                                        ))}
                                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border border-dashed border-white/20 text-gray-500 hover:text-white hover:border-white/50">
                                            <Plus size={14} /> invitar
                                        </button>
                                    </div>
                                </div>

                                {/* Reports Module */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-brand-green font-medium">
                                        <Check size={20} />
                                        <h3>Reporte & Acuerdos</h3>
                                    </div>
                                    <div className="grid gap-3">
                                        <input
                                            type="text"
                                            value={agreements}
                                            onChange={e => setAgreements(e.target.value)}
                                            placeholder="Acuerdos principales..."
                                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-green/50"
                                        />
                                        <textarea
                                            value={reportDetails}
                                            onChange={e => setReportDetails(e.target.value)}
                                            placeholder="Detalles para el reporte final..."
                                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm h-24 resize-none focus:outline-none focus:border-brand-green/50"
                                        />
                                    </div>
                                </div>

                                {/* Finances Module */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-brand-green font-medium">
                                        <DollarSign size={20} />
                                        <h3>Gastos Rápidos</h3>
                                    </div>
                                    <div className="bg-white/5 rounded-2xl p-4 space-y-3">
                                        {expenses.map((exp, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 last:pb-0">
                                                <span className="text-gray-300">{exp.description}</span>
                                                <span className="text-white font-mono">- ${exp.amount}</span>
                                            </div>
                                        ))}

                                        <div className="flex gap-2 mt-2 pt-2 border-t border-white/10">
                                            <input
                                                type="text"
                                                value={newExpenseConcept}
                                                onChange={e => setNewExpenseConcept(e.target.value)}
                                                placeholder="Concepto"
                                                className="bg-transparent text-sm w-full focus:outline-none placeholder:text-white/20"
                                            />
                                            <input
                                                type="number"
                                                value={newExpenseAmount}
                                                onChange={e => setNewExpenseAmount(e.target.value)}
                                                placeholder="$0.00"
                                                className="bg-transparent text-sm w-24 text-right focus:outline-none placeholder:text-white/20"
                                            />
                                            <button
                                                onClick={handleAddExpense}
                                                className="bg-white/10 p-1.5 rounded-lg hover:bg-brand-green hover:text-black transition-colors"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'evidence' && (
                            <div className="max-w-md mx-auto space-y-6 pb-10">
                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <h3 className="text-white font-bold text-xl flex items-center gap-2">
                                            <ImageIcon size={20} className="text-blue-400" /> Galería de Evidencias
                                        </h3>
                                        <p className="text-gray-400 text-xs">Fotos, videos y audios del campo.</p>
                                    </div>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading || !activityId}
                                        className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                                        Subir
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        accept="image/*,video/*,audio/*"
                                    />
                                </div>

                                <MediaGrid items={evidence} />
                            </div>
                        )}

                        {activeTab === 'personal' && (
                            <div className="max-w-md mx-auto space-y-6 pb-10">
                                {/* Personal Tasks Content */}
                                <div className="bg-black/40 border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <Lock size={100} />
                                    </div>
                                    <h3 className="text-status-yellow font-bold text-xl mb-4 flex items-center gap-2">
                                        <Lock size={20} /> Notas Privadas
                                    </h3>
                                    <p className="text-gray-400 text-xs mb-6">
                                        Estas notas son visibles solo para ti. Úsalas para recordatorios personales sobre esta actividad.
                                    </p>

                                    <div className="space-y-2 mb-6">
                                        {personalTasks.length === 0 && <p className="text-gray-600 italic text-sm">No tienes pendientes privados.</p>}
                                        {personalTasks.map(task => (
                                            <div
                                                key={task.id}
                                                onClick={() => toggleTaskCompletion(task.id)}
                                                className={cn(
                                                    "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border",
                                                    task.is_completed
                                                        ? "bg-white/5 border-transparent opacity-50"
                                                        : "bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-5 h-5 rounded flex items-center justify-center transition-colors",
                                                    task.is_completed ? "bg-status-yellow text-black" : "border-2 border-gray-500"
                                                )}>
                                                    {task.is_completed && <Check size={14} strokeWidth={3} />}
                                                </div>
                                                <span className={cn(
                                                    "text-sm flex-1",
                                                    task.is_completed ? "line-through text-gray-500" : "text-gray-200"
                                                )}>
                                                    {task.title}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-4 py-3">
                                        <Plus size={18} className="text-gray-400" />
                                        <input
                                            type="text"
                                            value={newPersonalTask}
                                            onChange={e => setNewPersonalTask(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleAddPersonalTask()}
                                            placeholder="Agregar pendiente privado..."
                                            className="bg-transparent text-sm w-full focus:outline-none placeholder:text-white/20 text-white"
                                        />
                                        <button
                                            onClick={handleAddPersonalTask}
                                            className="text-xs bg-status-yellow/10 text-status-yellow px-2 py-1 rounded hover:bg-status-yellow/20"
                                        >
                                            Agregar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root >
    );
}
