"use client"

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTrigger, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
// removed inline Dialog usage; shared RequestCard manages its own dialogs
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, Filter } from "lucide-react";
import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
// Link not needed after refactor to shared RequestCard
import { useUser } from "@/contexts/UserContext";
import { User } from "@supabase/supabase-js";
import { Toaster } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

// Define the request type based on what we expect from Supabase
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
        name: string;
        pronouns?: string;
        profile_photo?: string;
        grade?: string;
        school?: string;
    };
}

const tags = [
    "machine-learning",
    "biology",
    "fun",
    "programming",
    "math",
    "science",
    "physics",
    "chemistry",
    "biochemistry",
    "computer-science",
    "artificial-intelligence",
    "data-science",
    "robotics",
    "engineering",
    "electronics",
    "web-development",
    "mobile-development",
    "cybersecurity",
    "networking",
    "database",
    "cloud-computing",
    "game-development",
    "statistics",
    "calculus",
    "linear-algebra",
    "quantum-computing",
    "bioinformatics",
    "neuroscience",
    "environmental-science",
    
]

// Get color based on match score (red-yellow-green spectrum)
const getMatchColor = (score: number) => {
    if (score >= 70) return 'rgb(34, 197, 94)'; // green
    if (score >= 40) return 'rgb(234, 179, 8)'; // yellow
    return 'rgb(239, 68, 68)'; // red
};

export default function Requests() {
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<string[]>([]);
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<any>(null);
    const supabase = createClient();
    const { user } = useUser() as any;

    // Diagnostic: log when component function runs
    // (this runs on each render) — helps confirm mounting
    console.log('[Requests] render - requests length:', requests.length);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    }

    // Messaging disabled in explore card UI; the shared card only supports View / Request to Join

    // Calculate match score between user profile and request
    const calculateMatchScore = (request: Request, userProfile: any): number => {
        if (!userProfile) return 0;
        
        let score = 0;
        let totalWeight = 0;
        
        // 1. Tag/Skills overlap (50% weight)
        const userSkills = Array.isArray(userProfile.skills) ? userProfile.skills : [];
        const requestTags = Array.isArray(request.tags) ? request.tags : [];
        
        if (userSkills.length > 0 && requestTags.length > 0) {
            const userSkillSlugs = userSkills.map((s: any) => s.slug?.toLowerCase() || '');
            const requestTagSlugs = requestTags.map((t: any) => t.slug?.toLowerCase() || '');
            const matchingTags = requestTagSlugs.filter((tag: string) => userSkillSlugs.includes(tag));
            const tagScore = (matchingTags.length / Math.max(requestTagSlugs.length, 1)) * 100;
            score += tagScore * 0.5;
            totalWeight += 0.5;
        }
        
        // 2. Interest alignment (30% weight)
        const userInterests = Array.isArray(userProfile.interests) ? userProfile.interests : [];
        if (userInterests.length > 0 && requestTags.length > 0) {
            const userInterestSlugs = userInterests.map((i: any) => i.slug?.toLowerCase() || '');
            const requestTagSlugs = requestTags.map((t: any) => t.slug?.toLowerCase() || '');
            const matchingInterests = requestTagSlugs.filter((tag: string) => userInterestSlugs.includes(tag));
            const interestScore = (matchingInterests.length / Math.max(requestTagSlugs.length, 1)) * 100;
            score += interestScore * 0.3;
            totalWeight += 0.3;
        }
        
        // 3. Similarity bonus for exact skill matches (20% weight)
        if (userSkills.length > 0 && requestTags.length > 0) {
            const userSkillSlugs = userSkills.map((s: any) => s.slug?.toLowerCase() || '');
            const requestTagSlugs = requestTags.map((t: any) => t.slug?.toLowerCase() || '');
            const exactMatches = requestTagSlugs.filter((tag: string) => userSkillSlugs.includes(tag)).length;
            const bonusScore = Math.min((exactMatches / userSkills.length) * 100, 100);
            score += bonusScore * 0.2;
            totalWeight += 0.2;
        }
        
        return totalWeight > 0 ? Math.round(score / totalWeight) : 0;
    };

    // Fetch requests from Supabase
    const fetchRequests = async (currentUserId?: string) => {
        try {
            setLoading(true);
            // Build query and exclude current user's posts if user is available
            let query = supabase
                .from('collab_requests')
                // include the creator's profile (profiles.id => collab_requests.creator_id)
                .select('*, creator_profile:profiles(id, name, profile_photo, pronouns)')
                .eq('visibility', 'public')
                .order('created_at', { ascending: false });

            if (currentUserId) {
                query = query.neq('creator_id', currentUserId);
            }

            const { data, error } = await query;

            if (error) {
                console.error('[Requests] fetchRequests supabase error:', error);
                toast.error("Error fetching requests:", { description: error.message });
                return;
            }

            console.log('[Requests] fetched data:', data);
            
            // Calculate match scores if user profile is available
            const scoredRequests = (data || []).map(request => ({
                ...request,
                matchScore: userProfile ? calculateMatchScore(request, userProfile) : 0
            }));
            
            // Sort by match score (highest first)
            scoredRequests.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
            
            setRequests(scoredRequests);
        } catch (error) {
            console.error('[Requests] fetchRequests unexpected error:', error);
            toast.error("Error fetching requests:", { description: (error as any)?.message || 'Unexpected error' });
        } finally {
            setLoading(false);
        }
    };

    // Fetch user profile with skills and interests
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!user?.id) return;
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('skills, interests')
                    .eq('id', user.id)
                    .single();
                
                if (error) {
                    console.error('Error fetching user profile:', error);
                    return;
                }
                
                setUserProfile(data);
            } catch (err) {
                console.error('Error fetching user profile:', err);
            }
        };
        
        fetchUserProfile();
    }, [user?.id]);

    useEffect(() => {
        console.log('[Requests] useEffect mount');
        try {
            toast.info("Loading requests...");
        } catch (err) {
            console.warn('[Requests] toast.info failed:', err);
        }
        fetchRequests(user?.id);
    }, [user?.id, userProfile]);

    // Filter requests based on search and selected tags
    const filteredRequests = requests.filter(request => {
        const matchesSearch = search === "" || 
            (request.title || "").toLowerCase().includes(search.toLowerCase()) ||
            (request.description || "").toLowerCase().includes(search.toLowerCase()) ||
            (request.creator_profile?.name || "").toLowerCase().includes(search.toLowerCase());
        
        const matchesTags = selected.length === 0 || 
            selected.some(tag => Array.isArray(request.tags) && request.tags.some((t: any) => t.slug === tag));
        
        return matchesSearch && matchesTags;
    });

    if (loading) {
        return (
            <div className={``}>
                <p className={`text-xl font-semibold mb-4 text-center`}>Explore Requests</p>
                <div className={`flex items-center justify-center h-64`}>
                    <p className={`text-foreground/75`}>Loading requests...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={``}>
            <p className={`text-xl font-semibold mb-4 text-center`}>Explore Requests</p>
            <div className={`flex items-center flex-wrap gap-1.5 w-full mb-2.5`}>
                <Input value={search} onChange={onChange} placeholder={`Search by Title, Description, or Username...`} className={`w-full lg:w-3/6 xl:w-5/12 text-sm`} />
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant={`outline`} className={`cursor-pointer`} size={`icon`}><Filter /></Button>
                    </PopoverTrigger>
                    <PopoverContent>
                        <Command>
                            <CommandInput placeholder="Search tags..." className={`h-9`} />
                            <CommandList>
                                <CommandEmpty>No Tags Found</CommandEmpty>
                                <CommandGroup>
                                    {tags.map((tag, index) => {
                                        return (
                                            <CommandItem className={`cursor-pointer`} key={index} value={tag} onSelect={(currentValue) => {
                                                if (selected.includes(currentValue)) {
                                                    setSelected(selected.filter((value) => value !== currentValue));
                                                } else {
                                                    setSelected([...selected, currentValue]);
                                                }
                                            }}>
                                                {tag}
                                                <Check className={cn(
                                                    "ml-auto text-foreground",
                                                    selected.includes(tag) ? `opacity-100`: `opacity-0`
                                                )} />
                                            </CommandItem>
                                        )
                                    })}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
                <p className={`text-foreground/75 text-sm ml-1`}>{selected.length} Filters Applied</p>
                <div className={`h-5 mx-1.5 w-px rounded-full bg-foreground/15`} />
                <p className={`text-foreground/75 text-sm`}>{filteredRequests.length} of {requests.length} Results</p>
            </div>
            <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3`}>
                {filteredRequests.length === 0 ? (
                    <div className={`col-span-full flex items-center justify-center h-32`}>
                        <p className={`text-foreground/75`}>No requests found matching your criteria.</p>
                    </div>
                ) : (
                    filteredRequests.map((request) => (
                        <RequestCard
                            key={request.id}
                            request={request}
                            refresh={() => fetchRequests(user?.id)}
                            user={user as User | null}
                        />
                    ))
                )}
            </div>
            <Toaster position={`top-right`} richColors />
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

    // Check if the current user already has a join request/member row for this collab
    useEffect(() => {
        let mounted = true;
        const checkExisting = async () => {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from('collab_members')
                    .select('id,status')
                    .eq('collab_id', request.id)
                    .eq('user_id', user.id)
                    .limit(1);

                if (error) {
                    console.debug('Error checking existing collab_members:', error.message);
                    return;
                }

                if (!mounted) return;
                setHasRequested(Array.isArray(data) && data.length > 0);
            } catch (err) {
                console.debug('Unexpected error checking existing collab_members', err);
            }
        }

        checkExisting();
        return () => { mounted = false };
    }, [request.id, user?.id]);

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
    }

    return (
        <div className={`border rounded-lg p-3.5`}>
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
                        className={`ml-2 flex items-center gap-1.5 ${request.matchScore === 100 ? "bg-accent/90 text-emerald-600 border-accent" : "bg-accent text-primary border-accent"}`}
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
            <div className={`mb-2`}>
                <div className={`flex flex-wrap gap-2`}>
                    {(Array.isArray(request.tags) ? request.tags : []).map((skill: any, index2: number) => (
                        <p 
                            key={index2} 
                            className={`px-2 py-0.5 rounded bg-accent text-xs text-primary`}
                        >
                            {skill.label}
                        </p>
                    ))}
                </div>
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
            </div>
        </div>
    )
}
