export type Status = 'red' | 'yellow' | 'green';
export type Role = 'admin' | 'coordinator' | 'volunteer';

export interface Profile {
  id: string; // UUID
  email: string;
  full_name: string;
  node?: 'Xalapa' | 'Monterrey' | 'Pachuca' | 'Tula' | 'Mérida' | 'CDMX' | 'Puebla' | 'Querétaro' | 'Morelos' | 'Guadalajara' | 'Oaxaca' | 'Nacional';
  role: Role;
  avatar_url?: string;
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  year: number;
  status: Status;
  cover_image?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
}

export interface AgendaActivity {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: Status; // Default 'yellow'
  date: string; // ISO String
  location?: string;
  latitude?: number;
  longitude?: number;
  agreements?: string; // Report Module
  report_details?: string; // Report Module
  logistics_instructions?: string; // Logistics Module
  impact_metric_value?: number; // KPI Value (e.g. 50, 100)
  impact_metric_unit?: string; // KPI Unit (e.g. "kg RSU", "árboles", "asistentes")
  created_at: string;
}

export interface SubBlock {
  id: string;
  activity_id: string;
  title: string;
  description?: string;
  time_start: string; // Time string like "14:00"
  time_end: string;
}

export type FinanceType = 'income' | 'expense';

export interface Finance {
  id: string;
  project_id: string;
  type: FinanceType;
  amount: number;
  description: string;
  date: string;
  created_at: string;
}

export interface ActivityAssignment {
  id: string;
  activity_id: string;
  user_id: string;
  role_in_activity?: string;
  created_at: string;
}

export interface PersonalTask {
  id: string;
  user_id: string;
  title: string;
  is_completed: boolean;
  due_date?: string;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  target_audience?: string; // 'all', 'volunteers', etc.
  created_at: string;
}

export type EvidenceType = 'image' | 'video' | 'audio' | 'document';

export interface Evidence {
  id: string;
  activity_id: string;
  file_url: string;
  file_type: EvidenceType;
  uploaded_by: string;
  description?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  old_data?: any; // jsonb
  new_data?: any; // jsonb
  performed_by: string;
  created_at: string;
}
