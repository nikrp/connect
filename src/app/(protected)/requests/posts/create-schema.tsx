import { z } from "zod";

export const createPostSchema = z.object({
    title: z.string().min(1, "Title is required.").max(30, "Title must be under 30 characters."),
    description: z.string().max(250, "Description must be under 250 characters."),
    skills: z.array(z.object({
        label: z.string(),
        slug: z.string(),
        custom: z.boolean(),
    })).min(1).max(10, "You can select up to five skills."),
    visibility: z.literal(["public", "private"]),
    member_goal: z.number().min(1, "Member goal must be at least 1."),
})