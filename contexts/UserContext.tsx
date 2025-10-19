"use client"

import { createContext, useContext, useState, Dispatch, SetStateAction } from "react";
import { Profile } from "../src/types/profile";
import { User } from "@supabase/supabase-js";

type UserContextValue = {
    user: User | null;
    setUser: Dispatch<SetStateAction<User | null>>;
    profile: Profile | null;
    setProfile: Dispatch<SetStateAction<Profile | null>>;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserContextProvider({ value, children }: any) {
    const [profile, setProfile] = useState<Profile | null>(value?.profile ?? null);
    const [user, setUser] = useState<User | null>(value?.user ?? null);
    return <UserContext.Provider value={{ user, setUser, profile, setProfile }}>{children}</UserContext.Provider>
}

export function useUser() {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error('useUser must be used within UserContextProvider');
    return ctx;
}