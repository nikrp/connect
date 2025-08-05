"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
import { createClient } from "@/lib/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const ResetSchema = z.object({
    password: z.string().min(1, "Password is required"),
    confirmPassword: z.string().min(1, "Password is required"),
})

export default function ResetPassword() {
    const supabase = createClient();
    const router = useRouter();
    const form = useForm<z.infer<typeof ResetSchema>>({
        resolver: zodResolver(ResetSchema),
        defaultValues: {
            password: "",
            confirmPassword: ""
        }
    });

    const onSubmit = async (values: z.infer<typeof ResetSchema>) => {
        if (values.password !== values.confirmPassword) {
            form.setError("confirmPassword", {
                message: "Passwords do not match!"
            })
            return
        }

        const { data, error } = await supabase.auth.updateUser({
            password: values.password
        });

        if (error) {
            toast.error("Error updating password:", { 
                description: error.message
            });
        } else {
            toast.success("Successfully updated password! Don't forget it!");
            router.push("/requests");
            console.log(data);
        }
    }

    useEffect(() => {
        async function thing() {
            const newPassword: string | undefined = prompt("What would you like your new password to be?") || undefined;
            const { data, error } = await supabase.auth
                .updateUser({ password: newPassword })
            if (data) alert("Password updated successfully!")
            if (error) alert("There was an error updating your password.")
        }

        // thing()
        router.prefetch("/requests")
      }, [])

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <Card className="flex w-full max-w-sm flex-col gap-6 bg-card border border-border rounded-lg">
                <CardHeader>
                    <CardTitle>Reset Password</CardTitle>
                    <CardDescription>Enter your new password below.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className={`space-y-6`}>
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>New Password</FormLabel>
                                        <FormControl>
                                            <Input type={`password`} {...field} placeholder="Enter your new password" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl>
                                            <Input type={`password`} {...field} placeholder="Confirm your new password" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type={`submit`} className={`w-full cursor-pointer`}>Reset</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
            <Toaster richColors position={`top-right`} />
        </div>
    )
}