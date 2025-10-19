"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/contexts/UserContext"
import type { Profile } from "../../../types/profile";
import { User } from "@supabase/supabase-js";
import { Dispatch, SetStateAction } from "react";
import { Building, School, Timer, Edit2 } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SchoolComboBox } from "@/components/schools-combo";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export default function Profile() {
    const { user, setUser, profile: profileRaw, setProfile } : { user: User | null, setUser: Dispatch<SetStateAction<User | null>>, profile: Profile | null, setProfile: Dispatch<SetStateAction<Profile | null>> } = useUser();
    const profile: Profile = profileRaw ?? ({} as Profile);
    const supabase = createClient();
    const editForm = useForm({
        defaultValues: {
            name: profile.name || '',
            bio: profile.bio || '',
            school: profile.school || '',
            profile_photo: profile.profile_photo || '',
        }
    });
    const [open, setOpen] = useState(false);
    const [schools, setSchools] = useState<{ label: string; value: string }[]>([]);
    const [collabs, setCollabs] = useState<any[]>([]);
    const [collabsLoading, setCollabsLoading] = useState(true);

    useEffect(() => {
        async function loadSchools() {
            try {
                const res = await fetch('/schools.json');
                if (!res.ok) return;
                const data = await res.json();
                // data may be an array of school names or objects; normalize to {label,value}
                const normalized = data.map((s: any) => typeof s === 'string' ? { label: s, value: s } : { label: s.label || s.name || s.value, value: s.value || s.name || s.label });
                setSchools(normalized);
            } catch (err) {
                console.warn('Failed to load schools.json', err);
            }
        }

        loadSchools();
    }, []);

    // Fetch current user's collabs
    useEffect(() => {
        async function loadCollabs() {
            try {
                setCollabsLoading(true);
                // reuse existing RPC that returns collabs with members for the current user
                const { data, error } = await supabase.rpc('get_user_collabs_with_members');
                if (error) {
                    console.error('Error loading collabs:', error);
                    setCollabs([]);
                    return;
                }
                setCollabs(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Unexpected error loading collabs:', err);
                setCollabs([]);
            } finally {
                setCollabsLoading(false);
            }
        }

        // only load if we have a signed-in user
        if (user) loadCollabs();
    }, [user]);

    const router = useRouter();

    const handleMessage = async (creatorId: string) => {
        try {
            const response = await fetch('/api/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user2_id: creatorId })
            });

            if (!response.ok) {
                const err = await response.json();
                toast.error('Error starting conversation', { description: err.error });
                return;
            }

            const conversation = await response.json();
            router.push(`/messages?conversation=${conversation.id}`);
        } catch (err) {
            console.error('Error starting conversation:', err);
            toast.error('Error starting conversation');
        }
    }

    const onSubmit = async (vals: any) => {
        try {
            if (!user?.id) throw new Error('Not authenticated');

            const { error } = await supabase.from('profiles').update({
                name: vals.name,
                bio: vals.bio,
                school: vals.school,
                profile_photo: vals.profile_photo,
            }).eq('id', user.id);

            if (error) throw error;
            const updated = { ...profile, ...vals };
            setProfile(updated);
            toast.success('Profile updated');
            // persist locally
            localStorage.setItem('profile', JSON.stringify(updated));
            setOpen(false);
            // close dialog handled by Dialog component
        } catch (err: any) {
            toast.error('Error updating profile', { description: err.message });
        }
    }

    return (
        <div className={`bg-card rounded-xl w-11/12 md:w-9/12 mx-auto mb-5`}>
            <div className={`p-10 md:p-10 bg-muted text-muted-foreground rounded-t-xl`}>
                <div className={`flex flex-col md:flex-row md:justify-between`}>
                    <div className={`flex flex-row items-start gap-4 mb-5`}>
                        <Avatar className={`size-20 md:size-40 bg-sidebar p-2 rounded-full`}>
                            <AvatarImage className={``} src={profile.profile_photo ?? undefined} />
                            <AvatarFallback>
                                {(profile.name || "").split(' ').map((name: string) => name.substring(0, 2)).join('')}
                            </AvatarFallback>
                        </Avatar>
                            {/*
                                Note: this block expects a state variable `open` and setter `setOpen`
                                to be declared in the component body, e.g.
                                    const [open, setOpen] = useState(false);
                            */}
                            <Dialog open={open} onOpenChange={setOpen}>
                                    <DialogTrigger asChild>
                                            <Button variant="outline" className="ml-2"><Edit2 /></Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                            <DialogHeader>
                                                    <DialogTitle>Edit Profile</DialogTitle>
                                            </DialogHeader>
                                            <Form {...editForm}>
                                                    <form
                                                            onSubmit={(e) =>
                                                                    // ensure the dialog closes only after the profile update handler runs
                                                                    editForm.handleSubmit(async (vals) => {
                                                                            await onSubmit(vals);
                                                                            setOpen(false);
                                                                    })(e)
                                                            }
                                                            className="space-y-4"
                                                    >
                                                            <FormField control={editForm.control} name="name" render={({ field }) => (
                                                                    <FormItem>
                                                                            <FormLabel>Name</FormLabel>
                                                                            <FormControl>
                                                                                    <Input {...field} />
                                                                            </FormControl>
                                                                            <FormMessage />
                                                                    </FormItem>
                                                            )} />
                                                            <FormField control={editForm.control} name="bio" render={({ field }) => (
                                                                    <FormItem>
                                                                            <FormLabel>Bio</FormLabel>
                                                                            <FormControl>
                                                                                    <Textarea {...field} />
                                                                            </FormControl>
                                                                            <FormMessage />
                                                                    </FormItem>
                                                            )} />
                                                            <FormField control={editForm.control} name="school" render={({ field }) => (
                                                                    <FormItem>
                                                                            <FormLabel>School</FormLabel>
                                                                            <FormControl>
                                                                                    <SchoolComboBox value={field.value || ''} onChange={field.onChange} schools={schools} />
                                                                            </FormControl>
                                                                            <FormMessage />
                                                                    </FormItem>
                                                            )} />
                                                            <FormField control={editForm.control} name="profile_photo" render={({ field }) => (
                                                                    <FormItem>
                                                                            <FormLabel>Profile Photo URL</FormLabel>
                                                                            <FormControl>
                                                                                    <Input {...field} />
                                                                            </FormControl>
                                                                            <FormMessage />
                                                                    </FormItem>
                                                            )} />
                                                            <div className="flex gap-2 justify-end">
                                                                    <Button variant="outline" type="button" onClick={() => editForm.reset()}>Reset</Button>
                                                                    <Button type="submit">Save</Button>
                                                            </div>
                                                    </form>
                                            </Form>
                                    </DialogContent>
                            </Dialog>
                        <div className={``}>
                            <p className={`text-xl md:text-2xl font-sans font-semibold`}>{profile.name || profile.email || 'User'}</p>
                            <p className={`text-md md:text-xl font-sans text-foreground/80`}>{profile.role || 'Student'}</p>
                        </div>
                    </div>
                    <div className={`flex flex-col gap-2`}>
                        <p className={`text-base flex items-center gap-2`}><Building className={`text-foreground/75`} />{(profile.school || '').split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}</p>
                        <p className={`text-base flex items-center gap-2`}><Timer className={`text-foreground/75`} />{Array.isArray(profile.preferredWorkTimes) ? profile.preferredWorkTimes.join(', ') : ''}</p>
                    </div>
                </div>
                <p className={`mb-5`}>{profile.bio}</p>
                <p className={`font-semibold mb-1`}>Skills</p>
                <div className={`flex items-center gap-1.5 flex-wrap`}>
                    {(Array.isArray(profile.skills) ? profile.skills : []).map((skill: { slug: string, label: string, custom: boolean }, index: number) => {
                        return (
                            <p className={`px-3 py-1 rounded-full bg-input`} key={index}>{skill.label}</p>
                        )
                    })}
                </div>
                <p className={`font-semibold mt-5 mb-1`}>Interests</p>
                <div className={`flex items-center gap-1.5 flex-wrap`}>
                    {(Array.isArray(profile.interests) ? profile.interests : []).map((skill: { slug: string, label: string, custom: boolean }, index: number) => {
                        return (
                            <p className={`px-3 py-1 rounded-full bg-input`} key={index}>{skill.label}</p>
                        )
                    })}
                </div>
            </div>
            <div className={`p-10 md:p-10 bg-card text-card-foreground rounded-b-xl`}>
                <p className={`text-4xl font-semibold`}>Collabs ({collabs.length})</p>
                {collabsLoading ? (
                    <p className={`w-full text-center mt-10 text-foreground/75`}>Loading collabs...</p>
                ) : collabs.length === 0 ? (
                    <p className={`w-full text-center mt-10`}>No Collabs</p>
                ) : (
                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 mt-6`}>
                        {collabs.map((request: any) => {
                            const postDate = new Date(request.created_at).toLocaleString('en-US', {
                                timeZone: 'America/Los_Angeles',
                                month: 'numeric',
                                day: 'numeric',
                                year: 'numeric',
                                hour: 'numeric',
                                minute: 'numeric',
                                hour12: true,
                                timeZoneName: 'short'
                            });

                            return (
                                <div key={request.id} className={`border rounded-lg p-3.5 bg-background`}>
                                    <div className={`flex gap-5`}>
                                        <img
                                            src={request.creator_profile?.profile_photo || profile.profile_photo || "https://github.com/shadcn.png"}
                                            alt="profile-photo"
                                            className={`w-10 h-10 rounded-full`}
                                        />
                                        <div className={`flex flex-col`}>
                                            <p className={`text-lg font-semibold text-foreground`}>
                                                {request.creator_profile?.name || profile.name || "You"}
                                                <span className={`text-sm text-gray-500 font-normal`}>
                                                    {request.creator_profile?.pronouns ? ` (${request.creator_profile.pronouns})` : ""}
                                                </span>
                                            </p>
                                            <p className={`text-sm text-gray-500`}>{postDate}</p>
                                        </div>
                                    </div>
                                    <p className={`font-semibold mt-3.5 mb-2`}>{request.title}</p>
                                    <p className={`text-foreground/80 line-clamp-3 text-sm mb-2`}>{request.description}</p>
                                    <div className={`mb-3.5 flex flex-wrap item-center gap-2.5`}>
                                        {(Array.isArray(request.skills) ? request.skills : []).map((skill: any, index2: number) => {
                                            return (
                                                <p
                                                    onClick={() => setOpen(true)}
                                                    key={index2}
                                                    className={`px-2 py-0.5 rounded bg-accent cursor-pointer hover:bg-accent/80 transition-all text-sm text-primary`}
                                                >
                                                    #{skill.slug}
                                                </p>
                                            )
                                        })}
                                    </div>
                                    <div className={`grid grid-cols-2 gap-3.5`}>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant={`default`} className={`cursor-pointer w-full`}>View</Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader className={`flex items-center flex-row gap-5`}>
                                                    <img
                                                        src={request.creator_profile?.profile_photo || profile.profile_photo || "https://github.com/shadcn.png"}
                                                        alt="profile-photo"
                                                        className={`w-10 h-10 rounded-full`}
                                                    />
                                                    <div className={`flex flex-col justify-start items-start`}>
                                                        <p className={`text-lg font-semibold text-foreground`}>
                                                            {request.creator_profile?.name || profile.name || "You"}
                                                            <span className={`text-sm text-gray-500 font-normal`}>
                                                                {request.creator_profile?.pronouns ? ` (${request.creator_profile.pronouns})` : ""}
                                                            </span>
                                                        </p>
                                                        <p className={`text-sm text-gray-500`}>{postDate}</p>
                                                    </div>
                                                </DialogHeader>
                                                <p className={`font-semibold`}>{request.title}</p>
                                                <p className={`text-foreground/80 text-sm mb-1`}>{request.description}</p>
                                                <div className={`mb-3.5 flex flex-wrap item-center gap-2.5`}>
                                                    {(Array.isArray(request.skills) ? request.skills : []).map((skill: any, index2: number) => {
                                                        return (
                                                            <p
                                                                onClick={() => setOpen(true)}
                                                                key={index2}
                                                                className={`px-2 py-0.5 rounded bg-accent cursor-pointer hover:bg-accent/80 transition-all text-sm text-primary`}
                                                            >
                                                                #{skill.slug}
                                                            </p>
                                                        )
                                                    })}
                                                </div>
                                                <Button
                                                    variant={`secondary`}
                                                    className={`cursor-pointer w-full`}
                                                    size={`lg`}
                                                    onClick={() => handleMessage(request.creator_id)}
                                                >
                                                    Message
                                                </Button>
                                            </DialogContent>
                                        </Dialog>
                                        <Button
                                            variant={`secondary`}
                                            className={`cursor-pointer w-full`}
                                            onClick={() => handleMessage(request.creator_id)}
                                        >
                                            Message
                                        </Button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
            <Toaster position="top-right" richColors />
        </div>
    )
}