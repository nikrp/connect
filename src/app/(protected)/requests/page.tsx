"use client"

import AppSidebar from "@/components/app-sidebar";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTrigger, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Check, Filter } from "lucide-react";
import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { User } from "@supabase/supabase-js";
import { Toaster } from "@/components/ui/sonner";

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

export default function Requests() {
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<string[]>([]);
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const router = useRouter();

    // Diagnostic: log when component function runs
    // (this runs on each render) — helps confirm mounting
    console.log('[Requests] render - requests length:', requests.length);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    }

    // Handle messaging functionality
    const handleMessage = async (creatorId: string) => {
        try {
            const response = await fetch('/api/conversations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user2_id: creatorId
                })
            });

            if (!response.ok) {
                const error = await response.json();
                toast.error("Error starting conversation:", {
                    description: error.error,
                });
                return;
            }

            const conversation = await response.json();
            // Navigate to messages page with the conversation
            router.push(`/messages?conversation=${conversation.id}`);
        } catch (error) {
            toast.error("Error starting conversation:", {
                description: "An unexpected error occurred",
            });
        }
    };

    // Fetch requests from Supabase
    const fetchRequests = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('collab_requests')
                // include the creator's profile (profiles.id => collab_requests.creator_id)
                .select('*, creator_profile:profiles(id, name, profile_photo, pronouns)')
                .eq('visibility', 'public')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('[Requests] fetchRequests supabase error:', error);
                toast.error("Error fetching requests:", { description: error.message });
                return;
            }

            console.log('[Requests] fetched data:', data);
            setRequests(data || []);
        } catch (error) {
            console.error('[Requests] fetchRequests unexpected error:', error);
            toast.error("Error fetching requests:", { description: (error as any)?.message || 'Unexpected error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log('[Requests] useEffect mount');
        try {
            toast.info("Loading requests...");
        } catch (err) {
            console.warn('[Requests] toast.info failed:', err);
        }
        fetchRequests();
    }, []);

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
                    filteredRequests.map((request, index) => {
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
                            <RequestCard key={request.id} request={request} onMessage={() => handleMessage(request.creator_id)} refresh={fetchRequests} userCtx={useUser()} />
                        )
                    })
                )}
            </div>
            <Toaster position={`top-right`} richColors />
        </div>
    )
}

function RequestCard({ request, onMessage, refresh, userCtx }: { request: Request; onMessage: () => void; refresh: () => void; userCtx: { user: User | null } | any }) {
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [joinOpen, setJoinOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState<string>("");
    const [hasRequested, setHasRequested] = useState<boolean>(false);
    const supabase = createClient();
    const user = userCtx?.user as User | null;

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
                    // don't flood the console for common permission errors, but log for debugging
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
            const { data, error } = await supabase.from('collab_members').insert([{
                collab_id: request.id,
                user_id: user.id,
                status: 'pending',
                message: message || null
            }]);

            if (error) {
                console.error('Error inserting join request', error);
                toast.error('Error requesting to join', { description: error.message });
                return;
            }

            toast.success('Request to join sent');
            // mark as requested so UI updates immediately
            setHasRequested(true);
            window.dispatchEvent(new CustomEvent('collab-join-request', { detail: { collabId: request.id, userId: user.id } }));
            setJoinOpen(false);
            setMessage('');
            refresh();
        } catch (err: any) {
            console.error('Unexpected error requesting to join', err);
            toast.error('Error requesting to join', { description: err?.message || 'Unexpected error' });
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className={`border rounded-lg p-3.5`}>
            <div className={`flex gap-5`}>
                <img 
                    src={request.creator_profile?.profile_photo || "https://github.com/shadcn.png"} 
                    alt="profile-photo" 
                    className={`w-10 h-10 rounded-full`} 
                />
                <div className={`flex flex-col`}>
                    <p className={`text-lg font-semibold text-foreground`}>
                        {request.creator_profile?.name || "Unknown User"} 
                        <span className={`text-sm text-gray-500 font-normal`}>
                            {request.creator_profile?.pronouns ? ` (${request.creator_profile.pronouns})` : ""}
                        </span>
                    </p>
                    <p className={`text-sm text-gray-500`}>{postDate}</p>
                </div>
            </div>
            <p className={`font-semibold mt-3.5 mb-2`}>{request.title}</p>
            <p className={`text-foreground/80 line-clamp-3 text-sm mb-2`}>{request.description}</p>
            <div className={`mb-2`}>
                <p className={`text-sm text-foreground/70 mb-1.5`}>Skills needed:</p>
                <div className={`flex flex-wrap gap-2`}>
                    {(Array.isArray(request.tags) ? request.tags : []).map((skill: any, index2: number) => (
                        <p 
                            key={index2} 
                            className={`px-2 py-0.5 rounded bg-accent text-sm text-primary`}
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
                            <img 
                                src={request.creator_profile?.profile_photo || "https://github.com/shadcn.png"} 
                                alt="profile-photo" 
                                className={`w-10 h-10 rounded-full`} 
                            />
                            <div className={`flex flex-col justify-start items-start`}>
                                <p className={`text-lg font-semibold text-foreground`}>
                                    {request.creator_profile?.name || "Unknown User"} 
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
                            {(Array.isArray(request.tags) ? request.tags : []).map((tag: any, index2: number) => {
                                return (
                                    <p key={index2} className={`px-2 py-0.5 rounded bg-accent cursor-pointer hover:bg-accent/80 transition-all text-sm text-primary`}>
                                        {tag.label}
                                    </p>
                                )
                            })}
                        </div>
                        {/* Message button removed per request */}
                    </DialogContent>
                </Dialog>

                <div className="flex flex-col gap-2">
                    {/* Message button removed per request */}
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