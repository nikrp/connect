"use client"

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const supabase = createClient();
    const { user, profile, setProfile } = useUser();
    const [email, setEmail] = useState(user?.email || "");

    async function updateEmail() {
        try {
            const { data, error } = await supabase.auth.updateUser({ email });
            if (error) throw error;
            toast.success('Email updated (if changed)');
        } catch (err: any) {
            toast.error('Error updating email', { description: err.message });
        }
    }

    return (
        <div className={`w-11/12 md:w-9/12 mx-auto`}> 
            <h1 className={`text-2xl font-semibold mb-4`}>Settings</h1>
            <div className={`mb-6`}>
                <p className={`mb-2 font-semibold`}>Theme</p>
                <div className={`flex items-center gap-2`}>
                    <Button onClick={() => setTheme('light')} variant={theme === 'light' ? 'default' : 'outline'}>Light</Button>
                    <Button onClick={() => setTheme('dark')} variant={theme === 'dark' ? 'default' : 'outline'}>Dark</Button>
                    <Button onClick={() => setTheme('system')} variant={theme === 'system' ? 'default' : 'outline'}>System</Button>
                </div>
            </div>
            <div>
                <p className={`mb-2 font-semibold`}>Email</p>
                <div className={`flex gap-2`}> 
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                    <Button onClick={updateEmail}>Update</Button>
                </div>
            </div>
        </div>
    )
}
