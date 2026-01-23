
export interface Message {
    id: string;
    user_id: string;
    content: string;
    created_at: string;
    profiles?: {
        full_name: string;
        avatar_url?: string;
        role?: string;
    }
}
