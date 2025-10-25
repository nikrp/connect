"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/contexts/UserContext";
import type { Profile } from "../../../../../types/profile";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { Building, Timer } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTrigger, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Mail, Phone, Twitter, Linkedin, ExternalLink } from "lucide-react";
// Local inline RequestCard used instead of shared component per request

// Request type for public collabs
interface Request {
    id: string;
    title: string;
    description: string;
    creator_id: string;
    created_at: string;
    visibility: "public" | "private";
    tags: Array<{ label: string; slug: string; custom: boolean }>;
    member_goal: number;
    member_count: number;
    matchScore?: number;
    creator_profile?: {
        name?: string;
        pronouns?: string;
        profile_photo?: string;
        grade?: string;
        school?: string;
    };
}

const getMatchColor = (score: number) => {
    if (score >= 70) return 'rgb(34, 197, 94)';
    if (score >= 40) return 'rgb(234, 179, 8)';
    return 'rgb(239, 68, 68)';
};

export default function Profile() {
    const { user } = useUser() as { user: User | null };
    const [profile, setProfile] = useState<Profile>({} as Profile);
    const [collabs, setCollabs] = useState<Request[]>([]);
    const [collabsLoading, setCollabsLoading] = useState(true);
    const [isCollabMember, setIsCollabMember] = useState(false);
    const supabase = createClient();
    const params = useParams() as { userId?: string };
    const targetUserId = params?.userId as string;

    // Load target profile
    useEffect(() => {
        async function loadProfile() {
            if (!targetUserId) return;
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', targetUserId)
                    .single();
                if (!error && data) setProfile(data as any); console.log("PROFILE DATA:", data);
            } catch (err) {
                console.error('Failed to load profile', err);
            }
        }
        loadProfile();
    }, [targetUserId]);

    // Fetch target user's public collabs
    const fetchCollabs = async () => {
        if (!targetUserId) return;
        try {
            setCollabsLoading(true);
            const { data, error } = await supabase
                .from('collab_requests')
                .select('*, creator_profile:profiles(id, name, profile_photo, pronouns)')
                .eq('creator_id', targetUserId)
                .eq('visibility', 'public')
                .order('created_at', { ascending: false });
            if (!error) setCollabs(Array.isArray(data) ? (data as any) : []);
        } catch (err) {
            console.error('Unexpected error loading collabs:', err);
            setCollabs([]);
        } finally {
            setCollabsLoading(false);
        }
    };

    useEffect(() => {
        fetchCollabs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [targetUserId]);

    // Check if current user is a member of any of the target user's collabs
    useEffect(() => {
        async function checkMembership() {
            if (!user?.id || !targetUserId || user.id === targetUserId) {
                setIsCollabMember(false);
                return;
            }
            try {
                // Get all collab IDs for the target user
                const { data: targetCollabs, error: collabError } = await supabase
                    .from('collab_requests')
                    .select('id')
                    .eq('creator_id', targetUserId);
                
                if (collabError || !targetCollabs || targetCollabs.length === 0) {
                    setIsCollabMember(false);
                    return;
                }

                const collabIds = targetCollabs.map(c => c.id);

                // Check if current user is a member of any of these collabs
                const { data: membership, error: memberError } = await supabase
                    .from('collab_members')
                    .select('id')
                    .eq('user_id', user.id)
                    .in('collab_id', collabIds)
                    .limit(1);

                if (!memberError && membership && membership.length > 0) {
                    setIsCollabMember(true);
                } else {
                    setIsCollabMember(false);
                }
            } catch (err) {
                console.error('Error checking membership:', err);
                setIsCollabMember(false);
            }
        }
        checkMembership();
    }, [user?.id, targetUserId]);

    // Messaging disabled; using shared RequestCard actions only on public page

    // No editing on public profile page

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
                
                {/* Contact Information - only shown if current user is a collab member */}
                {isCollabMember && profile.contact && (
                    <div className="mb-5">
                        <p className="font-semibold mb-2">Contact Information</p>
                        <div className="flex flex-col gap-2">
                            {/* Emails */}
                            {Array.isArray(profile.contact.emails) && profile.contact.emails.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {profile.contact.emails.map((email: string, index: number) => (
                                        <a 
                                            key={index}
                                            href={`mailto:${email}`}
                                            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-input hover:bg-input/80 transition-colors text-sm"
                                        >
                                            <Mail className="w-3.5 h-3.5" />
                                            {email}
                                        </a>
                                    ))}
                                </div>
                            )}
                            
                            {/* Phones */}
                            {Array.isArray(profile.contact.phones) && profile.contact.phones.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {profile.contact.phones.map((phone: string, index: number) => (
                                        <a 
                                            key={index}
                                            href={`tel:${phone}`}
                                            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-input hover:bg-input/80 transition-colors text-sm"
                                        >
                                            <Phone className="w-3.5 h-3.5" />
                                            {phone}
                                        </a>
                                    ))}
                                </div>
                            )}
                            
                            {/* Socials */}
                            {profile.contact.socials && (
                                <div className="flex flex-wrap gap-2">
                                    {profile.contact.socials.twitter && (
                                        <a 
                                            href={profile.contact.socials.twitter}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-input hover:bg-input/80 transition-colors text-sm"
                                        >
                                            <Twitter className="w-3.5 h-3.5" />
                                            Twitter
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    )}
                                    {profile.contact.socials.linkedin && (
                                        <a 
                                            href={profile.contact.socials.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-input hover:bg-input/80 transition-colors text-sm"
                                        >
                                            <Linkedin className="w-3.5 h-3.5" />
                                            LinkedIn
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
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
                <div className="flex items-center justify-between mb-6">
                    <p className={`text-4xl font-semibold`}>Collabs ({collabs.length})</p>
                </div>
                {collabsLoading ? (
                    <p className={`w-full text-center mt-10 text-foreground/75`}>Loading collabs...</p>
                ) : collabs.length === 0 ? (
                    <p className={`w-full text-center mt-10`}>No Collabs</p>
                ) : (
                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 mt-6`}>
                        {collabs.map((request: Request) => (
                            <RequestCard key={request.id} request={request} refresh={fetchCollabs} user={user} />
                        ))}
                    </div>
                )}
            </div>
            <Toaster position="top-right" richColors />
        </div>
    )
}

function RequestCard({ request, refresh, user }: { request: Request; refresh: () => void; user: User | null }) {
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [joinOpen, setJoinOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState<string>("");
    const [hasRequested, setHasRequested] = useState<boolean>(false);
    const supabase = createClient();

    // Disable join if viewer is the creator
    const isCreator = user?.id && request.creator_id === user.id;

    useEffect(() => {
        let mounted = true;
        const checkExisting = async () => {
            if (!user || isCreator) return;
            try {
                const { data, error } = await supabase
                    .from('collab_members')
                    .select('id,status')
                    .eq('collab_id', request.id)
                    .eq('user_id', user.id)
                    .limit(1);
                if (!mounted) return;
                if (!error) setHasRequested(Array.isArray(data) && data.length > 0);
            } catch {}
        };
        checkExisting();
        return () => { mounted = false };
    }, [request.id, user?.id, isCreator]);

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

    const requestToJoin = async () => {
        if (!user) {
            toast.error('You must be logged in to request to join');
            return;
        }
        if (hasRequested) {
            toast.error('You have already requested to join this collab');
            return;
        }

        setBusy(true);
        try {
            const { error } = await supabase.from('collab_members').insert([{
                collab_id: request.id,
                user_id: user.id,
                status: 'pending',
                message: message || null
            }]);
            if (error) {
                toast.error('Error requesting to join', { description: error.message });
                return;
            }
            toast.success('Request to join sent');
            setHasRequested(true);
            window.dispatchEvent(new CustomEvent('collab-join-request', { detail: { collabId: request.id, userId: user.id } }));
            setJoinOpen(false);
            setMessage('');
            refresh();
        } catch (err: any) {
            toast.error('Error requesting to join', { description: err?.message || 'Unexpected error' });
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className={`border rounded-lg p-3.5 bg-background`}>
            <div className={`flex gap-5`}>
                <Link href={`/requests/posts/${request.creator_id}`} className="flex gap-5 items-center group">
                    <img
                        src={request.creator_profile?.profile_photo || "https://github.com/shadcn.png"}
                        alt="profile-photo"
                        className={`w-10 h-10 rounded-full`}
                    />
                    <div className={`flex flex-col`}>
                        <p className={`text-lg font-semibold text-foreground group-hover:underline`}>
                            {request.creator_profile?.name || "Unknown User"}
                            <span className={`text-sm text-gray-500 font-normal`}>
                                {request.creator_profile?.pronouns ? ` (${request.creator_profile.pronouns})` : ""}
                            </span>
                        </p>
                        <p className={`text-sm text-gray-500`}>{postDate}</p>
                    </div>
                </Link>
            </div>
            <div className="flex items-center justify-between mt-3.5 mb-2">
                <p className={`font-semibold`}>{request.title}</p>
                {(request.matchScore !== undefined && request.matchScore > 0) && (
                    <Badge
                        variant="outline"
                        className={`ml-2 flex items-center gap-1.5 bg-accent text-primary border-accent`}
                    >
                        <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: getMatchColor(request.matchScore) }}
                        />
                        {request.matchScore}% Match
                    </Badge>
                )}
            </div>
            <p className={`text-foreground/80 line-clamp-3 text-sm mb-2`}>{request.description}</p>
            <div className={`mb-3.5 flex flex-wrap item-center gap-2.5`}>
                {(Array.isArray(request.tags) ? request.tags : []).map((tag: any, index2: number) => {
                    return (
                        <p key={index2} className={`px-2 py-0.5 rounded bg-accent text-sm text-primary`}>
                            {tag.label}
                        </p>
                    )
                })}
            </div>
            <div className={`grid grid-cols-2 gap-3.5`}>
                <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                    <DialogTrigger asChild>
                        <Button variant={`default`} className={`cursor-pointer w-full`}>View</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader className={`flex items-center flex-row gap-5`}>
                            <Link href={`/requests/posts/${request.creator_id}`} className="flex items-center gap-5 group">
                                <img
                                    src={request.creator_profile?.profile_photo || "https://github.com/shadcn.png"}
                                    alt="profile-photo"
                                    className={`w-10 h-10 rounded-full`}
                                />
                                <div className={`flex flex-col justify-start items-start`}>
                                    <p className={`text-lg font-semibold text-foreground group-hover:underline`}>
                                        {request.creator_profile?.name || "Unknown User"}
                                        <span className={`text-sm text-gray-500 font-normal`}>
                                            {request.creator_profile?.pronouns ? ` (${request.creator_profile.pronouns})` : ""}
                                        </span>
                                    </p>
                                    <p className={`text-sm text-gray-500`}>{postDate}</p>
                                </div>
                            </Link>
                        </DialogHeader>
                        <p className={`font-semibold`}>{request.title}</p>
                        <p className={`text-foreground/80 text-sm mb-1`}>{request.description}</p>
                        <div className={`mb-3.5 flex flex-wrap item-center gap-2.5`}>
                            {(Array.isArray(request.tags) ? request.tags : []).map((tag: any, index2: number) => {
                                return (
                                    <p key={index2} className={`px-2 py-0.5 rounded bg-accent cursor-pointer hover:bg-accent/80 transition-all text-sm text-primary`}>
                                        {tag.label}
                                    </p>
                                )
                            })}
                        </div>
                    </DialogContent>
                </Dialog>

                {!isCreator && (
                    <div className="flex flex-col gap-2">
                        <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
                            <DialogTrigger asChild>
                                <Button variant={hasRequested ? `outline` : `secondary`} className={`cursor-pointer w-full`} disabled={busy || hasRequested}>
                                    {hasRequested ? 'Requested' : 'Request to Join'}
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Request to Join</DialogTitle>
                                </DialogHeader>
                                <p className={`text-sm text-foreground/80 mt-2`}>Send a short message to the creator along with your request (optional).</p>
                                <div className="mt-4">
                                    <Textarea value={message} onChange={(e: any) => setMessage(e.target.value)} placeholder={`Add a short message (optional)`} />
                                </div>
                                <DialogFooter className="mt-4">
                                    <Button variant="outline" onClick={() => setJoinOpen(false)} disabled={busy}>Cancel</Button>
                                    <Button onClick={requestToJoin} disabled={busy}>{busy ? 'Requesting...' : 'Send Request'}</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
            </div>
        </div>
    );
}