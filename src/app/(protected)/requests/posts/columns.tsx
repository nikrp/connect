"use client"

import { ColumnDef } from "@tanstack/react-table";
import MembersCell from "./member-cell";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Check, Copy, Eye, EyeClosed, Info, MoreHorizontal, Trash, X } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { User } from "@supabase/supabase-js";
import { Profile } from "../../../../types/profile";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState, useEffect } from "react";

export type Post = {
    id: string
    creator_id: string
    title: string
    description: string
    tags: object[]
    member_goal: number
    created_at: Date
    updated_at: Date
    member_count: number
    visibility: "public" | "private",
    members: string[]
}

export const columns: ColumnDef<Post>[] = [
    {
        accessorKey: "title",
        header: "Title",
        cell: info => <p className={`font-semibold`}>{info.getValue() as string}</p>
    },
    {
        accessorKey: "visibility",
        header: "Visibility",
        cell: info => (
            <Badge variant={`secondary`} className={`text-sm`}>{info.getValue() === "public" ? "Public" : "Private"}</Badge>
        )
    },
    {
        accessorKey: "members",
        header: "Members",
        cell: info => <MembersCell userIds={(info.getValue() as object[]).filter((m: any) => m.status === 'accepted').map((n: any) => n.user_id)} />
    },
    {
        accessorKey: "tags",
        header: "Tags",
        cell: info => (
            <Badge variant={`outline`} className={`text-sm flex items-center gap-2`}>
                <span>{((info.getValue() as any[])[0] as { label: string })?.label}</span>
                {(info.getValue() as object[]).length > 1 && ` +${(info.getValue() as object[]).length - 1}`}
            </Badge>
        )
    },
    {
        accessorKey: "created_at",
        header: "Created",
        cell: info => (
            <span>
                {new Date(info.getValue() as string).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}
            </span>
        )
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const collab = row.original;
            console.log(collab)
            const { user, setUser, profile, setProfile } : { user: User | null, setUser: (user: User | null) => void, profile: Profile | null, setProfile: (profile: Profile | null) => void } = useUser();

            function ActionMenu() {
                // Efficient pending member profile fetching
                const [detailsOpen, setDetailsOpen] = useState(false);
                const [pendingProfiles, setPendingProfiles] = useState<Record<string, any>>({});
                useEffect(() => {
                    if (!detailsOpen) return;
                    const pendingMembers = collab.members?.filter((m: any) => m.status === 'pending') || [];
                    const idsToFetch = pendingMembers.filter((m: any) => !pendingProfiles[m.user_id]).map((m: any) => m.user_id);
                    if (idsToFetch.length === 0) return;
                    let mounted = true;
                    const supabase = createClient();
                    supabase
                        .from('profiles')
                        .select('id, name, profile_photo, school')
                        .in('id', idsToFetch)
                        .then(({ data }) => {
                            if (!mounted || !data) return;
                            setPendingProfiles(prev => {
                                const next = { ...prev };
                                for (const profile of data) {
                                    next[profile.id] = profile;
                                }
                                return next;
                            });
                        });
                    return () => { mounted = false };
                }, [detailsOpen, collab.members]);
                const [busy, setBusy] = useState(false);
                const [confirmOpen, setConfirmOpen] = useState(false);
                const [confirmType, setConfirmType] = useState<'delete'|'toggle'|null>(null);
                const [creatorProfile, setCreatorProfile] = useState<any | null>(null);
                const [creatorLoading, setCreatorLoading] = useState(false);

                const onConfirm = async () => {
                    setConfirmOpen(false);
                    if (confirmType === 'toggle') {
                        setBusy(true);
                        const supabase = createClient();
                        try {
                            const { error } = await supabase.from('collab_requests').update({ visibility: collab.visibility === 'public' ? 'private' : 'public' }).eq('id', collab.id);
                            if (error) throw error;
                            toast.success('Visibility updated');
                            window.dispatchEvent(new CustomEvent('collab-changed'));
                        } catch (err: any) {
                            console.error('Error updating visibility', err);
                            toast.error('Error updating visibility', { description: (err as any)?.message });
                        } finally {
                            setBusy(false);
                            setConfirmType(null);
                        }
                    }

                    if (confirmType === 'delete') {
                        setBusy(true);
                        const supabase = createClient();
                        try {
                            const { error } = await supabase.from('collab_requests').delete().eq('id', collab.id);
                            if (error) throw error;
                            toast.success('Post deleted');
                            // include id in detail so listeners can remove the row optimistically
                            window.dispatchEvent(new CustomEvent('collab-changed', { detail: { id: collab.id, action: 'deleted' } }));
                            // close details dialog if open
                            setDetailsOpen(false);
                            // clear any loaded creator profile
                            setCreatorProfile(null);
                        } catch (err: any) {
                            console.error('Error deleting post', err);
                            toast.error('Error deleting post', { description: (err as any)?.message });
                        } finally {
                            setBusy(false);
                            setConfirmType(null);
                        }
                    }
                }

                useEffect(() => {
                    if (!detailsOpen) return;
                    let mounted = true;
                    const fetchProfile = async () => {
                        setCreatorLoading(true);
                        const supabase = createClient();
                        try {
                            const { data, error } = await supabase.from('profiles').select('id, name, profile_photo, school').eq('id', collab.creator_id).single();
                            if (error) throw error;
                            if (mounted) setCreatorProfile(data ?? null);
                        } catch (err:any) {
                            console.error('Error fetching creator profile', err);
                            if (mounted) setCreatorProfile(null);
                        } finally {
                            if (mounted) setCreatorLoading(false);
                        }
                    }
                    fetchProfile();
                    return () => { mounted = false };
                }, [detailsOpen, collab.creator_id]);

                return (
                    <>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 relative" disabled={busy}>
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                                {collab.members?.some((m: any) => m.status === 'pending') && (
                                    <Badge variant={`default`} className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 p-0 flex items-center justify-center text-xs">
                                        {/* {collab.members.filter((m: any) => m.status === 'pending').length} */}
                                    </Badge>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel className={`text-foreground/70`}>Actions</DropdownMenuLabel>
                            <DropdownMenuItem className={`cursor-pointer`} onClick={() => navigator.clipboard.writeText(collab.id)}>
                                <Copy />
                                <span>Copy Collab ID</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className={`cursor-pointer flex items-center gap-2`} onClick={() => setDetailsOpen(true)}>
                                <Info />
                                <span>View Details</span>
                                {collab.members?.some((m: any) => m.status === 'pending') && (
                                    <Badge variant={`default`} className="ml-auto">
                                        {collab.members.filter((m: any) => m.status === 'pending').length} pending
                                    </Badge>
                                )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant={`destructive`} className={`cursor-pointer`} onClick={() => { setConfirmType('toggle'); setConfirmOpen(true); }}>
                                {collab.visibility === `public` ? <EyeClosed /> : <Eye />}
                                <span>{busy ? 'Working...' : `Make ${collab.visibility === `public` ? "Private" : "Public"}`}</span>
                            </DropdownMenuItem>
                            {collab.creator_id === user?.id && (
                                <DropdownMenuItem variant={`destructive`} className={`cursor-pointer`} onClick={() => { setConfirmType('delete'); setConfirmOpen(true); }}>
                                    <Trash />
                                    <span>{busy ? 'Working...' : 'Delete'}</span>
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{confirmType === 'delete' ? 'Delete Collab' : 'Change Visibility'}</DialogTitle>
                            </DialogHeader>
                            <p className={`text-sm text-foreground/80 mt-2`}>{confirmType === 'delete' ? 'This will permanently delete the collab. Are you sure?' : `This will make the collab ${collab.visibility === 'public' ? 'private' : 'public'}. Continue?`}</p>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
                                <Button onClick={onConfirm} disabled={busy}>{busy ? 'Working...' : confirmType === 'delete' ? 'Delete' : 'Confirm'}</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle className="break-words">{collab.title || 'Collab Details'}</DialogTitle>
                                </DialogHeader>

                                <div className="mt-2 space-y-3 text-sm text-foreground/90">
                                    <div>
                                        <strong className="block text-xs text-foreground/70">Description</strong>
                                        <p className="whitespace-pre-wrap">{collab.description || '—'}</p>
                                    </div>

                                    <div>
                                        <strong className="block text-xs text-foreground/70">Tags</strong>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {Array.isArray(collab.tags) && (collab.tags as any[]).length > 0 ? (
                                                (collab.tags as any[]).map((t: any, i: number) => (
                                                    <Badge key={i} variant="outline" className="text-xs">{t?.label ?? String(t)}</Badge>
                                                ))
                                            ) : (
                                                <span className="text-sm text-foreground/70">—</span>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <strong className="block text-xs text-foreground/70">Members</strong>
                                        <div className="mt-1 text-sm">{collab.member_count ?? (Array.isArray(collab.members) ? collab.members.length : '—')}</div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <strong className="block text-xs text-foreground/70">Visibility</strong>
                                            <div className="mt-1"><Badge variant="secondary" className="text-sm">{collab.visibility === 'public' ? 'Public' : 'Private'}</Badge></div>
                                        </div>
                                        <div>
                                            <strong className="block text-xs text-foreground/70">Created</strong>
                                            <div className="mt-1 text-sm">{collab.created_at ? new Date(collab.created_at as any).toLocaleString() : '—'}</div>
                                        </div>
                                    </div>

                                    <div>
                                        <strong className="block text-xs text-foreground/70">Creator</strong>
                                        <div className="mt-1 text-sm">
                                            {creatorLoading ? (
                                                'Loading...'
                                            ) : creatorProfile ? (
                                                <div className="flex items-center gap-3">
                                                    {creatorProfile.avatar_url ? (
                                                        // show image if available
                                                        <img src={creatorProfile.avatar_url} alt={creatorProfile.name || 'avatar'} className="h-8 w-8 rounded-full object-cover" />
                                                    ) : null}
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{creatorProfile.name ?? creatorProfile.id}</span>
                                                        {creatorProfile.school ? <span className="text-xs text-foreground/70">{creatorProfile.school}</span> : null}
                                                    </div>
                                                </div>
                                            ) : (
                                                collab.creator_id
                                            )}
                                        </div>
                                    </div>
                                    
                                    {collab.members?.some((m: any) => m.status === 'pending') && (
                                        <div>
                                            <strong className="block text-xs text-foreground/70 mb-2">Pending Requests</strong>
                                            <div className="space-y-3">
                                                {collab.members
                                                    .filter((m: any) => m.status === 'pending')
                                                    .map((member: any) => {
                                                        const profile = pendingProfiles[member.user_id];
                                                        const handleAction = async (action: 'accept' | 'reject') => {
                                                            setBusy(true);
                                                            const supabase = createClient();
                                                            try {
                                                                if (action === 'reject') {
                                                                    const { error } = await supabase
                                                                        .from('collab_members')
                                                                        .update({ status: 'rejected' })
                                                                        .eq('user_id', member.user_id);
                                                                    if (error) throw error;
                                                                    toast.success('Request rejected');
                                                                } else {
                                                                    console.log(member.user_id);
                                                                    // Add a check to make sure supabase is running correctly
                                                                    const { error } = await supabase
                                                                        .from('collab_members')
                                                                        .update({ status: 'accepted' })
                                                                        .eq('user_id', member.user_id);
                                                                    if (error) throw error;
                                                                    console.log("error:", error)
                                                                    toast.success('Request accepted');
                                                                }
                                                                window.dispatchEvent(new CustomEvent('collab-changed'));
                                                                //window.location.reload();
                                                            } catch (err: any) {
                                                                toast.error(`Failed to ${action} request`, {
                                                                    description: err.message
                                                                });
                                                            } finally {
                                                                setBusy(false);
                                                            }
                                                        };
                                                        return (
                                                            <div key={member.id} className="flex items-center justify-between p-3.5 rounded-lg border">
                                                                <div className="flex items-center gap-3">
                                                                    <img 
                                                                        src={profile?.profile_photo || "https://github.com/shadcn.png"} 
                                                                        alt="profile" 
                                                                        className="h-8 w-8 rounded-full object-cover"
                                                                    />
                                                                    <div className="flex flex-col">
                                                                        <span className="font-medium">{profile?.name || 'Unknown User'}</span>
                                                                        <span className="text-xs text-foreground/70">{profile?.school || ''}</span>
                                                                        {member.message && (
                                                                            <p className="text-xs text-foreground/70 mt-1 italic">"{member.message}"</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <Button 
                                                                        variant="outline"
                                                                        className={`cursor-pointer`}
                                                                        size="sm"
                                                                        disabled={busy}
                                                                        onClick={() => handleAction('reject')}
                                                                    >
                                                                        <X className={`text-destructive`} />
                                                                    </Button>
                                                                    <Button 
                                                                        variant="outline"
                                                                        className={`cursor-pointer`}
                                                                        size="sm"
                                                                        disabled={busy}
                                                                        onClick={() => handleAction('accept')}
                                                                    >
                                                                        <Check className={`text-emerald-400`} />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setDetailsOpen(false)}>Close</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </>
                )
            }

            return <ActionMenu />
        }
    }
]