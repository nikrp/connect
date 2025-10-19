"use client"

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CheckIcon, ChevronsUpDownIcon, PlusSquareIcon, ReceiptRussianRubleIcon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ControllerRenderProps, useForm } from "react-hook-form";
import z from "zod";
import { createPostSchema } from "./create-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Toaster } from "@/components/ui/sonner";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useEffect, useState } from "react";
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { CommandEmpty } from "cmdk";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import { User } from "@supabase/supabase-js";
import { Profile } from "../../../../types/profile";

interface RequestsTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    refresh: () => void;
}

export function RequestsTable<TData, TValue>({ columns, data, refresh }: RequestsTableProps<TData, TValue>) {
    const supabase = createClient();
    const [dialougeOpen, setDialougeOpen] = useState(false);
    const { user, setUser, profile, setProfile } : { user: User | null, setUser: (user: User | null) => void, profile: Profile | null, setProfile: (profile: Profile | null) => void } = useUser();
    const createForm = useForm<z.infer<typeof createPostSchema>>({
        resolver: zodResolver(createPostSchema),
        defaultValues: {
            title: "",
            description: "",
            skills: [],
            visibility: "public",
            member_goal: 1,  
        }
    })
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    const onSubmit = async (values: z.infer<typeof createPostSchema>) => {
        // Insert to collab_requests table.        
        const { data, error } = await supabase.rpc('create_collab_request_with_chat', {
            _title: values.title,
            _description: values.description,
            _skills: values.skills,
            _visibility: values.visibility,
            _member_goal: values.member_goal,
        });

        if (error) {
            toast.error("Error creating collab request:", {
                description: error.message,
            });
            return;
        }

        toast.success(`Collab Request Created Successfully!`);
        createForm.reset();
        setDialougeOpen(false);
        refresh()
    }

    return (
        <div>
            <div className={`flex items-center py-4 justify-between`}>
                <div className={``}>
                    <Input
                        placeholder="Filter titles..."
                        className={`w-64 md:w-96`}
                    />
                </div>
                <div>
                    <Dialog onOpenChange={setDialougeOpen} open={dialougeOpen}>
                        <DialogTrigger asChild>
                            <Button variant={`default`} className={`cursor-pointer flex items-center gap-1.5`} size={`sm`}><PlusSquareIcon />Create Post</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create a Request</DialogTitle>
                            </DialogHeader>
                            <Form {...createForm}>
                                <form className={`space-y-6`} onSubmit={createForm.handleSubmit(onSubmit)}>
                                    <FormField
                                        control={createForm.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Title</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Enter a title" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={createForm.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description (optional)</FormLabel>
                                                <FormControl>
                                                    <Textarea {...field} rows={3} placeholder="Enter a description (250 characters)" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={createForm.control}
                                        name="skills"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Skills</FormLabel>
                                                <FormControl>
                                                    <SkillsCombobox field={field} />
                                                </FormControl>
                                                <FormDescription className={`flex items-center flex-wrap gap-2.5`}>
                                                    {createForm.getValues().skills.map((skill, index) => {
                                                        return (
                                                            <Badge 
                                                                onClick={() => {
                                                                    const currentSkills = createForm.getValues().skills;
                                                                    const updatedSkills = currentSkills.filter((_, i) => i !== index);
                                                                    createForm.setValue('skills', updatedSkills);
                                                                }} 
                                                                className={`cursor-pointer opacity-80 hover:opacity-60 transition-all flex items-center gap-1.5`} 
                                                                key={index}
                                                            >
                                                                {skill.label}<X />
                                                            </Badge>
                                                        )
                                                    })}
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={createForm.control}
                                        name="visibility"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Visibility</FormLabel>
                                                <FormControl>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <SelectTrigger className={`w-full`}>
                                                            <SelectValue placeholder="Select a Visibility" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                <SelectItem value="public">Public</SelectItem>
                                                                <SelectItem value="private">Private</SelectItem>
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={createForm.control}
                                        name="member_goal"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Teammate Limit</FormLabel>
                                                <FormControl>
                                                    <Input type={`number`} value={field.value} onChange={(e) => field.onChange(parseInt(e.target.value))} min={1} defaultValue={1} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className={`w-full flex items-center gap-2.5 justify-end`}>
                                        <Button onClick={() => createForm.reset()} variant={`outline`} type={`button`} className={`cursor-pointer`}>Clear</Button>
                                        <Button variant={`default`} type={`submit`} className={`cursor-pointer`}>Create</Button>
                                    </div>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                            )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                        <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && "selected"}
                        >
                            {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                            ))}
                        </TableRow>
                        ))
                    ) : (
                        <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center">
                            No results.
                        </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
            </div>
            <Toaster richColors position={`top-right`} />
        </div>
    )
}

const tempSkills = [
    { label: "Python", slug: "python", custom: false },
    { label: "Web Development", slug: "web-development", custom: false },
    { label: "Data Analysis", slug: "data-analysis", custom: false },
    { label: "Graphic Design", slug: "graphic-design", custom: false },
    { label: "Public Speaking", slug: "public-speaking", custom: false },
    { label: "Biology", slug: "biology", custom: false },
    { label: "Machine Learning", slug: "machine-learning", custom: false },
];

type props = ControllerRenderProps<{
    title: string;
    description: string;
    skills: {
        label: string;
        slug: string;
        custom: boolean;
    }[];
    visibility: "public" | "private";
    member_goal: number;
}, "skills">

export function SkillsCombobox({ field } : { field: props }) {
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={`outline`}
                    role="combobox"
                    aria-expanded={open}
                    className={`w-full justify-between`}  
                >
                    Select skills that are required...
                    <ChevronsUpDownIcon className={`ml-2 h-4 w-4 shrink-0 opacity-50`} />
                </Button>
            </PopoverTrigger>
            <PopoverContent className={`w-full p-0`}>
                <Command>
                    <CommandInput placeholder="Search skills..." />
                    <CommandList>
                        <CommandEmpty>No Skills Found</CommandEmpty>
                        <CommandGroup>
                            {tempSkills.map((skill, index) => {
                                const selectedSkills = Array.isArray(field.value) ? field.value : [];
                                const isSelected = selectedSkills.some((val: any) => val.slug === skill.slug);

                                return (
                                    <CommandItem
                                        key={index}
                                        value={skill.slug}
                                        onSelect={() => {
                                            const updated = isSelected
                                            ? selectedSkills.filter((val: any) => val.slug !== skill.slug)
                                            : [...selectedSkills, skill];

                                            field.onChange(updated);
                                        }}
                                    >
                                        <CheckIcon
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                isSelected ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {skill.label}
                                    </CommandItem>
                                )
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}