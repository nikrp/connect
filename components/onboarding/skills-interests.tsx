import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CheckIcon, ChevronsUpDownIcon, X } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { AnimateIcon } from "@/src/components/animate-ui/icons/icon";
import { Brush } from "@/src/components/animate-ui/icons/brush";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";

const TagSchema = z.object({
    label: z.string(),
    slug: z.string(),
    custom: z.boolean(),
})

const SkillsInterestsSchema = z.object({
    skills: z.array(TagSchema).min(1, "Please enter at least one skill.").max(20),
    interests: z.array(TagSchema).min(1, "Please enter at least one interest.").max(20),
})

const tempSkills = [
    { label: "Python", slug: "python", custom: false },
    { label: "Web Development", slug: "web-development", custom: false },
    { label: "Data Analysis", slug: "data-analysis", custom: false },
    { label: "Graphic Design", slug: "graphic-design", custom: false },
    { label: "Public Speaking", slug: "public-speaking", custom: false },
    { label: "Biology", slug: "biology", custom: false },
    { label: "Machine Learning", slug: "machine-learning", custom: false },
];

export default function SkillsInterests({ setStep, setBigForm, bigForm }: { setStep: (step: number) => void, setBigForm: (bigForm: boolean) => void, bigForm: any }) {
    const [skillsOpen, setSkillsOpen] = useState(false);
    const [interestsOpen, setInterestsOpen] = useState(false);
    
    const form = useForm<z.infer<typeof SkillsInterestsSchema>>({
        resolver: zodResolver(SkillsInterestsSchema),
        defaultValues: {
            skills: [],
            interests: [],
        },
    })

    useEffect(() => {
        if (bigForm.skills && bigForm.interests) {
            form.reset({
                skills: bigForm.skills,
                interests: bigForm.interests
            })
        }
    }, [bigForm.skills, bigForm.interests]);

    const onSubmit = (values: z.infer<typeof SkillsInterestsSchema>) => {
        setBigForm({
            ...bigForm,
            skills: values.skills,
            interests: values.interests
        })
        setStep(3)
    }
    
    return (
        <div className={`w-11/12 max-w-md`}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className={`space-y-6`}>
                    <FormField
                        control={form.control}
                        name="skills"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Skills</FormLabel>
                                <FormControl>
                                    <Popover open={skillsOpen} onOpenChange={setSkillsOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={`outline`}
                                                role="combobox"
                                                aria-expanded={skillsOpen}
                                                className={`w-full justify-between`}  
                                            >
                                                Select skills...
                                                <ChevronsUpDownIcon className={`ml-2 h-4 w-4 shrink-0 opacity-50`} />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className={`w-full p-0`}>
                                            <Command>
                                                <CommandInput placeholder="Search skills" />
                                                <CommandList>
                                                    <CommandEmpty>No skill found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {tempSkills.map((skill, index) => {
                                                            const selectedSkills = Array.isArray(field.value) ? field.value : [];
                                                            const isSelected = selectedSkills.some(val => val.slug === skill.slug);

                                                            return (
                                                                <CommandItem
                                                                key={index}
                                                                value={skill.slug}
                                                                onSelect={() => {
                                                                    const updated = isSelected
                                                                    ? selectedSkills.filter(val => val.slug !== skill.slug)
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
                                                            );
                                                        })}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </FormControl>
                                <FormDescription className={`flex flex-wrap items-center gap-2`}>
                                    {form.getValues().skills.map((skill, index) => {
                                        return (
                                            <Badge 
                                                onClick={() => {
                                                    const currentSkills = form.getValues().skills;
                                                    const updatedSkills = currentSkills.filter((_, i) => i !== index);
                                                    form.setValue('skills', updatedSkills);
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
                        control={form.control}
                        name="interests"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Interests</FormLabel>
                                <FormControl>
                                    <Popover open={interestsOpen} onOpenChange={setInterestsOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={`outline`}
                                                role="combobox"
                                                aria-expanded={interestsOpen}
                                                className={`w-full justify-between`}  
                                            >
                                                Select interests...
                                                <ChevronsUpDownIcon className={`ml-2 h-4 w-4 shrink-0 opacity-50`} />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className={`w-full p-0`}>
                                            <Command>
                                                <CommandInput placeholder="Search interests" />
                                                <CommandList>
                                                    <CommandEmpty>No interest found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {tempSkills.map((interest, index) => {
                                                            const selectedInterest = Array.isArray(field.value) ? field.value : [];
                                                            const isSelected = selectedInterest.some(val => val.slug === interest.slug);

                                                            return (
                                                                <CommandItem
                                                                    key={index}
                                                                    value={interest.slug}
                                                                    onSelect={() => {
                                                                        const updated = isSelected
                                                                        ? selectedInterest.filter(val => val.slug !== interest.slug)
                                                                        : [...selectedInterest, interest];

                                                                        field.onChange(updated);
                                                                    }}
                                                                >
                                                                    <CheckIcon
                                                                        className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        isSelected ? "opacity-100" : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {interest.label}
                                                                </CommandItem>
                                                            );
                                                        })}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </FormControl>
                                <FormDescription className={`flex flex-wrap items-center gap-2`}>
                                    {form.getValues().interests.map((interest, index) => {
                                        return (
                                            <Badge 
                                                onClick={() => {
                                                    const currentInterests = form.getValues().interests;
                                                    const updatedInterests = currentInterests.filter((_, i) => i !== index);
                                                    form.setValue('skills', updatedInterests);
                                                }} 
                                                className={`cursor-pointer text-xs opacity-80 hover:opacity-60 transition-all flex items-center gap-1.5`} 
                                                key={index}
                                            >
                                                {interest.label}<X />
                                            </Badge>
                                        )
                                    })}
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className={`flex items-center gap-3.5 mt-20 w-full`}>
                        <Button onClick={(e) => {e.preventDefault(); setBigForm({ ...bigForm, skills: form.getValues().skills, interests: form.getValues().interests }); setStep(1)}} variant={`outline`} className={`cursor-pointer`} size={`lg`}>Back</Button>
                        <Button type={`submit`} variant={`default`} className={`cursor-pointer`} size={`lg`}>Next</Button>
                        {/* <Dialog>
                            <DialogTrigger className={`ml-auto`}>
                                <AnimateIcon animateOnHover><Button type={`button`} variant={`secondary`} className={`cursor-pointer flex items-center gap-2.5 ml-auto`} size={`lg`}>Ask ConnectBot <Brush /></Button></AnimateIcon>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>ConnectBot</DialogTitle>
                                    <DialogDescription>Lets find out your skills and interests.</DialogDescription>
                                </DialogHeader>
                                <DialogFooter>

                                </DialogFooter>
                            </DialogContent>
                        </Dialog> */}
                    </div>
                </form>
            </Form>
        </div>
    )
}