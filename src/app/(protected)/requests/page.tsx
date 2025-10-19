"use client"

import AppSidebar from "@/components/app-sidebar";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Check, Filter } from "lucide-react";
import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Define the request type based on what we expect from Supabase
interface Request {
    id: string;
    title: string;
    description: string;
    creator_id: string;
    created_at: string;
    visibility: "public" | "private";
    skills: Array<{ label: string; slug: string; custom: boolean }>;
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
                .select('*')
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
            selected.some(tag => Array.isArray(request.skills) && request.skills.some((skill: any) => skill.slug === tag));
        
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
                            <div key={request.id} className={`border rounded-lg p-3.5`}>
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
                                <div className={`mb-3.5 flex flex-wrap item-center gap-2.5`}>
                                    {(Array.isArray(request.skills) ? request.skills : []).map((skill: any, index2: number) => {
                                        return (
                                            <p 
                                                onClick={() => setSearch((currValue) => currValue + ", " + skill.slug)} 
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
                                                {(Array.isArray(request.skills) ? request.skills : []).map((skill: any, index2: number) => {
                                                    return (
                                                        <p 
                                                            onClick={() => setSearch((currValue) => currValue + ", " + skill.slug)} 
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
                    })
                )}
            </div>
        </div>
    )
}