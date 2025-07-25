"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/contexts/UserContext"
import { Building, School, Timer } from "lucide-react";

export default function Profile() {
    const { user, setUser, profile, setProfile } = useUser();

    return (
        <div className={`bg-card rounded-xl w-11/12 md:w-9/12 mx-auto mb-5`}>
            <div className={`p-10 md:p-10 bg-muted text-muted-foreground rounded-t-xl`}>
                <div className={`flex flex-col md:flex-row md:justify-between`}>
                    <div className={`flex flex-row items-start gap-4 mb-5`}>
                        <Avatar className={`size-20 md:size-40 bg-sidebar p-2 rounded-full`}>
                            <AvatarImage className={``} src={profile.profile_photo} />
                            <AvatarFallback>
                                {profile.name.split(' ').map((name: string) => name.substring(0, 2)).join('')}
                            </AvatarFallback>
                        </Avatar>
                        <div className={``}>
                            <p className={`text-xl md:text-2xl font-sans font-semibold`}>{profile.name}</p>
                            <p className={`text-md md:text-xl font-sans text-foreground/80`}>Student</p>
                        </div>
                    </div>
                    <div className={`flex flex-col gap-2`}>
                        <p className={`text-base flex items-center gap-2`}><Building className={`text-foreground/75`} />{profile.school.split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}</p>
                        <p className={`text-base flex items-center gap-2`}><Timer className={`text-foreground/75`} />{profile.preferredWorkTimes.join(', ')}</p>
                    </div>
                </div>
                <p className={`mb-5`}>{profile.bio}</p>
                <p className={`font-semibold mb-1`}>Skills</p>
                <div className={`flex items-center gap-1.5 flex-wrap`}>
                    {profile.skills.map((skill: { slug: string, label: string, custom: boolean }, index: number) => {
                        return (
                            <p className={`px-3 py-1 rounded-full bg-input`} key={index}>{skill.label}</p>
                        )
                    })}
                </div>
                <p className={`font-semibold mt-5 mb-1`}>Interests</p>
                <div className={`flex items-center gap-1.5 flex-wrap`}>
                    {profile.interests.map((skill: { slug: string, label: string, custom: boolean }, index: number) => {
                        return (
                            <p className={`px-3 py-1 rounded-full bg-input`} key={index}>{skill.label}</p>
                        )
                    })}
                </div>
            </div>
            <div className={`p-10 md:p-10 bg-card text-card-foreground rounded-b-xl`}>
                <p className={`text-4xl font-semibold`}>Collabs (0)</p>
                <p className={`w-full text-center mt-10`}>No Collabs</p>
            </div>
        </div>
    )
}