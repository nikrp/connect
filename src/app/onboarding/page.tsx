"use client"

import Availability from "@/components/onboarding/availability";
import Basic from "@/components/onboarding/basic";
import Privacy from "@/components/onboarding/privacy";
import SkillsInterests from "@/components/onboarding/skills-interests";
import Welcome from "@/components/onboarding/welcome";
import Galaxy from "@/components/react-bits/galaxy";
import { createClient } from "@/lib/supabase/client";
import { Progress } from "@/src/components/animate-ui/radix/progress";
import { useEffect, useState } from "react";

const steps = [
    {
        title: "Welcome",
        description: "Let's create your profile.",
        component: Welcome,
    },
    {
        title: "Basic Information",
        description: "Tell us about yourself.",
        component: Basic,
    },
    {
        title: "Skills & Interests",
        description: "What are you good at? What do you like?",
        component: SkillsInterests,
    },
    {
        title: "Availability",
        description: "When are you free to communicate with your partners?",
        component: Availability,
    },
    {
        title: "Privacy",
        description: "Last bit of privacy settings!",
        component: Privacy,
    },
]

export default function Onboarding() {
    const supabase = createClient();
    const [name, setName] = useState("");
    const [bigForm, setBigForm] = useState<any>({});
    const [step, setStep] = useState<number>(0);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setName(session?.user.user_metadata.full_name || session?.user.user_metadata.name || "");
        });
    }, []);

    useEffect(() => {
        console.log(bigForm, step);
    }, [bigForm, step]);

    const StepComponent = steps[step].component;

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
                    <Progress value={((step + 1) / 5) * 100} />
                </div>
                {step === 0 ? (
                    <>
                        <p className={`text-5xl text-foreground`}>Welcome{name === "" ? ` to Connect` : ", " + name.split(" ")[0]}!</p>
                        <p className={`text-base mt-3.5 mb-7.5 text-foreground/80`}>Let's create your profile.</p>
                        <StepComponent name={name} setStep={setStep} setBigForm={setBigForm} bigForm={bigForm} />
                    </>
                ) : (
                    <>
                        <p className={`text-5xl text-foreground`}>{steps[step].title}</p>
                        <p className={`text-base mt-3.5 mb-7.5 text-foreground/80`}>{steps[step].description}</p>
                        <StepComponent name={name} setStep={setStep} setBigForm={setBigForm} bigForm={bigForm} />
                    </>
                )}
            </div>
            <div className={`hidden md:block md:w-1/2 h-screen p-5 pl-0`}>
                <div className={`relative h-full bg-card/75 shadow-xl rounded-xl overflow-hidden`}>
                    <Galaxy saturation={1} hueShift={220} mouseInteraction mouseRepulsion />
                </div>
            </div>
        </div>
    )
}