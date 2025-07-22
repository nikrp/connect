"use client"

import { createContext, useContext, useState } from "react";

const UserContext = createContext<any>(null);

export function UserContextProvider({ value, children }: any) {
    const [profile, setProfile] = useState(value.profile);
    const [user, setUser] = useState(value.user);
    return <UserContext.Provider value={{ user, setUser, profile, setProfile }}>{children}</UserContext.Provider>
}

export function useUser() {
    return useContext(UserContext);
}