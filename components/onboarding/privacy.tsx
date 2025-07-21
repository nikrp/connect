import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { createClient } from "@/lib/supabase/client";
import { Toaster } from "../ui/sonner";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";

const PrivacySchema = z.object({
    newsletter: z.boolean(),
    communityGuidlines: z.boolean().refine((val) => val === true, {
        message: "You must accept the community guidelines to continue.",
    })
});

export default function Privacy({ setStep, setBigForm, bigForm }: { setStep: (step: number) => void, setBigForm: (bigForm: boolean) => void, bigForm: any }) {
    const supabase = createClient();
    const router = useRouter();
    const [creating, setCreating] = useState(false);
    const form = useForm<z.infer<typeof PrivacySchema>>({
        resolver: zodResolver(PrivacySchema),
        defaultValues: {
            newsletter: false,
            communityGuidlines: false,
        }
    })

    useEffect(() => {
        if (bigForm.newsletter) {
            form.reset({
                newsletter: bigForm.newsletter,
                communityGuidlines: bigForm.communityGuidlines,
            });
        }
    }, [bigForm.newsletter, bigForm.communityGuidlines]);

    const onSubmit = async (values: z.infer<typeof PrivacySchema>) => {
        setCreating(true);
        router.prefetch("/requests")
        setBigForm({
            ...bigForm,
            ...values,
        });
        const { communityGuidlines, profile_photo, ...rest } = bigForm;
        
        let supabaseData = { ...rest, newsletter: values.newsletter };
        
        // Upload the profile_photo to supabase storage and and get the public URL for easy access photo.
        if (profile_photo instanceof File) {
            const user = await supabase.auth.getUser();
            await supabase.storage.from('profile-photos')
            const fileName = `${user.data.user?.id}/profile_photo`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('profile-photos')
                .upload(fileName, profile_photo);
                
            if (uploadError) {
                toast.error('Error uploading profile photo');
                return;
            }
            
            const { data: { publicUrl } } = supabase.storage
                .from('profile-photos')
                .getPublicUrl(uploadData.fullPath);
                
            supabaseData = {
                ...supabaseData,
                profile_photo: publicUrl
            };
        }

        const { data, error } = await supabase.from("profiles").upsert(supabaseData, { onConflict: "id" });
        
        if (error) {
            toast.error(error.message);
            setCreating(false);
        } else {
            toast.success("Successfully created your profile.")
            router.push("/requests")
            setCreating(false);
        }
    }
    
    return (
        <div className={`w-11/12 max-w-md`}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className={`space-y-6`}>
                    <FormField
                        control={form.control}
                        name={`newsletter`}
                        render={({ field }) => (
                            <FormItem>
                                <div className={`flex items-start gap-2`}>
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={(checked) => {
                                                return field.onChange(checked);
                                            }}
                                        />
                                    </FormControl>
                                    <FormLabel className={`flex items-center gap-1 font-normal`}>Subscribe to the newsletter and recieve updates and news about Connect.</FormLabel>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name={`communityGuidlines`}
                        render={({ field }) => (
                            <FormItem>
                                <div  className={`flex items-start gap-2`}>
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={(checked) => {
                                                return field.onChange(checked);
                                            }}
                                        />
                                    </FormControl>
                                    <FormLabel className={`flex items-center gap-1 font-normal`}>I accept the <a>community guidlines</a>.</FormLabel>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className={`flex items-center gap-3.5 mt-20`}>
                        <Button disabled={creating} onClick={(e) => {e.preventDefault(); setBigForm({ ...bigForm, ...form.getValues(), }); setStep(3)}} variant={`outline`} className={`cursor-pointer`} size={`lg`}>Back</Button>
                        <Button disabled={creating} type={`submit`} variant={`default`} className={`cursor-pointer flex items-center gap-1.5`} size={`lg`}><Loader className={`${creating ? `block` : `hidden`} animate-spin`} />Complete</Button>
                    </div>
                </form>
            </Form>
            <Toaster richColors position={`top-right`} />
        </div>
    )
}