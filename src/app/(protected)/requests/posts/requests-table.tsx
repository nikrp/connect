"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  ColumnFiltersState,
  getPaginationRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckIcon,
  ChevronsUpDownIcon,
  PlusSquareIcon,
  ReceiptRussianRubleIcon,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ControllerRenderProps, useForm } from "react-hook-form";
import z from "zod";
import { createPostSchema } from "./create-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Toaster } from "@/components/ui/sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState, useMemo } from "react";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { CommandEmpty } from "cmdk";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import { User } from "@supabase/supabase-js";
import { Profile } from "../../../../types/profile";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface RequestsTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  refresh: () => void;
  currentUserId: string | null;
}

export function RequestsTable<TData, TValue>({
  columns,
  data,
  refresh,
  currentUserId,
}: RequestsTableProps<TData, TValue>) {
  const supabase = createClient();
  const [dialougeOpen, setDialougeOpen] = useState(false);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [activeTab, setActiveTab] = useState<"all" | "created" | "joined">(
    "all",
  );
  const {
    user,
    setUser,
    profile,
    setProfile,
  }: {
    user: User | null;
    setUser: (user: User | null) => void;
    profile: Profile | null;
    setProfile: (profile: Profile | null) => void;
  } = useUser();
  const createForm = useForm<z.infer<typeof createPostSchema>>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: "",
      description: "",
      skills: [],
      visibility: "public",
      member_goal: 1,
    },
  });

  // Filter posts based on active tab - memoized to prevent infinite re-renders
  const filteredData = useMemo(() => {
    return (data as any[]).filter((post: any) => {
      if (activeTab === "all") return true;
      if (activeTab === "created") return post.creator_id === currentUserId;
      if (activeTab === "joined") {
        // Since the RPC already returns only collabs where user is involved,
        // we just need to check if they're NOT the creator
        return post.creator_id !== currentUserId;
      }
      return true;
    });
  }, [data, activeTab, currentUserId]);

  const createdCount = useMemo(
    () =>
      (data as any[]).filter((p: any) => p.creator_id === currentUserId).length,
    [data, currentUserId],
  );
  const joinedCount = useMemo(
    () =>
      (data as any[]).filter((p: any) => p.creator_id !== currentUserId).length,
    [data, currentUserId],
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      columnFilters,
    },
  });

  const onSubmit = async (values: z.infer<typeof createPostSchema>) => {
    // Insert to collab_requests table.
    const { data, error } = await supabase.rpc(
      "create_collab_request_with_chat",
      {
        _title: values.title,
        _description: values.description,
        _skills: values.skills,
        _visibility: values.visibility,
        _member_goal: values.member_goal,
      },
    );

    if (error) {
      toast.error("Error creating collab request:", {
        description: error.message,
      });
      return;
    }

    toast.success(`Collab Request Created Successfully!`);
    createForm.reset();
    setDialougeOpen(false);
    refresh();
  };

  return (
    <div>
      <div className={`flex items-center py-4 justify-between`}>
        <div className={`flex items-center gap-3`}>
          <Input
            placeholder="Filter titles..."
            value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("title")?.setFilterValue(event.target.value)
            }
            className={`w-64 md:w-96`}
          />
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "all" | "created" | "joined")
            }
          >
            <TabsList>
              <TabsTrigger
                className={`cursor-pointer hover:bg-muted`}
                value="all"
              >
                All ({data.length})
              </TabsTrigger>
              <TabsTrigger
                className={`cursor-pointer hover:text-foreground`}
                value="created"
              >
                Created ({createdCount})
              </TabsTrigger>
              <TabsTrigger
                className={`cursor-pointer hover:text-foreground`}
                value="joined"
              >
                Joined ({joinedCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div>
          <Dialog onOpenChange={setDialougeOpen} open={dialougeOpen}>
            <DialogTrigger asChild>
              <Button
                variant={`default`}
                className={`cursor-pointer flex items-center gap-1.5`}
                size={`sm`}
              >
                <PlusSquareIcon />
                Create Post
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a Request</DialogTitle>
              </DialogHeader>
              <Form {...createForm}>
                <form
                  className={`space-y-6`}
                  onSubmit={createForm.handleSubmit(onSubmit)}
                >
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
                          <Textarea
                            {...field}
                            rows={3}
                            placeholder="Enter a description (250 characters)"
                          />
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
                        <FormDescription
                          className={`flex items-center flex-wrap gap-2.5`}
                        >
                          {createForm.getValues().skills.map((skill, index) => {
                            return (
                              <Badge
                                onClick={() => {
                                  const currentSkills =
                                    createForm.getValues().skills;
                                  const updatedSkills = currentSkills.filter(
                                    (_, i) => i !== index,
                                  );
                                  createForm.setValue("skills", updatedSkills);
                                }}
                                className={`cursor-pointer opacity-80 hover:opacity-60 transition-all flex items-center gap-1.5`}
                                key={index}
                              >
                                {skill.label}
                                <X />
                              </Badge>
                            );
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
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
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
                          <Input
                            type={`number`}
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
                            min={1}
                            defaultValue={1}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div
                    className={`w-full flex items-center gap-2.5 justify-end`}
                  >
                    <Button
                      onClick={() => createForm.reset()}
                      variant={`outline`}
                      type={`button`}
                      className={`cursor-pointer`}
                    >
                      Clear
                    </Button>
                    <Button
                      variant={`default`}
                      type={`submit`}
                      className={`cursor-pointer`}
                    >
                      Create
                    </Button>
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
                            header.getContext(),
                          )}
                    </TableHead>
                  );
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between px-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} Result(s) on this Tab
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium whitespace-nowrap">
              Rows per page
            </p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => table.previousPage()}
                  className={cn(
                    "cursor-pointer",
                    !table.getCanPreviousPage() &&
                      "pointer-events-none opacity-50",
                  )}
                />
              </PaginationItem>

              {/* First page */}
              {table.getState().pagination.pageIndex > 1 && (
                <PaginationItem>
                  <PaginationLink
                    onClick={() => table.setPageIndex(0)}
                    className="cursor-pointer"
                  >
                    1
                  </PaginationLink>
                </PaginationItem>
              )}

              {/* Ellipsis before current page */}
              {table.getState().pagination.pageIndex > 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {/* Previous page */}
              {table.getState().pagination.pageIndex > 0 && (
                <PaginationItem>
                  <PaginationLink
                    onClick={() => table.previousPage()}
                    className="cursor-pointer"
                  >
                    {table.getState().pagination.pageIndex}
                  </PaginationLink>
                </PaginationItem>
              )}

              {/* Current page */}
              <PaginationItem>
                <PaginationLink isActive className="cursor-pointer">
                  {table.getState().pagination.pageIndex + 1}
                </PaginationLink>
              </PaginationItem>

              {/* Next page */}
              {table.getState().pagination.pageIndex <
                table.getPageCount() - 1 && (
                <PaginationItem>
                  <PaginationLink
                    onClick={() => table.nextPage()}
                    className="cursor-pointer"
                  >
                    {table.getState().pagination.pageIndex + 2}
                  </PaginationLink>
                </PaginationItem>
              )}

              {/* Ellipsis after current page */}
              {table.getState().pagination.pageIndex <
                table.getPageCount() - 3 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {/* Last page */}
              {table.getState().pagination.pageIndex <
                table.getPageCount() - 2 && (
                <PaginationItem>
                  <PaginationLink
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    className="cursor-pointer"
                  >
                    {table.getPageCount()}
                  </PaginationLink>
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => table.nextPage()}
                  className={cn(
                    "cursor-pointer",
                    !table.getCanNextPage() && "pointer-events-none opacity-50",
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
      <Toaster richColors position={`top-right`} />
    </div>
  );
}

const tempSkills = [
  // Programming Languages
  { label: "Python", slug: "python", custom: false },
  { label: "JavaScript", slug: "javascript", custom: false },
  { label: "Java", slug: "java", custom: false },
  { label: "C++", slug: "cpp", custom: false },
  { label: "C#", slug: "csharp", custom: false },
  { label: "TypeScript", slug: "typescript", custom: false },
  { label: "Ruby", slug: "ruby", custom: false },
  { label: "Go", slug: "go", custom: false },
  { label: "Rust", slug: "rust", custom: false },
  { label: "Swift", slug: "swift", custom: false },
  { label: "Kotlin", slug: "kotlin", custom: false },
  { label: "PHP", slug: "php", custom: false },
  { label: "R", slug: "r", custom: false },
  { label: "MATLAB", slug: "matlab", custom: false },
  { label: "SQL", slug: "sql", custom: false },

  // Web & Mobile Development
  { label: "Web Development", slug: "web-development", custom: false },
  { label: "Mobile Development", slug: "mobile-development", custom: false },
  {
    label: "Frontend Development",
    slug: "frontend-development",
    custom: false,
  },
  { label: "Backend Development", slug: "backend-development", custom: false },
  {
    label: "Full Stack Development",
    slug: "full-stack-development",
    custom: false,
  },
  { label: "React", slug: "react", custom: false },
  { label: "Angular", slug: "angular", custom: false },
  { label: "Vue.js", slug: "vuejs", custom: false },
  { label: "Node.js", slug: "nodejs", custom: false },
  { label: "UI/UX Design", slug: "ui-ux-design", custom: false },

  // Data Science & AI
  { label: "Machine Learning", slug: "machine-learning", custom: false },
  {
    label: "Artificial Intelligence",
    slug: "artificial-intelligence",
    custom: false,
  },
  { label: "Data Science", slug: "data-science", custom: false },
  { label: "Data Analysis", slug: "data-analysis", custom: false },
  { label: "Deep Learning", slug: "deep-learning", custom: false },
  { label: "Neural Networks", slug: "neural-networks", custom: false },
  {
    label: "Natural Language Processing",
    slug: "natural-language-processing",
    custom: false,
  },
  { label: "Computer Vision", slug: "computer-vision", custom: false },
  { label: "Big Data", slug: "big-data", custom: false },
  { label: "Data Visualization", slug: "data-visualization", custom: false },

  // Computer Science
  { label: "Computer Science", slug: "computer-science", custom: false },
  { label: "Algorithms", slug: "algorithms", custom: false },
  { label: "Data Structures", slug: "data-structures", custom: false },
  { label: "Cybersecurity", slug: "cybersecurity", custom: false },
  { label: "Networking", slug: "networking", custom: false },
  { label: "Database", slug: "database", custom: false },
  { label: "Cloud Computing", slug: "cloud-computing", custom: false },
  { label: "DevOps", slug: "devops", custom: false },
  { label: "Blockchain", slug: "blockchain", custom: false },
  { label: "Quantum Computing", slug: "quantum-computing", custom: false },

  // Engineering
  { label: "Engineering", slug: "engineering", custom: false },
  { label: "Robotics", slug: "robotics", custom: false },
  {
    label: "Mechanical Engineering",
    slug: "mechanical-engineering",
    custom: false,
  },
  {
    label: "Electrical Engineering",
    slug: "electrical-engineering",
    custom: false,
  },
  { label: "Civil Engineering", slug: "civil-engineering", custom: false },
  {
    label: "Chemical Engineering",
    slug: "chemical-engineering",
    custom: false,
  },
  {
    label: "Aerospace Engineering",
    slug: "aerospace-engineering",
    custom: false,
  },
  {
    label: "Biomedical Engineering",
    slug: "biomedical-engineering",
    custom: false,
  },
  { label: "Electronics", slug: "electronics", custom: false },
  { label: "3D Printing", slug: "3d-printing", custom: false },

  // Sciences
  { label: "Biology", slug: "biology", custom: false },
  { label: "Chemistry", slug: "chemistry", custom: false },
  { label: "Physics", slug: "physics", custom: false },
  { label: "Biochemistry", slug: "biochemistry", custom: false },
  { label: "Bioinformatics", slug: "bioinformatics", custom: false },
  { label: "Neuroscience", slug: "neuroscience", custom: false },
  {
    label: "Environmental Science",
    slug: "environmental-science",
    custom: false,
  },
  { label: "Genetics", slug: "genetics", custom: false },
  { label: "Astronomy", slug: "astronomy", custom: false },
  { label: "Geology", slug: "geology", custom: false },
  { label: "Marine Biology", slug: "marine-biology", custom: false },
  { label: "Microbiology", slug: "microbiology", custom: false },

  // Mathematics
  { label: "Mathematics", slug: "math", custom: false },
  { label: "Statistics", slug: "statistics", custom: false },
  { label: "Calculus", slug: "calculus", custom: false },
  { label: "Linear Algebra", slug: "linear-algebra", custom: false },
  { label: "Discrete Math", slug: "discrete-math", custom: false },
  { label: "Game Theory", slug: "game-theory", custom: false },

  // Arts & Design
  { label: "Graphic Design", slug: "graphic-design", custom: false },
  { label: "Digital Art", slug: "digital-art", custom: false },
  { label: "Photography", slug: "photography", custom: false },
  { label: "Video Editing", slug: "video-editing", custom: false },
  { label: "Animation", slug: "animation", custom: false },
  { label: "Music Production", slug: "music-production", custom: false },
  { label: "Drawing", slug: "drawing", custom: false },
  { label: "Painting", slug: "painting", custom: false },
  { label: "Sculpture", slug: "sculpture", custom: false },
  { label: "Creative Writing", slug: "creative-writing", custom: false },
  { label: "Game Development", slug: "game-development", custom: false },

  // Business & Finance
  { label: "Entrepreneurship", slug: "entrepreneurship", custom: false },
  { label: "Marketing", slug: "marketing", custom: false },
  { label: "Finance", slug: "finance", custom: false },
  { label: "Accounting", slug: "accounting", custom: false },
  { label: "Economics", slug: "economics", custom: false },
  { label: "Business Strategy", slug: "business-strategy", custom: false },
  { label: "Project Management", slug: "project-management", custom: false },
  { label: "Leadership", slug: "leadership", custom: false },

  // Communication & Social
  { label: "Public Speaking", slug: "public-speaking", custom: false },
  { label: "Debate", slug: "debate", custom: false },
  { label: "Writing", slug: "writing", custom: false },
  { label: "Journalism", slug: "journalism", custom: false },
  { label: "Social Media", slug: "social-media", custom: false },
  { label: "Content Creation", slug: "content-creation", custom: false },
  { label: "Podcasting", slug: "podcasting", custom: false },
  { label: "Teaching", slug: "teaching", custom: false },
  { label: "Mentoring", slug: "mentoring", custom: false },

  // Social Sciences
  { label: "Psychology", slug: "psychology", custom: false },
  { label: "Sociology", slug: "sociology", custom: false },
  { label: "Political Science", slug: "political-science", custom: false },
  { label: "History", slug: "history", custom: false },
  { label: "Philosophy", slug: "philosophy", custom: false },
  { label: "Anthropology", slug: "anthropology", custom: false },

  // Languages
  { label: "Spanish", slug: "spanish", custom: false },
  { label: "French", slug: "french", custom: false },
  { label: "German", slug: "german", custom: false },
  { label: "Chinese", slug: "chinese", custom: false },
  { label: "Japanese", slug: "japanese", custom: false },
  { label: "Arabic", slug: "arabic", custom: false },
  { label: "Sign Language", slug: "sign-language", custom: false },

  // Health & Medicine
  { label: "Medicine", slug: "medicine", custom: false },
  { label: "Nursing", slug: "nursing", custom: false },
  { label: "Public Health", slug: "public-health", custom: false },
  { label: "Nutrition", slug: "nutrition", custom: false },
  { label: "Mental Health", slug: "mental-health", custom: false },
  { label: "Pharmacy", slug: "pharmacy", custom: false },

  // Environmental & Sustainability
  { label: "Climate Change", slug: "climate-change", custom: false },
  { label: "Sustainability", slug: "sustainability", custom: false },
  { label: "Renewable Energy", slug: "renewable-energy", custom: false },
  { label: "Conservation", slug: "conservation", custom: false },
  { label: "Urban Planning", slug: "urban-planning", custom: false },

  // Sports & Recreation
  { label: "Sports", slug: "sports", custom: false },
  { label: "Fitness", slug: "fitness", custom: false },
  { label: "Yoga", slug: "yoga", custom: false },
  { label: "Dance", slug: "dance", custom: false },
  { label: "Martial Arts", slug: "martial-arts", custom: false },
  { label: "Swimming", slug: "swimming", custom: false },
  { label: "Running", slug: "running", custom: false },

  // Other Skills
  { label: "Cooking", slug: "cooking", custom: false },
  { label: "Gardening", slug: "gardening", custom: false },
  { label: "Woodworking", slug: "woodworking", custom: false },
  { label: "Sewing", slug: "sewing", custom: false },
  { label: "Fashion Design", slug: "fashion-design", custom: false },
  { label: "Interior Design", slug: "interior-design", custom: false },
  { label: "Architecture", slug: "architecture", custom: false },
  { label: "Law", slug: "law", custom: false },
  { label: "Ethics", slug: "ethics", custom: false },
  { label: "Volunteering", slug: "volunteering", custom: false },
  { label: "Community Service", slug: "community-service", custom: false },
  { label: "Event Planning", slug: "event-planning", custom: false },
  { label: "Research", slug: "research", custom: false },
  {
    label: "Science Communication",
    slug: "science-communication",
    custom: false,
  },
  { label: "Fun", slug: "fun", custom: false },
];

type props = ControllerRenderProps<
  {
    title: string;
    description: string;
    skills: {
      label: string;
      slug: string;
      custom: boolean;
    }[];
    visibility: "public" | "private";
    member_goal: number;
  },
  "skills"
>;

export function SkillsCombobox({ field }: { field: props }) {
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
                const selectedSkills = Array.isArray(field.value)
                  ? field.value
                  : [];
                const isSelected = selectedSkills.some(
                  (val: any) => val.slug === skill.slug,
                );

                return (
                  <CommandItem
                    key={index}
                    value={skill.slug}
                    onSelect={() => {
                      const updated = isSelected
                        ? selectedSkills.filter(
                            (val: any) => val.slug !== skill.slug,
                          )
                        : [...selectedSkills, skill];

                      field.onChange(updated);
                    }}
                  >
                    <CheckIcon
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {skill.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
