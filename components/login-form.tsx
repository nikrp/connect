"use client"

import { createClient } from "@/lib/supabase/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Toaster } from "./ui/sonner"
import { toast } from "sonner"
import { useEffect } from "react"

const LoginSchema = z.object({
  email: z.email().min(1, "Password is required"),
  password: z.string().min(1, "Password is required")
})

export function LoginForm() {
  const supabase = createClient()
  const router = useRouter();
  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })
    if (error) {
      console.error(error)
      toast.error("Error signing in: " + error.message)
      form.setError(`root`, {
        message: error.message
      });
    } else {
      router.push("/requests")
    }
  }

  function signInWithGoogle() {
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/requests`
      }
    }).then(({ data, error }) => {
      if (error) {
        console.error(error);
        toast.error("Something went wrong! If this issue persists please contact support.");
      } else {        
        toast.success("Signed in successfully!");
      }
    });
  }

  async function forgotPassword() {
    const redirectUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}/reset-password`
      : `${process.env.NEXT_PUBLIC_HOST || 'http://localhost:3000'}/reset-password`;
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(form.getValues().email, { 
      redirectTo: redirectUrl
    }) 
    
    if (error) {
      toast.error("Error sending password reset email: " + error.message);
    } else {
      toast.success("Password reset email sent successfully!");
    }
  }

  return (
    <div>
      <Button onClick={signInWithGoogle} variant={`outline`} className={`cursor-pointer w-full`}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path
            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
            fill="currentColor"
          />
        </svg>
        Sign in with Google
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="someone@example.com" />
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
                <FormLabel>Password <span onClick={forgotPassword} className={`ml-auto underline underline-offset-2 cursor-pointer hover:text-card-foreground/85 transition-all`}>Forgot Password?</span></FormLabel>
                <FormControl>
                  <Input type={`password`} {...field} placeholder="Enter your password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type={`submit`} className={`w-full cursor-pointer`}>Sign In</Button>
        </form>
      </Form>
      <Toaster richColors position={`top-right`} />
    </div>
  )
}
