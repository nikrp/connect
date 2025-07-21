import z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { Select, SelectValue, SelectTrigger, SelectContent, SelectGroup, SelectLabel, SelectItem } from "../ui/select";
import { SchoolComboBox } from "../schools-combo";
import schools from "@/public/schools.json";
import { useEffect } from "react";

const BasicSchema = z.object({
    grade: z.enum(["9th", "10th", "11th", "12th", "Gap Year", "Other"]),
    school: z.string().min(1, "School is required."),
    pronouns: z.enum(["He/Him", "She/Her", "They/Them", "Other"]),
})

export default function Basic({ setStep, setBigForm, bigForm }: { setStep: (step: number) => void, setBigForm: (bigForm: boolean) => void, bigForm: any }) {
    const form = useForm<z.infer<typeof BasicSchema>>({
        resolver: zodResolver(BasicSchema),
        defaultValues: {
            grade: "9th",
            school: "",
            pronouns: "He/Him"
        },
    });

    useEffect(() => {
        if (bigForm.grade) {
            form.reset({
                grade: bigForm.grade,
                school: bigForm.school,
                pronouns: bigForm.pronouns
            })
        }
    }, [bigForm.grade, bigForm.school, bigForm.pronouns]);

    const onSubmit = (values: z.infer<typeof BasicSchema>) => {
        setStep(2);
        setBigForm({...bigForm, ...values })
    }
    
    return (
        <div className={`w-11/12 max-w-md`}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className={`space-y-6`}>
                    <FormField
                        control={form.control}
                        name="grade"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Grade Level</FormLabel>
                                <FormControl>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger className={`w-full`}>
                                            <SelectValue placeholder="Select a grade" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Grades</SelectLabel>
                                                <SelectItem value="9th">9th</SelectItem>
                                                <SelectItem value="10th">10th</SelectItem>
                                                <SelectItem value="11th">11th</SelectItem>
                                                <SelectItem value="12th">12th</SelectItem>
                                                <SelectItem value="Gap Year">Gap Year</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="school"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>School</FormLabel>
                                <FormControl>
                                    <SchoolComboBox
                                        value={field.value}
                                        onChange={field.onChange}
                                        schools={schools}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="pronouns"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Pronouns</FormLabel>
                                <FormControl>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger className={`w-full`}>
                                            <SelectValue placeholder="Select pronouns" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Pronouns</SelectLabel>
                                                <SelectItem value="He/Him">He/Him</SelectItem>
                                                <SelectItem value="She/Her">She/Her</SelectItem>
                                                <SelectItem value="They/Them">They/Them</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className={`flex items-center gap-3.5 mt-20`}>
                        <Button onClick={(e) => {e.preventDefault(); setStep(0)}} variant={`outline`} className={`cursor-pointer`} size={`lg`}>Back</Button>
                        <Button type={`submit`} variant={`default`} className={`cursor-pointer`} size={`lg`}>Next</Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}