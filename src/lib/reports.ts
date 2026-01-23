import { supabase } from './supabase';
import { Project, AgendaActivity, Finance, AuditLog } from '@/types/database';

export interface ImpactStats {
    totalActivities: number;
    completedActivities: number;
    validatedPlaces: number;
    totalVolunteers: number; // Distinct users assigned
    totalHours: number; // Estimated
}

export interface FinanceSummary {
    totalEstimated: number;
    totalSpent: number;
    byCategory: Record<string, number>;
}

export async function calculateImpact(): Promise<ImpactStats> {
    const { data: activities } = await supabase.from('agenda_activities').select('*');
    const { data: assignments } = await supabase.from('activity_assignments').select('user_id');
    const { data: projects } = await supabase.from('projects').select('latitude');

    const totalActivities = activities?.length || 0;
    const completedActivities = activities?.filter(a => a.status === 'green').length || 0;
    const validatedPlaces = (activities?.filter(a => a.latitude).length || 0) + (projects?.filter(p => p.latitude).length || 0);

    // Count unique volunteers
    const uniqueVolunteers = new Set(assignments?.map(a => a.user_id)).size;

    // Estimate hours: Default 2 hours per activity * number of assignees per activity
    // For simplicity, let's just do total activities * 4 hours avg duration
    const totalHours = totalActivities * 4;

    return {
        totalActivities,
        completedActivities,
        validatedPlaces,
        totalVolunteers: uniqueVolunteers,
        totalHours
    };
}

export async function calculateFinances(): Promise<FinanceSummary> {
    const { data: finances } = await supabase.from('finances').select('*');

    // Mock Estimated Budget logic (or fetch from a yet-to-be-created Budget table)
    const ESTIMATED_TOTAL = 50000;

    const expenses = finances?.filter(f => f.type === 'expense') || [];
    const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);

    const byCategory: Record<string, number> = {};
    expenses.forEach(exp => {
        // Mock categorization based on description keywords since 'category' field isn't explicitly in interface used here yet or just use description
        // If we added 'category' to Finance interface, use it. For now, use 'General'.
        const cat = 'Operativo';
        byCategory[cat] = (byCategory[cat] || 0) + exp.amount;
    });

    return {
        totalEstimated: ESTIMATED_TOTAL,
        totalSpent,
        byCategory
    };
}

export async function getAuditHistory() {
    const { data: logs, error } = await supabase
        .from('audit_logs')
        .select(`
            *,
            profiles:performed_by(full_name, role)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching audit logs", error);
        return [];
    }

    return logs;
}
