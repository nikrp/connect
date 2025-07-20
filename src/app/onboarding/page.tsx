"use client"

import Galaxy from "@/components/react-bits/galaxy";
import { createClient } from "@/lib/supabase/client"
import { Progress } from "@/src/components/animate-ui/radix/progress";
import { Spotlight } from "@/src/components/ui/spotlight";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react"

export default function Onboarding() {
    const supabase = createClient();
    const params = useSearchParams();
    const [name, setName] = useState("");

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            const provider = session?.user.app_metadata?.provider;
            console.log(params.get('name'))
            setName(params.get('name') as string || "");
        })
    }, []);

    return (
        <div className={`flex items-center`}>
            <div className={`w-full md:w-1/2 h-screen p-7.5`}>
                <div className={`flex items-center justify-between`}>
                    <p className={`text-2xl font-semibold`}>Connect</p>
                    <div className={`flex items-center gap-7.5`}>
                        <p className={`cursor-pointer hover:underline underline-offset-4`}>Need Help?</p>
                        <p className={`cursor-pointer hover:underline underline-offset-4`}>Login</p>
                    </div>
                </div>
                <div className={`grid w-full grid-cols-1 gap-2 my-5 mb-20`}>
                    <Progress value={20} />
                </div>
                <p className={`text-5xl text-foreground`}>Welcome to Connect!</p>
                <p className={`text-base mt-3.5 text-foreground/80`}>Let's create your profile.</p>
            </div>
            <div className={`hidden md:block md:w-1/2 h-screen p-5 pl-0`}>
                <div className={`relative h-full bg-card/75 shadow-xl rounded-xl overflow-hidden`}>
                    <Galaxy saturation={1} hueShift={220} mouseInteraction mouseRepulsion />
                </div>
            </div>
        </div>
    )
}