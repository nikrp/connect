"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Toaster } from "./ui/sonner";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Router } from "lucide-react";
import { useRouter } from "next/navigation";

const RegisterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email"),
  password: z.string().min(1, "Password is required").min(8, "Password must have at least 8 characters"),
  terms: z.boolean().refine((val) => val, {
    message: "You must accept the terms and conditions",
    path: ["terms"],
  })
})

export function RegisterForm() {
  const supabase = createClient();
  const router = useRouter();
  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      terms: false,
    }
  });

  function onSubmit(values: z.infer<typeof RegisterSchema>) {
    const promise = () => new Promise(async (resolve, reject) => {
      await supabase.auth.signOut();
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            name: values.name,
          },
        },
      });

      if (error) {
        reject(error.message);
      } else {
        router.push(`/onboarding?name=${values.name}`);
        resolve(data);
      }
    });

    toast.promise(promise, {
      loading: "Creating account...",
      success: "Account created successfully!",
      error: "Something went wrong! If this issue persists please contact support.",
    });
  }

  function registerWithGoogle() {
    const promise = () => new Promise((resolve, reject) => {
      supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `http://localhost:3000/onboarding`
        }
      }).then(({ data, error }) => {
        if (error) {
          reject(error.message);
        } else {
          resolve(data);
        }
      });
    });

    promise().then(result => {
      console.log(result);
      toast.success("Account created successfully!");
    }).catch(error => {
      console.error(error);
      toast.error("Something went wrong! If this issue persists please contact support.");
    });
  }

  return (
    <div>
      <Button onClick={registerWithGoogle} variant={`outline`} className={`cursor-pointer w-full`}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path
            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
            fill="currentColor"
          />
        </svg>
        Register with Google
      </Button>
      <div className={`flex items-center gap-2.5 my-3.5`}>
        <div className={`w-1/4 h-px bg-border`} />
        <span className={`text-base text-muted-foreground font-mono uppercase`}>or continue with</span>
        <div className={`w-1/4 h-px bg-border`} />
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className={`space-y-6`}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your name..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="someone@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type={`password`} placeholder="Enter your password..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem className={`flex items-ceneter gap-2.5`}>
                <FormControl className={`cursor-pointer`}>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      return field.onChange(checked);
                    }}
                  />
                </FormControl>
                <FormLabel className={`flex items-center gap-1 font-normal`}>I accept the <span><a href={`#`} className={`cursor-pointer ${form.formState.errors.terms === undefined && `text-primary brightness-150`} underline underline-offset-2 hover:underline-offset-4 transition-all`}>terms and conditions</a></span></FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type={`submit`} className={`w-full cursor-pointer`}>Register</Button>
        </form>
      </Form>
      <Toaster richColors position={`top-right`} />
    </div>
  )
}
