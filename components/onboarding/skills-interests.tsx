import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CheckIcon, ChevronsUpDownIcon, X } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { AnimateIcon } from "@/src/components/animate-ui/icons/icon";
import { Brush } from "@/src/components/animate-ui/icons/brush";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";

const TagSchema = z.object({
  label: z.string(),
  slug: z.string(),
  custom: z.boolean(),
});

const SkillsInterestsSchema = z.object({
  skills: z.array(TagSchema).min(1, "Please enter at least one skill.").max(20),
  interests: z
    .array(TagSchema)
    .min(1, "Please enter at least one interest.")
    .max(20),
});

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

export default function SkillsInterests({
  setStep,
  setBigForm,
  bigForm,
}: {
  setStep: (step: number) => void;
  setBigForm: (bigForm: boolean) => void;
  bigForm: any;
}) {
  const [skillsOpen, setSkillsOpen] = useState(false);
  const [interestsOpen, setInterestsOpen] = useState(false);

  const form = useForm<z.infer<typeof SkillsInterestsSchema>>({
    resolver: zodResolver(SkillsInterestsSchema),
    defaultValues: {
      skills: [],
      interests: [],
    },
  });

  useEffect(() => {
    if (bigForm.skills && bigForm.interests) {
      form.reset({
        skills: bigForm.skills,
        interests: bigForm.interests,
      });
    }
  }, [bigForm.skills, bigForm.interests]);

  const onSubmit = (values: z.infer<typeof SkillsInterestsSchema>) => {
    setBigForm({
      ...bigForm,
      skills: values.skills,
      interests: values.interests,
    });
    setStep(3);
  };

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
                        <ChevronsUpDownIcon
                          className={`ml-2 h-4 w-4 shrink-0 opacity-50`}
                        />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className={`w-full p-0`}>
                      <Command>
                        <CommandInput placeholder="Search skills" />
                        <CommandList>
                          <CommandEmpty>No skill found.</CommandEmpty>
                          <CommandGroup>
                            {tempSkills.map((skill, index) => {
                              const selectedSkills = Array.isArray(field.value)
                                ? field.value
                                : [];
                              const isSelected = selectedSkills.some(
                                (val) => val.slug === skill.slug,
                              );

                              return (
                                <CommandItem
                                  key={index}
                                  value={skill.slug}
                                  onSelect={() => {
                                    const updated = isSelected
                                      ? selectedSkills.filter(
                                          (val) => val.slug !== skill.slug,
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
                </FormControl>
                <FormDescription
                  className={`flex flex-wrap items-center gap-2`}
                >
                  {form.getValues().skills.map((skill, index) => {
                    return (
                      <Badge
                        onClick={() => {
                          const currentSkills = form.getValues().skills;
                          const updatedSkills = currentSkills.filter(
                            (_, i) => i !== index,
                          );
                          form.setValue("skills", updatedSkills);
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
                        <ChevronsUpDownIcon
                          className={`ml-2 h-4 w-4 shrink-0 opacity-50`}
                        />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className={`w-full p-0`}>
                      <Command>
                        <CommandInput placeholder="Search interests" />
                        <CommandList>
                          <CommandEmpty>No interest found.</CommandEmpty>
                          <CommandGroup>
                            {tempSkills.map((interest, index) => {
                              const selectedInterest = Array.isArray(
                                field.value,
                              )
                                ? field.value
                                : [];
                              const isSelected = selectedInterest.some(
                                (val) => val.slug === interest.slug,
                              );

                              return (
                                <CommandItem
                                  key={index}
                                  value={interest.slug}
                                  onSelect={() => {
                                    const updated = isSelected
                                      ? selectedInterest.filter(
                                          (val) => val.slug !== interest.slug,
                                        )
                                      : [...selectedInterest, interest];

                                    field.onChange(updated);
                                  }}
                                >
                                  <CheckIcon
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      isSelected ? "opacity-100" : "opacity-0",
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
                <FormDescription
                  className={`flex flex-wrap items-center gap-2`}
                >
                  {form.getValues().interests.map((interest, index) => {
                    return (
                      <Badge
                        onClick={() => {
                          const currentInterests = form.getValues().interests;
                          const updatedInterests = currentInterests.filter(
                            (_, i) => i !== index,
                          );
                          form.setValue("skills", updatedInterests);
                        }}
                        className={`cursor-pointer text-xs opacity-80 hover:opacity-60 transition-all flex items-center gap-1.5`}
                        key={index}
                      >
                        {interest.label}
                        <X />
                      </Badge>
                    );
                  })}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className={`flex items-center gap-3.5 mt-20 w-full`}>
            <Button
              onClick={(e) => {
                e.preventDefault();
                setBigForm({
                  ...bigForm,
                  skills: form.getValues().skills,
                  interests: form.getValues().interests,
                });
                setStep(1);
              }}
              variant={`outline`}
              className={`cursor-pointer`}
              size={`lg`}
            >
              Back
            </Button>
            <Button
              type={`submit`}
              variant={`default`}
              className={`cursor-pointer`}
              size={`lg`}
            >
              Next
            </Button>
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
  );
}
