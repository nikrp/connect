import z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

const ContactSchema = z.object({
    emails: z.array(z.string()).optional(),
    phones: z.array(z.string()).optional(),
    linkedin: z.string().optional(),
    twitter: z.string().optional(),
});

export default function Contact({ setStep, setBigForm, bigForm }: { setStep: (step: number | ((s: number) => number)) => void, setBigForm: (bigForm: any) => void, bigForm: any }) {
    const form = useForm<z.infer<typeof ContactSchema>>({
        resolver: zodResolver(ContactSchema),
        defaultValues: {
            emails: (bigForm?.contact?.emails ?? []),
            phones: (bigForm?.contact?.phones ?? []),
            linkedin: bigForm?.contact?.socials?.linkedin ?? '',
            twitter: bigForm?.contact?.socials?.twitter ?? '',
        }
    });

    const [emailsText, setEmailsText] = useState<string>((bigForm?.contact?.emails ?? []).join(', '));
    const [phonesText, setPhonesText] = useState<string>((bigForm?.contact?.phones ?? []).join(', '));

    useEffect(() => {
        if (bigForm?.contact) {
            form.reset({
                emails: bigForm.contact.emails ?? [],
                phones: bigForm.contact.phones ?? [],
                linkedin: bigForm.contact.socials?.linkedin ?? '',
                twitter: bigForm.contact.socials?.twitter ?? '',
            });
            setEmailsText((bigForm.contact.emails ?? []).join(', '));
            setPhonesText((bigForm.contact.phones ?? []).join(', '));
        }
    }, [bigForm?.contact]);

    const onSubmit = (_values: z.infer<typeof ContactSchema>) => {
        // normalize from the text fields into contact shape
        const emails = String(emailsText || '').split(',').map(s => s.trim()).filter(Boolean);
        const phones = String(phonesText || '').split(',').map(s => s.trim()).filter(Boolean);
        const contact = {
            emails,
            phones,
            socials: { linkedin: form.getValues('linkedin') ?? null, twitter: form.getValues('twitter') ?? null }
        }
        setBigForm({ ...bigForm, contact });
        setStep(4);
    }

    return (
        <div className={`w-11/12 max-w-md`}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className={`space-y-6`}>
                    <FormField
                        control={form.control}
                        name="emails"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Emails (comma separated)</FormLabel>
                                <FormControl>
                                    <Input
                                        value={emailsText}
                                        onChange={(e) => setEmailsText(e.target.value)}
                                        onBlur={() => field.onChange(String(emailsText || '').split(',').map(s => s.trim()).filter(Boolean))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="phones"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone numbers (comma separated)</FormLabel>
                                <FormControl>
                                    <Input
                                        value={phonesText}
                                        onChange={(e) => setPhonesText(e.target.value)}
                                        onBlur={() => field.onChange(String(phonesText || '').split(',').map(s => s.trim()).filter(Boolean))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="linkedin"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>LinkedIn</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="https://linkedin.com/in/you" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="twitter"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Twitter</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="@handle" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className={`flex items-center gap-3.5 mt-8`}> 
                        <Button onClick={(e) => { e.preventDefault(); setStep(1) }} variant={`outline`} className={`cursor-pointer`} size={`lg`}>Back</Button>
                        <Button type={`submit`} variant={`default`} className={`cursor-pointer`} size={`lg`}>Next</Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}