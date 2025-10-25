"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTrigger, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export type Request = {
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
    id?: string;
    name?: string;
    pronouns?: string;
    profile_photo?: string;
    grade?: string;
    school?: string;
  };
};

const getMatchColor = (score: number) => {
  if (score >= 70) return 'rgb(34, 197, 94)';
  if (score >= 40) return 'rgb(234, 179, 8)';
  return 'rgb(239, 68, 68)';
};

export function RequestCard({
  request,
  viewer,
  refresh,
}: {
  request: Request;
  viewer: User | null;
  refresh: () => void;
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [hasRequested, setHasRequested] = useState<boolean>(false);
  const supabase = createClient();

  // Hide join if viewer is the creator
  const isCreator = viewer?.id && request.creator_id === viewer.id;

  useEffect(() => {
    let mounted = true;
    const checkExisting = async () => {
      if (!viewer || isCreator) return;
      try {
        const { data, error } = await supabase
          .from('collab_members')
          .select('id,status')
          .eq('collab_id', request.id)
          .eq('user_id', viewer.id)
          .limit(1);
        if (!mounted) return;
        if (!error) setHasRequested(Array.isArray(data) && data.length > 0);
      } catch {}
    };
    checkExisting();
    return () => { mounted = false };
  }, [request.id, viewer?.id, isCreator]);

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
    if (!viewer) {
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
        user_id: viewer.id,
        status: 'pending',
        message: message || null
      }]);

      if (error) {
        toast.error('Error requesting to join', { description: error.message });
        return;
      }

      toast.success('Request to join sent');
      setHasRequested(true);
      window.dispatchEvent(new CustomEvent('collab-join-request', { detail: { collabId: request.id, userId: viewer?.id } }));
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
    <div className="border rounded-lg p-3.5">
      <div className="flex gap-5">
        <Link href={`/requests/posts/${request.creator_id}`} className="flex gap-5 items-center group">
          <img
            src={request.creator_profile?.profile_photo || "https://github.com/shadcn.png"}
            alt="profile-photo"
            className="w-10 h-10 rounded-full"
          />
          <div className="flex flex-col">
            <p className="text-lg font-semibold text-foreground group-hover:underline">
              {request.creator_profile?.name || "Unknown User"}
              <span className="text-sm text-gray-500 font-normal">
                {request.creator_profile?.pronouns ? ` (${request.creator_profile.pronouns})` : ""}
              </span>
            </p>
            <p className="text-sm text-gray-500">{postDate}</p>
          </div>
        </Link>
      </div>
      <div className="flex items-center justify-between mt-3.5 mb-2">
        <p className="font-semibold">{request.title}</p>
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
      <p className="text-foreground/80 line-clamp-3 text-sm mb-2">{request.description}</p>
      <div className="mb-2">
        <div className="flex flex-wrap gap-2">
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
