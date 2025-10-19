export interface Profile {
    id: string;
    created_at: string | null;
    updated_at: string | null;
    name?: string | null;
    pronouns?: string | null;
    profile_photo?: string | null;
    grade?: string | null;
    school?: string | null;
    timezone?: string | null;
    bio?: string | null;
    skills?: any[] | null;
    interests?: any[] | null;
    experience?: string | null;
    preferredWorkTimes?: string[] | null;
    allow_messages?: boolean;
    social_links?: string[] | null;
    newsletter?: boolean | null;
    contact?: any | null;
    email?: string | null;
    role?: string | null;
}

export type PartialProfile = Partial<Profile>;
