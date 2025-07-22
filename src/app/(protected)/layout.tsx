"use client"

// app/(protected)/layout.tsx
import { createClient } from '@/lib/supabase/client';
import { redirect } from 'next/navigation';
import { UserContextProvider } from '@/contexts/UserContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/app-sidebar';
import Navbar from '@/components/navbar';
import { useEffect, useState } from 'react';
import { AuthUser } from '@supabase/supabase-js';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<any>({});

  useEffect(() => {
    async function getUser() {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) redirect('/login');

        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

        setUser(user);
        setProfile(profile);
    }

    getUser()
  }, []);

  return !user || !profile ? null : (
    <UserContextProvider value={{ user, profile }}>
        <div className={``}>
            <SidebarProvider open={false} defaultOpen={false}>
                <AppSidebar />
                <div className={`mt-2 w-11/12 mx-auto`}>
                    <Navbar />
                    {children}
                </div>
            </SidebarProvider>
        </div>
    </UserContextProvider>
  );
}
