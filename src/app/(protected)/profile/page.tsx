"use client"

import { useUser } from "@/contexts/UserContext"

export default function Profile() {
    const { user, setUser, profile, setProfile } = useUser();

    return (
        <div></div>
    )
}