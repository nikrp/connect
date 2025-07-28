"use client"

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { User } from "@supabase/supabase-js";
import { useUser } from "@/contexts/UserContext";

export default function MembersCell({ userIds }: { userIds: string[] }) {
  const [users, setUsers] = useState<any[]>([]);
  const { user, setUser, profile, setProfile }: { user: User, setUser: (user: User) => void, profile: object, setProfile: (profile: object) => void } = useUser();
  useEffect(() => {
    async function fetchUsers() {
      const supabase = createClient();
      const { data } = await supabase.from('profiles').select('*').in('id', userIds);
      setUsers(data || []);
    }
    if (userIds.length) fetchUsers();
  }, [userIds]);
  return (
    <div className={`flex -space-x-4`}>
      {users.map(u => (
        <Tooltip key={u.id}>
            <TooltipTrigger>
                <Avatar>
                    <AvatarImage src={u.profile_photo} />
                    <AvatarFallback>{u.name.split(' ').map((n: any) => n[0]).join('')}</AvatarFallback>
                </Avatar>
            </TooltipTrigger>
            <TooltipContent>
                <p>{u.name} {u.id === user.id && " (You)"}</p>
            </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}