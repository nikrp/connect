import z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useEffect } from "react";
import { AvatarDropzone } from "../avatar-dropzone";
import { toast } from "sonner";
import { Toaster } from "../ui/sonner";

const WelcomeSchema = z.object({
    name: z.string().min(1, "Name is required").max(50, "Name has to be under 50 characters"),
    profile_photo: z.instanceof(File).refine(file => file.type.startsWith("image/"), "Only image files are accepted.")
        .refine(file => file.size <= 5 * 1024 * 1024, "File size must be under 5MB.")
        .optional()
})

export default function Welcome({ name, setStep, setBigForm, bigForm }: { name: string, setStep: (step: number) => void, setBigForm: (bigForm: boolean) => void, bigForm: any }) {
    const form = useForm<z.infer<typeof WelcomeSchema>>({
        resolver: zodResolver(WelcomeSchema),
        defaultValues: {
            name: name,
            profile_photo: undefined,
        },
    });

    useEffect(() => {
        if (bigForm.name) {
            form.reset({
                name: bigForm.name,
                profile_photo: bigForm.profile_photo
            })
        }
    }, [bigForm.name, bigForm.profile_photo]);

    useEffect(() => {
        if (!bigForm.name) {
            form.setValue("name", name)
        }
    }, [name]);

    const onsubmit = (values: z.infer<typeof WelcomeSchema>) => {
        setStep(1);
        toast("File", {
            description: values.profile_photo?.name
        })
        setBigForm({ ...bigForm, ...values })
    }

    return (
        <div className={`w-11/12 max-w-md`}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onsubmit)} className={`space-y-6`}>
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Name" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="profile_photo"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Profile Photo</FormLabel>
                                <FormControl>
                                    <AvatarDropzone value={field.value} onChange={field.onChange} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type={`submit`} variant={`default`} className={`cursor-pointer mt-20`} size={`lg`}>Next</Button>
                </form>
            </Form>
            <Toaster richColors position={`top-center`} />
        </div>
    );
}