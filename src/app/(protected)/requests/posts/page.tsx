"use client"

import { createClient } from "@/lib/supabase/client";
import { columns } from "./columns";
import { RequestsTable } from "./requests-table";
import { toast, Toaster } from "sonner";
import { useEffect, useState } from "react";

export default function Posts() {
  const supabase = createClient();
  const [posts, setPosts] = useState<any[]>([]);

  async function collectCollabRequests() {
    try {
      // Get all collabs with members
      const { data: collabs, error: collabsError } = await supabase
        .rpc("get_user_collabs_with_members");
      if (collabsError) throw collabsError;

      // Collect all unique member user_ids
      const allMemberIds = Array.from(new Set(
        collabs.flatMap((collab: any) =>
          Array.isArray(collab.members) ? collab.members.map((m: any) => m.user_id) : []
        )
      ));

      // Fetch all profiles in one query
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, profile_photo, school')
        .in('id', allMemberIds);
      if (profilesError) throw profilesError;

      // Map user_id to profile
      const profileMap: Record<string, any> = {};
      for (const p of profiles || []) {
        profileMap[p.id] = p;
      }

      // Attach profile to each member
      const collabsWithProfiles = collabs.map((collab: any) => ({
        ...collab,
        members: Array.isArray(collab.members)
          ? collab.members.map((member: any) => ({
              ...member,
              profile: profileMap[member.user_id] || null
            }))
          : []
      }));

      setPosts(collabsWithProfiles);
    } catch (error: any) {
      toast.error("Error collecting collab requests:", {
        description: error.message,
      });
    }
  }

  useEffect(() => {
    collectCollabRequests();
  const handler = () => collectCollabRequests();
  window.addEventListener('collab-changed', handler);
  return () => window.removeEventListener('collab-changed', handler);
  }, []);

  return (
    <div className={``}>
      <p className={`text-xl font-semibold mb-4`}>My Posts</p>
      <RequestsTable refresh={collectCollabRequests} columns={columns} data={posts} />
    </div>
  )
}