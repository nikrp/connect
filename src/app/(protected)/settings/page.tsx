"use client"

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const NAV_SECTIONS = [
    { id: "profile", label: "Profile" },
    { id: "account", label: "Account" },
    { id: "appearance", label: "Appearance" },
    { id: "notifications", label: "Notifications" },
    { id: "danger", label: "Danger zone" },
];

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const supabase = createClient();
    const { user, profile, setProfile } = useUser();

    const [email, setEmail] = useState(user?.email || "");
    const [displayName, setDisplayName] = useState(profile?.name || "");
    const [pronouns, setPronouns] = useState(profile?.pronouns || "");
    const [bio, setBio] = useState(profile?.bio || "");
    const [newsletterOptIn, setNewsletterOptIn] = useState(!!profile?.newsletter);

    const [savingProfile, setSavingProfile] = useState(false);
    const [savingAccount, setSavingAccount] = useState(false);
    const [savingNotifications, setSavingNotifications] = useState(false);

    const [activeSection, setActiveSection] = useState(NAV_SECTIONS[0]?.id ?? "profile");

    useEffect(() => {
        setEmail(user?.email || "");
    }, [user?.email]);

    useEffect(() => {
        setDisplayName(profile?.name || "");
        setPronouns(profile?.pronouns || "");
        setBio(profile?.bio || "");
        setNewsletterOptIn(!!profile?.newsletter);
    }, [profile?.id]);

    const sectionIds = useMemo(() => NAV_SECTIONS.map((section) => section.id), []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => a.target.getBoundingClientRect().top - b.target.getBoundingClientRect().top);
                if (visible.length > 0) {
                    const id = visible[0].target.getAttribute("id");
                    if (id && sectionIds.includes(id)) {
                        setActiveSection(id);
                    }
                }
            },
            { rootMargin: "-40% 0px -40% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
        );

        sectionIds.forEach((id) => {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [sectionIds]);

    async function handleProfileSave() {
        if (!user?.id) {
            toast.error("You need to be signed in to update your profile.");
            return;
        }

        setSavingProfile(true);
        try {
            const updates = {
                name: displayName.trim() || null,
                pronouns: pronouns.trim() || null,
                bio: bio.trim() || null,
            };

            const { error } = await supabase
                .from("profiles")
                .update(updates)
                .eq("id", user.id);

            if (error) throw error;

            setProfile((prev) => (prev ? { ...prev, ...updates } : prev));
            toast.success("Profile updated");
        } catch (err: any) {
            toast.error("Error updating profile", { description: err.message });
        } finally {
            setSavingProfile(false);
        }
    }

    async function updateEmail() {
        if (!email || email === user?.email) {
            toast.info("No email changes to save");
            return;
        }

        setSavingAccount(true);
        try {
            const { error } = await supabase.auth.updateUser({ email });
            if (error) throw error;
            toast.success("Email update requested. Check your inbox to confirm.");
        } catch (err: any) {
            toast.error("Error updating email", { description: err.message });
        } finally {
            setSavingAccount(false);
        }
    }

    async function sendPasswordReset() {
        if (!email) {
            toast.error("Provide an email first");
            return;
        }

        setSavingAccount(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) throw error;
            toast.success("Password reset email sent");
        } catch (err: any) {
            toast.error("Error sending reset email", { description: err.message });
        } finally {
            setSavingAccount(false);
        }
    }

    async function handleNotificationsSave() {
        if (!user?.id) {
            toast.error("You need to be signed in to update preferences.");
            return;
        }

        setSavingNotifications(true);
        try {
            const updates = {
                newsletter: newsletterOptIn,
            };

            const { error } = await supabase
                .from("profiles")
                .update(updates)
                .eq("id", user.id);

            if (error) throw error;

            setProfile((prev) => (prev ? { ...prev, ...updates } : prev));
            toast.success("Preferences updated");
        } catch (err: any) {
            toast.error("Error updating preferences", { description: err.message });
        } finally {
            setSavingNotifications(false);
        }
    }

    function handleScrollTo(id: string) {
        const el = document.getElementById(id);
        if (!el) return;
        el.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function handleDeleteAccount() {
        toast.warning("Account deletion requests are handled manually for now. Email support@connect.com.");
    }

    return (
        <div className="mx-auto w-11/12 max-w-6xl pb-16">
            <div className="mb-8 space-y-2">
                <h1 className="text-3xl font-semibold">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your profile, account, and preferences.
                </p>
            </div>
            <div className="flex flex-col gap-8 md:flex-row">
                <aside className="md:w-60">
                    <nav className="sticky top-24 flex flex-col gap-1 rounded-xl border bg-card p-3">
                        {NAV_SECTIONS.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => handleScrollTo(section.id)}
                                className={cn(
                                    "rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                                    activeSection === section.id
                                        ? "bg-primary/10 text-primary"
                                        : "hover:bg-muted"
                                )}
                                type="button"
                            >
                                {section.label}
                            </button>
                        ))}
                    </nav>
                </aside>
                <div className="flex-1 space-y-10">
                    <section id="profile" className="scroll-mt-24">
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile</CardTitle>
                                <CardDescription>Update how your profile appears across Connect.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="displayName">Display name</Label>
                                        <Input
                                            id="displayName"
                                            value={displayName}
                                            onChange={(event) => setDisplayName(event.target.value)}
                                            placeholder="Add your name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="pronouns">Pronouns</Label>
                                        <Input
                                            id="pronouns"
                                            value={pronouns}
                                            onChange={(event) => setPronouns(event.target.value)}
                                            placeholder="she/her, they/them"
                                        />
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <Label htmlFor="bio">Bio</Label>
                                        <Textarea
                                            id="bio"
                                            value={bio}
                                            onChange={(event) => setBio(event.target.value)}
                                            placeholder="Share a short intro or what you are working on."
                                            rows={4}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="justify-end">
                                <Button onClick={handleProfileSave} disabled={savingProfile}>
                                    {savingProfile ? "Saving..." : "Save profile"}
                                </Button>
                            </CardFooter>
                        </Card>
                    </section>

                    <section id="account" className="scroll-mt-24">
                        <Card>
                            <CardHeader>
                                <CardTitle>Account</CardTitle>
                                <CardDescription>Change your email or reset your password.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(event) => setEmail(event.target.value)}
                                            className="sm:max-w-sm"
                                        />
                                        <Button onClick={updateEmail} disabled={savingAccount}>
                                            {savingAccount ? "Updating..." : "Update email"}
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Changing your email requires confirmation from the new address.
                                    </p>
                                </div>
                                <Separator />
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm font-medium">Reset password</p>
                                        <p className="text-xs text-muted-foreground">
                                            We will send you a secure link to set a new password.
                                        </p>
                                    </div>
                                    <Button variant="outline" onClick={sendPasswordReset} disabled={savingAccount}>
                                        Send reset email
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    <section id="appearance" className="scroll-mt-24">
                        <Card>
                            <CardHeader>
                                <CardTitle>Appearance</CardTitle>
                                <CardDescription>Choose how Connect looks on this device.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-3 sm:grid-cols-3">
                                    {[
                                        { value: "light", label: "Light" },
                                        { value: "dark", label: "Dark" },
                                        { value: "system", label: "System" },
                                    ].map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setTheme(option.value)}
                                            className={cn(
                                                "rounded-xl border p-4 text-left transition-colors",
                                                theme === option.value
                                                    ? "border-primary bg-primary/10"
                                                    : "hover:border-muted-foreground/40"
                                            )}
                                        >
                                            <p className="font-medium">{option.label}</p>
                                            <p className="text-xs text-muted-foreground">{option.value === "system" ? "Match your OS setting" : `Use the ${option.label.toLowerCase()} theme`}</p>
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    <section id="notifications" className="scroll-mt-24">
                        <Card>
                            <CardHeader>
                                <CardTitle>Notifications</CardTitle>
                                <CardDescription>Choose what updates you want to receive from Connect.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start justify-between rounded-lg border p-4">
                                    <div>
                                        <p className="font-medium">Product updates</p>
                                        <p className="text-sm text-muted-foreground">
                                            Stay in the loop about new features and opportunities.
                                        </p>
                                    </div>
                                    <Checkbox
                                        checked={newsletterOptIn}
                                        onCheckedChange={(value) => setNewsletterOptIn(value === true)}
                                        aria-label="Toggle product updates"
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="justify-end">
                                <Button onClick={handleNotificationsSave} disabled={savingNotifications}>
                                    {savingNotifications ? "Saving..." : "Save preferences"}
                                </Button>
                            </CardFooter>
                        </Card>
                    </section>

                    <section id="danger" className="scroll-mt-24">
                        <Card className="border-destructive/30">
                            <CardHeader>
                                <CardTitle className="text-destructive">Danger zone</CardTitle>
                                <CardDescription>
                                    Delete your account and remove all of your profile data. This action is irreversible.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    We will review deletion requests manually to keep the community safe. Reach out to our
                                    support team once you submit the request.
                                </p>
                            </CardContent>
                            <CardFooter className="justify-end">
                                <Button variant="destructive" onClick={handleDeleteAccount}>
                                    Request account deletion
                                </Button>
                            </CardFooter>
                        </Card>
                    </section>
                </div>
            </div>
        </div>
    );
}
