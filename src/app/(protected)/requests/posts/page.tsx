"use client"

import { createClient } from "@/lib/supabase/client";
import { columns } from "./columns";
import { RequestsTable } from "./requests-table";
import { toast, Toaster } from "sonner";
import { useEffect, useState } from "react";

export default function Posts() {
  const supabase = createClient();
  const [posts, setPosts] = useState([]);

  async function collectCollabRequests() {
    const { data, error } = await supabase
        .rpc("get_user_collabs_with_members");

    if (error) {
        toast.error("Error collecting collab requests:", {
            description: error.message,
        });
        return;
    }

    setPosts(data);
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