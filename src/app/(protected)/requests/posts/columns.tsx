"use client"

import { ColumnDef } from "@tanstack/react-table";

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
    },
    {
        accessorKey: "members",
        header: "Members",
    },
    {
        accessorKey: "visibility",
        header: "Visibility",
    },
    {
        accessorKey: "status",
        header: "Status",
    },
    {
        accessorKey: "lastUpdated",
        header: "Last Updated"
    }
]