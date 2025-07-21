"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select";
import moment from 'moment-timezone'
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";

const AvailabilitySchema = z.object({
    timezone: z.string().min(1, "Timezone is required"),
    preferredWorkTimes: z.array(z.enum(["Morning", "Afternoon", "Evening", "Weekend"])).optional()
});

// const timezones = moment.tz.names().map((tz) => {
//     const offsetMinutes = moment.tz(tz).utcOffset(); // minutes
//     const sign = offsetMinutes >= 0 ? "+" : "-";
//     const hours = Math.floor(Math.abs(offsetMinutes) / 60)
//     .toString()
//     .padStart(2, "0");
//     const minutes = (Math.abs(offsetMinutes) % 60).toString().padStart(2, "0");

//     return {
//     label: `(UTC${sign}${hours}:${minutes}) ${tz}`,
//     value: tz,
//     };
// });

const timezones = [
    { label: "(UTC-04:00) Eastern Time", value: "America/New_York" },
    { label: "(UTC-05:00) Central Time", value: "America/Chicago" },
    { label: "(UTC-06:00) Mountain Time", value: "America/Denver" },
    { label: "(UTC-07:00) Pacific Time", value: "America/Los_Angeles" },
    { label: "(UTC-08:00) Alaska Time", value: "America/Anchorage" },
    { label: "(UTC-10:00) Hawaii Time", value: "Pacific/Honolulu" },
    { label: "(UTC-07:00) Arizona Time (no DST)", value: "America/Phoenix" }
]

export default function Availability({ setStep, setBigForm, bigForm }: { setStep: (step: number) => void, setBigForm: (bigForm: boolean) => void, bigForm: any }) {
    const form = useForm<z.infer<typeof AvailabilitySchema>>({
        resolver: zodResolver(AvailabilitySchema),
        defaultValues: {
            timezone: bigForm.timezone || "",
            preferredWorkTimes: [],
        }
    })

    useEffect(() => {
        if (bigForm.timezone) {
            form.reset({
                timezone: bigForm.timezone,
                preferredWorkTimes: bigForm.preferredWorkTimes,
            });
        }
    }, [bigForm.timezone, bigForm.preferredWorkTimes]);

    const onSubmit = (values: z.infer<typeof AvailabilitySchema>) => {
        setStep(4);
        setBigForm({...bigForm, ...values })
    }
    
    return (
        <div className={`w-11/12 max-w-md`}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className={`space-y-6`}>
                    <FormField
                        control={form.control}
                        name="timezone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Timezone</FormLabel>
                                <FormControl>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a Timezone" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Timezones</SelectLabel>
                                                {timezones.map((timezone, index) => {
                                                    return (
                                                        <SelectItem key={index} value={timezone.value}>{timezone.label}</SelectItem>
                                                    )
                                                })}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="preferredWorkTimes"
                        render={() => (
                            <FormItem>
                                <FormLabel className={`mb-2.5`}>Preferred Work Times</FormLabel>
                                <div className={`space-y-4`}>
                                    {["Morning", "Afternoon", "Evening", "Weekend"].map((time, index) => {
                                        return (
                                            <FormField control={form.control} key={index} name="preferredWorkTimes" render={({ field }) => (
                                                <FormItem className={`flex flex-row items-center gap-2`}>
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value?.includes(time as "Morning" | "Afternoon" | "Evening" | "Weekend")}
                                                            onCheckedChange={(checked) => {
                                                                return checked
                                                                    ? field.onChange([...(field.value || []), time])
                                                                    : field.onChange(
                                                                        field.value?.filter(
                                                                            (value) => value !== time
                                                                        )
                                                                    )
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormLabel>{time}</FormLabel>
                                                </FormItem>
                                            )}
                                            />
                                        )
                                    })}
                                </div>
                            </FormItem>
                        )}
                    />
                    <div className={`flex items-center gap-3.5 mt-20`}>
                        <Button onClick={(e) => {e.preventDefault(); setStep(2)}} variant={`outline`} className={`cursor-pointer`} size={`lg`}>Back</Button>
                        <Button type={`submit`} variant={`default`} className={`cursor-pointer`} size={`lg`}>Next</Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}