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
        resolve(data);
      }
    });

    toast.promise(promise, {
      loading: "Creating account...",
      success: "Account created successfully!",
      error: "Something went wrong! If this issue persists please contact support.",
    });
  }

  return (
    <div>
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
                <FormLabel>I accept the <span><a href={`#`} className={`ml-0 pl-0`}>terms and conditions</a></span></FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type={`submit`} className={`w-full cursor-pointer`}>Submit</Button>
        </form>
      </Form>
      <Toaster richColors position={`top-right`} />
    </div>
  )
}
