"use client"

import { ColumnDef } from "@tanstack/react-table";
import MembersCell from "./member-cell";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Copy, Eye, EyeClosed, Info, MoreHorizontal, Trash } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { User } from "@supabase/supabase-js";

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
        cell: info => <MembersCell userIds={(info.getValue() as object[]).map((n: any) => n.user_id)} />
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
            const collab = row.original
            const { user, setUser, profile, setProfile } : { user: User, setUser: (user: User) => void, profile: object, setProfile: (profile: object) => void } = useUser(); 

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel className={`text-foreground/70`}>Actions</DropdownMenuLabel>
                        <DropdownMenuItem className={`cursor-pointer`} onClick={() => navigator.clipboard.writeText(collab.id)}>
                            <Copy />
                            <span>Copy Collab ID</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className={`cursor-pointer`} onClick={() => navigator.clipboard.writeText(collab.id)}>
                            <Info />
                            <span>View Details</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant={`destructive`} className={`cursor-pointer`} onClick={() => navigator.clipboard.writeText(collab.id)}>
                            {collab.visibility === `public` ? <EyeClosed /> : <Eye />}
                            <span>Make {collab.visibility === `public` ? "Private" : "Public"}</span>
                        </DropdownMenuItem>
                        {collab.creator_id === user.id && (
                            <DropdownMenuItem variant={`destructive`} className={`cursor-pointer`} onClick={() => navigator.clipboard.writeText(collab.id)}>
                                <Trash />
                                <span>Delete</span>
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }
]