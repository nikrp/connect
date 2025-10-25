"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/contexts/UserContext"
import type { Profile } from "../../../types/profile";
import { User } from "@supabase/supabase-js";
import { Dispatch, SetStateAction, useCallback, useMemo, useRef } from "react";
import { Building, School, Timer, Edit2, ArrowRight, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { CheckIcon, ChevronsUpDownIcon, X } from "lucide-react";
import { SchoolComboBox } from "@/components/schools-combo";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { Mail, Phone, Twitter, Linkedin, ExternalLink } from "lucide-react";
import { AvatarDropzone } from "@/components/avatar-dropzone";
import Cropper from "react-easy-crop";

type EditProfileFormValues = {
    name: string;
    bio: string;
    school: string;
    profile_photo: string;
    skills: any[];
    interests: any[];
    emailsText: string;
    phonesText: string;
    linkedin: string;
    twitter: string;
};

type CropArea = {
    width: number;
    height: number;
    x: number;
    y: number;
};

async function loadImageElement(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.onload = () => resolve(image);
        image.onerror = (error) => reject(error);
        image.src = src;
    });
}

async function cropImageToFile(imageSrc: string, crop: CropArea, outputSize = 512): Promise<File> {
    const image = await loadImageElement(imageSrc);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
        throw new Error("Unable to create canvas context");
    }

    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = outputSize * pixelRatio;
    canvas.height = outputSize * pixelRatio;

    context.scale(pixelRatio, pixelRatio);
    context.imageSmoothingQuality = "high";

    context.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        outputSize,
        outputSize
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error("Unable to create cropped image"));
                return;
            }
            const file = new File([blob], "profile-photo.png", { type: blob.type || "image/png" });
            resolve(file);
        }, "image/png");
    });
}

function getStoragePathFromUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    try {
        const parsed = new URL(url);
        const pathname = decodeURIComponent(parsed.pathname);
        const markers = [
            "/object/public/profile-photos/",
            "/object/sign/profile-photos/",
        ];
        for (const marker of markers) {
            const idx = pathname.indexOf(marker);
            if (idx !== -1) {
                return pathname.substring(idx + marker.length);
            }
        }
        return null;
    } catch (error) {
        console.warn("Failed to parse storage url", error);
        return null;
    }
}

export default function Profile() {
    const { user, setUser, profile: profileRaw, setProfile } : { user: User | null, setUser: Dispatch<SetStateAction<User | null>>, profile: Profile | null, setProfile: Dispatch<SetStateAction<Profile | null>> } = useUser();
    const profile: Profile = profileRaw ?? ({} as Profile);
    const defaultSkills = Array.isArray(profile.skills) ? profile.skills : [];
    const defaultInterests = Array.isArray(profile.interests) ? profile.interests : [];
    const defaultEmails = Array.isArray(profile.contact?.emails) ? profile.contact.emails : [];
    const defaultPhones = Array.isArray(profile.contact?.phones) ? profile.contact.phones : [];
    const defaultLinkedin = profile.contact?.socials?.linkedin || '';
    const defaultTwitter = profile.contact?.socials?.twitter || '';
    const supabase = createClient();
    const editForm = useForm<EditProfileFormValues>({
        defaultValues: {
            name: profile.name || '',
            bio: profile.bio || '',
            school: profile.school || '',
            profile_photo: profile.profile_photo || '',
            skills: defaultSkills,
            interests: defaultInterests,
            emailsText: defaultEmails.join(', '),
            phonesText: defaultPhones.join(', '),
            linkedin: defaultLinkedin,
            twitter: defaultTwitter,
        }
    });
    const [open, setOpen] = useState(false);
        const [skillsOpen, setSkillsOpen] = useState(false);
        const [interestsOpen, setInterestsOpen] = useState(false);
    const [photoEditorOpen, setPhotoEditorOpen] = useState(false);
    const [photoCrop, setPhotoCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [photoZoom, setPhotoZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);
    const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(profile.profile_photo || null);
    const [imageUrlInput, setImageUrlInput] = useState('');
    const [savingPhoto, setSavingPhoto] = useState(false);
    const [removePhoto, setRemovePhoto] = useState(false);
    const objectUrlRef = useRef<string | null>(null);

    const cleanupObjectUrl = useCallback(() => {
        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = null;
        }
    }, []);

    const resetPhotoEditor = useCallback(() => {
        cleanupObjectUrl();
        setSelectedPhotoFile(null);
        setPhotoPreview(profile.profile_photo || null);
        setPhotoCrop({ x: 0, y: 0 });
        setPhotoZoom(1);
        setCroppedAreaPixels(null);
        setImageUrlInput('');
        setSavingPhoto(false);
        setRemovePhoto(false);
    }, [cleanupObjectUrl, profile.profile_photo]);

    const handlePhotoDialogChange = useCallback((nextOpen: boolean) => {
        setPhotoEditorOpen(nextOpen);
        if (nextOpen) {
            resetPhotoEditor();
        } else {
            cleanupObjectUrl();
        }
    }, [cleanupObjectUrl, resetPhotoEditor]);

    const handleAvatarFile = useCallback((file: File | null) => {
        cleanupObjectUrl();
        if (file) {
            const url = URL.createObjectURL(file);
            objectUrlRef.current = url;
            setSelectedPhotoFile(file);
            setPhotoPreview(url);
            setPhotoCrop({ x: 0, y: 0 });
            setPhotoZoom(1);
            setCroppedAreaPixels(null);
            setRemovePhoto(false);
            setImageUrlInput('');
        } else {
            setSelectedPhotoFile(null);
            setPhotoPreview(profile.profile_photo || null);
        }
    }, [cleanupObjectUrl, profile.profile_photo]);

    const handleApplyImageUrl = useCallback(() => {
        const value = imageUrlInput.trim();
        if (!value) {
            toast.error('Please provide an image URL');
            return;
        }
        try {
            new URL(value);
        } catch (_) {
            toast.error('Enter a valid image URL');
            return;
        }
        cleanupObjectUrl();
        setSelectedPhotoFile(null);
        setPhotoPreview(value);
        setPhotoCrop({ x: 0, y: 0 });
        setPhotoZoom(1);
        setCroppedAreaPixels(null);
        setRemovePhoto(false);
    }, [cleanupObjectUrl, imageUrlInput]);

    const handleRemoveCurrentPhoto = useCallback(() => {
        cleanupObjectUrl();
        setSelectedPhotoFile(null);
        setPhotoPreview(null);
        setRemovePhoto(true);
        setCroppedAreaPixels(null);
        setImageUrlInput('');
        setPhotoCrop({ x: 0, y: 0 });
        setPhotoZoom(1);
    }, [cleanupObjectUrl]);

    const handleCropComplete = useCallback((_: CropArea, areaPixels: CropArea) => {
        setCroppedAreaPixels(areaPixels);
    }, []);

    const livePreviewUrl = useMemo(() => {
        if (removePhoto) return null;
        return photoPreview;
    }, [photoPreview, removePhoto]);

    const handleSavePhoto = useCallback(async () => {
        if (!user?.id) {
            toast.error('Not authenticated');
            return;
        }

        try {
            setSavingPhoto(true);
            const existingStoragePath = getStoragePathFromUrl(profile.profile_photo);

            if (removePhoto) {
                if (existingStoragePath) {
                    const { error: removeError } = await supabase
                        .storage
                        .from('profile-photos')
                        .remove([existingStoragePath]);
                    if (removeError) {
                        console.warn('Unable to remove existing profile photo', removeError);
                    }
                }
                const { error } = await supabase.from('profiles').update({ profile_photo: null }).eq('id', user.id);
                if (error) throw error;

                const updatedProfile: Profile = { ...profile, profile_photo: null };
                setProfile(updatedProfile);
                editForm.setValue('profile_photo', '', { shouldDirty: false });
                localStorage.setItem('profile', JSON.stringify(updatedProfile));
                toast.success('Profile photo removed');
                handlePhotoDialogChange(false);
                return;
            }

            if (!photoPreview || !croppedAreaPixels) {
                toast.error('Choose a photo and adjust the crop before saving');
                return;
            }

            const croppedFile = await cropImageToFile(photoPreview, croppedAreaPixels);
            const filePath = `${user.id}/profile_photo.png`;
            const { error: uploadError } = await supabase
                .storage
                .from('profile-photos')
                .upload(filePath, croppedFile, { upsert: true, cacheControl: '3600' });

            if (uploadError) throw uploadError;

            const { data: publicData } = supabase
                .storage
                .from('profile-photos')
                .getPublicUrl(filePath);

            const publicUrl = publicData.publicUrl;
            if (existingStoragePath && existingStoragePath !== filePath) {
                const { error: removeError } = await supabase
                    .storage
                    .from('profile-photos')
                    .remove([existingStoragePath]);
                if (removeError) {
                    console.warn('Unable to clean up previous profile photo', removeError);
                }
            }
            const updatedProfile: Profile = { ...profile, profile_photo: publicUrl };
            setProfile(updatedProfile);
            editForm.setValue('profile_photo', publicUrl, { shouldDirty: false });
            localStorage.setItem('profile', JSON.stringify(updatedProfile));
            toast.success('Profile photo updated');
            handlePhotoDialogChange(false);
        } catch (err: any) {
            console.error('Error saving profile photo:', err);
            toast.error('Unable to update profile photo', { description: err.message });
        } finally {
            setSavingPhoto(false);
        }
    }, [croppedAreaPixels, editForm, handlePhotoDialogChange, photoPreview, profile, removePhoto, setProfile, supabase, user?.id]);
    const [schools, setSchools] = useState<{ label: string; value: string }[]>([]);
    const [collabs, setCollabs] = useState<any[]>([]);
    const [collabsLoading, setCollabsLoading] = useState(true);
    
        const tempSkills = [
            { label: "Python", slug: "python", custom: false },
            { label: "Web Development", slug: "web-development", custom: false },
            { label: "Data Analysis", slug: "data-analysis", custom: false },
            { label: "Graphic Design", slug: "graphic-design", custom: false },
            { label: "Public Speaking", slug: "public-speaking", custom: false },
            { label: "Biology", slug: "biology", custom: false },
            { label: "Machine Learning", slug: "machine-learning", custom: false },
            { label: "JavaScript", slug: "javascript", custom: false },
            { label: "Mathematics", slug: "mathematics", custom: false },
        ];

    useEffect(() => {
        async function loadSchools() {
            try {
                const res = await fetch('/schools.json');
                if (!res.ok) return;
                const data = await res.json();
                // data may be an array of school names or objects; normalize to {label,value}
                const normalized = data.map((s: any) => typeof s === 'string' ? { label: s, value: s } : { label: s.label || s.name || s.value, value: s.value || s.name || s.label });
                setSchools(normalized);
            } catch (err) {
                console.warn('Failed to load schools.json', err);
            }
        }

        loadSchools();
    }, []);

    // Fetch current user's collabs
    useEffect(() => {
        async function loadCollabs() {
            try {
                setCollabsLoading(true);
                // reuse existing RPC that returns collabs with members for the current user
                const { data, error } = await supabase.rpc('get_user_collabs_with_members');
                if (error) {
                    console.error('Error loading collabs:', error);
                    setCollabs([]);
                    return;
                }
                setCollabs(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Unexpected error loading collabs:', err);
                setCollabs([]);
            } finally {
                setCollabsLoading(false);
            }
        }

        // only load if we have a signed-in user
        if (user) loadCollabs();
    }, [user]);

    const router = useRouter();

    const handleMessage = async (creatorId: string) => {
        try {
            const response = await fetch('/api/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user2_id: creatorId })
            });

            if (!response.ok) {
                const err = await response.json();
                toast.error('Error starting conversation', { description: err.error });
                return;
            }

            const conversation = await response.json();
            router.push(`/messages?conversation=${conversation.id}`);
        } catch (err) {
            console.error('Error starting conversation:', err);
            toast.error('Error starting conversation');
        }
    }

    const onSubmit = async (vals: EditProfileFormValues) => {
        try {
            if (!user?.id) throw new Error('Not authenticated');

            const emails = String(vals.emailsText || '').split(',').map((s: string) => s.trim()).filter(Boolean);
            const phones = String(vals.phonesText || '').split(',').map((s: string) => s.trim()).filter(Boolean);
            const contact = {
                emails,
                phones,
                socials: { linkedin: vals.linkedin || '', twitter: vals.twitter || '' }
            };

            const normalizedPhoto = vals.profile_photo?.trim() ? vals.profile_photo.trim() : null;

            const { error } = await supabase.from('profiles').update({
                name: vals.name,
                bio: vals.bio,
                school: vals.school,
                profile_photo: normalizedPhoto,
                skills: vals.skills,
                interests: vals.interests,
                contact,
            }).eq('id', user.id);

            if (error) throw error;

            const updatedProfile: Profile = {
                ...profile,
                name: vals.name,
                bio: vals.bio,
                school: vals.school,
                profile_photo: normalizedPhoto,
                skills: vals.skills,
                interests: vals.interests,
                contact,
            };

            setProfile(updatedProfile);
            toast.success('Profile updated');
            localStorage.setItem('profile', JSON.stringify(updatedProfile));
            editForm.reset({
                name: updatedProfile.name || '',
                bio: updatedProfile.bio || '',
                school: updatedProfile.school || '',
                profile_photo: updatedProfile.profile_photo || '',
                skills: Array.isArray(updatedProfile.skills) ? updatedProfile.skills : [],
                interests: Array.isArray(updatedProfile.interests) ? updatedProfile.interests : [],
                emailsText: contact.emails.join(', '),
                phonesText: contact.phones.join(', '),
                linkedin: contact.socials.linkedin || '',
                twitter: contact.socials.twitter || '',
            });

            return true;
        } catch (err: any) {
            console.error('Error updating profile:', err);
            toast.error('Error updating profile', { description: err.message });
            return false;
        }
    }

    return (
        <div className={`bg-card rounded-xl w-11/12 md:w-9/12 mx-auto mb-5`}>
            <div className={`p-10 md:p-10 bg-muted text-muted-foreground rounded-t-xl`}>
                <div className={`flex flex-col md:flex-row md:justify-between`}>
                    <div className={`flex flex-row items-start gap-4 mb-5`}>
                        <Dialog open={photoEditorOpen} onOpenChange={handlePhotoDialogChange}>
                            <DialogTrigger asChild>
                                <button
                                    type="button"
                                    className="relative outline-none group rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary focus-visible:outline-none"
                                >
                                    <Avatar className={`size-20 md:size-40 bg-sidebar p-2 rounded-full transition-transform group-hover:scale-[1.02]`}>
                                        <AvatarImage src={profile.profile_photo ?? undefined} />
                                        <AvatarFallback>
                                            {(profile.name || "").split(' ').map((name: string) => name.substring(0, 2)).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="absolute inset-0 rounded-full bg-black/55 text-white text-xs md:text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        Change photo
                                    </span>
                                </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[720px] p-6">
                                <DialogHeader>
                                    <DialogTitle>Update profile photo</DialogTitle>
                                    <DialogDescription>Upload, crop, and preview a new avatar before saving.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
                                    <div className="space-y-4">
                                        <div className="relative aspect-square overflow-hidden rounded-xl border bg-muted">
                                            {photoPreview && !removePhoto ? (
                                                <Cropper
                                                    image={photoPreview}
                                                    crop={photoCrop}
                                                    zoom={photoZoom}
                                                    aspect={1}
                                                    cropShape="round"
                                                    showGrid
                                                    restrictPosition
                                                    onCropChange={setPhotoCrop}
                                                    onZoomChange={setPhotoZoom}
                                                    onCropComplete={handleCropComplete}
                                                    classes={{ containerClassName: "bg-black/80" }}
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-sm text-muted-foreground px-6 text-center">
                                                    {removePhoto ? 'Your profile photo will be removed.' : 'Drop a new image or paste a link to begin.'}
                                                </div>
                                            )}
                                        </div>
                                        {photoPreview && !removePhoto && (
                                            <div className="space-y-2">
                                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Zoom</p>
                                                <input
                                                    type="range"
                                                    min={1}
                                                    max={3}
                                                    step={0.01}
                                                    value={photoZoom}
                                                    onChange={(event) => setPhotoZoom(parseFloat(event.target.value))}
                                                    className="w-full accent-primary"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-5">
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium">Upload a new photo</p>
                                            <AvatarDropzone value={selectedPhotoFile || photoPreview || undefined} onChange={handleAvatarFile} />
                                            {selectedPhotoFile && (
                                                <p className="text-xs text-muted-foreground truncate">Selected: {selectedPhotoFile.name}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium">Use an image link</p>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    value={imageUrlInput}
                                                    onChange={(event) => setImageUrlInput(event.target.value)}
                                                    placeholder="https://example.com/avatar.png"
                                                />
                                                <Button type="button" variant="secondary" onClick={handleApplyImageUrl}>
                                                    Apply
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium">Live preview</p>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="size-16 border">
                                                    <AvatarImage src={livePreviewUrl ?? undefined} />
                                                    <AvatarFallback>
                                                        {(profile.name || "").split(' ').map((name: string) => name.substring(0, 2)).join('')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <p className="text-xs text-muted-foreground">This is how your profile will appear across Connect.</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Button type="button" variant="ghost" className="w-full justify-start" onClick={resetPhotoEditor} disabled={savingPhoto}>
                                                Revert to current photo
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="w-full justify-start text-destructive hover:text-destructive"
                                                onClick={handleRemoveCurrentPhoto}
                                                disabled={savingPhoto}
                                            >
                                                Remove photo
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => handlePhotoDialogChange(false)} disabled={savingPhoto}>
                                        Cancel
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={handleSavePhoto}
                                        disabled={savingPhoto || (!removePhoto && !photoPreview)}
                                        className="flex items-center gap-2"
                                    >
                                        {savingPhoto && <Loader2 className="h-4 w-4 animate-spin" />}
                                        Save photo
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="ml-2"><Edit2 /></Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[900px]">
                                <DialogHeader>
                                    <DialogTitle>Edit Profile</DialogTitle>
                                </DialogHeader>
                                <Form {...editForm}>
                            <form
                                                            onSubmit={(e) =>
                                                                    // ensure the dialog closes only after the profile update handler runs
                                                                    editForm.handleSubmit(async (vals) => {
                                        const ok = await onSubmit(vals);
                                        if (ok) setOpen(false);
                                                                    })(e)
                                                            }
                                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                                    >
                                <FormField control={editForm.control} name="name" render={({ field }) => (
                                    <FormItem className="md:col-span-1">
                                                                            <FormLabel>Name</FormLabel>
                                                                            <FormControl>
                                                                                    <Input {...field} />
                                                                            </FormControl>
                                                                            <FormMessage />
                                                                    </FormItem>
                                                            )} />
                                <FormField control={editForm.control} name="bio" render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                                                            <FormLabel>Bio</FormLabel>
                                                                            <FormControl>
                                                                                    <Textarea {...field} />
                                                                            </FormControl>
                                                                            <FormMessage />
                                                                    </FormItem>
                                                            )} />
                                <FormField control={editForm.control} name="school" render={({ field }) => (
                                    <FormItem className="md:col-span-1">
                                                                            <FormLabel>School</FormLabel>
                                                                            <FormControl>
                                                                                    <SchoolComboBox value={field.value || ''} onChange={field.onChange} schools={schools} />
                                                                            </FormControl>
                                                                            <FormMessage />
                                                                    </FormItem>
                                                            )} />
                                                            
                                    <FormField control={editForm.control} name="skills" render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>Skills</FormLabel>
                                            <FormControl>
                                                <Popover open={skillsOpen} onOpenChange={setSkillsOpen}>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline" role="combobox" aria-expanded={skillsOpen} className="w-full justify-between">
                                                            Select skills...
                                                            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-full p-0">
                                                        <Command>
                                                            <CommandInput placeholder="Search skills" />
                                                            <CommandList>
                                                                <CommandEmpty>No skill found.</CommandEmpty>
                                                                <CommandGroup>
                                                                    {tempSkills.map((skill, index) => {
                                                                        const selectedSkills = Array.isArray(field.value) ? field.value : [];
                                                                        const isSelected = selectedSkills.some((val: any) => val.slug === skill.slug);
                                                                        return (
                                                                            <CommandItem key={index} value={skill.slug} onSelect={() => {
                                                                                const updated = isSelected ? selectedSkills.filter((val: any) => val.slug !== skill.slug) : [...selectedSkills, skill];
                                                                                field.onChange(updated);
                                                                            }}>
                                                                                <CheckIcon className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                                                                                {skill.label}
                                                                            </CommandItem>
                                                                        );
                                                                    })}
                                                                </CommandGroup>
                                                            </CommandList>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover>
                                            </FormControl>
                                            <FormDescription className="flex flex-wrap items-center gap-2">
                                                {(Array.isArray(field.value) ? field.value : []).map((skill: any, index: number) => (
                                                    <Badge key={index} onClick={() => {
                                                        const currentSkills = editForm.getValues().skills;
                                                        const updatedSkills = currentSkills.filter((_: any, i: number) => i !== index);
                                                        editForm.setValue('skills', updatedSkills);
                                                    }} className="cursor-pointer opacity-80 hover:opacity-60 transition-all flex items-center gap-1.5">
                                                        {skill.label}<X className="h-3 w-3" />
                                                    </Badge>
                                                ))}
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                                            
                                    <FormField control={editForm.control} name="interests" render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>Interests</FormLabel>
                                            <FormControl>
                                                <Popover open={interestsOpen} onOpenChange={setInterestsOpen}>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline" role="combobox" aria-expanded={interestsOpen} className="w-full justify-between">
                                                            Select interests...
                                                            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-full p-0">
                                                        <Command>
                                                            <CommandInput placeholder="Search interests" />
                                                            <CommandList>
                                                                <CommandEmpty>No interest found.</CommandEmpty>
                                                                <CommandGroup>
                                                                    {tempSkills.map((interest, index) => {
                                                                        const selectedInterests = Array.isArray(field.value) ? field.value : [];
                                                                        const isSelected = selectedInterests.some((val: any) => val.slug === interest.slug);
                                                                        return (
                                                                            <CommandItem key={index} value={interest.slug} onSelect={() => {
                                                                                const updated = isSelected ? selectedInterests.filter((val: any) => val.slug !== interest.slug) : [...selectedInterests, interest];
                                                                                field.onChange(updated);
                                                                            }}>
                                                                                <CheckIcon className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                                                                                {interest.label}
                                                                            </CommandItem>
                                                                        );
                                                                    })}
                                                                </CommandGroup>
                                                            </CommandList>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover>
                                            </FormControl>
                                            <FormDescription className="flex flex-wrap items-center gap-2">
                                                {(Array.isArray(field.value) ? field.value : []).map((interest: any, index: number) => (
                                                    <Badge key={index} onClick={() => {
                                                        const currentInterests = editForm.getValues().interests;
                                                        const updatedInterests = currentInterests.filter((_: any, i: number) => i !== index);
                                                        editForm.setValue('interests', updatedInterests);
                                                    }} className="cursor-pointer opacity-80 hover:opacity-60 transition-all flex items-center gap-1.5">
                                                        {interest.label}<X className="h-3 w-3" />
                                                    </Badge>
                                                ))}
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                                            
                                    <FormField control={editForm.control} name="emailsText" render={({ field }) => (
                                        <FormItem className="md:col-span-1">
                                            <FormLabel>Emails (comma separated)</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="email1@example.com, email2@example.com" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                                            
                                    <FormField control={editForm.control} name="phonesText" render={({ field }) => (
                                        <FormItem className="md:col-span-1">
                                            <FormLabel>Phone numbers (comma separated)</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="1234567890, 0987654321" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                                            
                                    <FormField control={editForm.control} name="linkedin" render={({ field }) => (
                                        <FormItem className="md:col-span-1">
                                            <FormLabel>LinkedIn URL</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="https://linkedin.com/in/yourprofile" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                                            
                                    <FormField control={editForm.control} name="twitter" render={({ field }) => (
                                        <FormItem className="md:col-span-1">
                                            <FormLabel>Twitter URL</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="https://twitter.com/yourhandle" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                                            
                                <div className="md:col-span-2 flex gap-2 justify-end">
                                                                    <Button variant="outline" type="button" onClick={() => editForm.reset()}>Reset</Button>
                                                                    <Button type="submit">Save</Button>
                                                            </div>
                                                    </form>
                                            </Form>
                                    </DialogContent>
                            </Dialog>
                        <div className={``}>
                            <p className={`text-xl md:text-2xl font-sans font-semibold`}>{profile.name || profile.email || 'User'}</p>
                            <p className={`text-md md:text-xl font-sans text-foreground/80`}>{profile.role || 'Student'}</p>
                        </div>
                    </div>
                    <div className={`flex flex-col gap-2`}>
                        <p className={`text-base flex items-center gap-2`}><Building className={`text-foreground/75`} />{(profile.school || '').split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}</p>
                        <p className={`text-base flex items-center gap-2`}><Timer className={`text-foreground/75`} />{Array.isArray(profile.preferredWorkTimes) ? profile.preferredWorkTimes.join(', ') : ''}</p>
                    </div>
                </div>
                <p className={`mb-5`}>{profile.bio}</p>
                
                {/* Contact Information */}
                {profile.contact && (
                    <div className="mb-5">
                        <p className="font-semibold mb-2">Contact Information</p>
                        <div className="flex flex-col gap-2">
                            {/* Emails */}
                            {Array.isArray(profile.contact.emails) && profile.contact.emails.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {profile.contact.emails.map((email: string, index: number) => (
                                        <a 
                                            key={index}
                                            href={`mailto:${email}`}
                                            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-input hover:bg-input/80 transition-colors text-sm"
                                        >
                                            <Mail className="w-3.5 h-3.5" />
                                            {email}
                                        </a>
                                    ))}
                                </div>
                            )}
                            
                            {/* Phones */}
                            {Array.isArray(profile.contact.phones) && profile.contact.phones.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {profile.contact.phones.map((phone: string, index: number) => (
                                        <a 
                                            key={index}
                                            href={`tel:${phone}`}
                                            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-input hover:bg-input/80 transition-colors text-sm"
                                        >
                                            <Phone className="w-3.5 h-3.5" />
                                            {phone}
                                        </a>
                                    ))}
                                </div>
                            )}
                            
                            {/* Socials */}
                            {profile.contact.socials && (
                                <div className="flex flex-wrap gap-2">
                                    {profile.contact.socials.twitter && (
                                        <a 
                                            href={profile.contact.socials.twitter}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-input hover:bg-input/80 transition-colors text-sm"
                                        >
                                            <Twitter className="w-3.5 h-3.5" />
                                            Twitter
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    )}
                                    {profile.contact.socials.linkedin && (
                                        <a 
                                            href={profile.contact.socials.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-input hover:bg-input/80 transition-colors text-sm"
                                        >
                                            <Linkedin className="w-3.5 h-3.5" />
                                            LinkedIn
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
                <p className={`font-semibold mb-1`}>Skills</p>
                <div className={`flex items-center gap-1.5 flex-wrap`}>
                    {(Array.isArray(profile.skills) ? profile.skills : []).map((skill: { slug: string, label: string, custom: boolean }, index: number) => {
                        return (
                            <p className={`px-3 py-1 rounded-full bg-input`} key={index}>{skill.label}</p>
                        )
                    })}
                </div>
                <p className={`font-semibold mt-5 mb-1`}>Interests</p>
                <div className={`flex items-center gap-1.5 flex-wrap`}>
                    {(Array.isArray(profile.interests) ? profile.interests : []).map((skill: { slug: string, label: string, custom: boolean }, index: number) => {
                        return (
                            <p className={`px-3 py-1 rounded-full bg-input`} key={index}>{skill.label}</p>
                        )
                    })}
                </div>
            </div>
            <div className={`p-10 md:p-10 bg-card text-card-foreground rounded-b-xl`}>
                <div className="flex items-center justify-between mb-6">
                    <p className={`text-4xl font-semibold`}>Collabs ({collabs.length})</p>
                    <Link href="/requests/posts">
                        <Button variant="default" className={`flex items-center gap-1.5 cursor-pointer`}>
                            View My Posts <ArrowRight />
                        </Button>
                    </Link>
                </div>
                {collabsLoading ? (
                    <p className={`w-full text-center mt-10 text-foreground/75`}>Loading collabs...</p>
                ) : collabs.length === 0 ? (
                    <p className={`w-full text-center mt-10`}>No Collabs</p>
                ) : (
                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 mt-6`}>
                        {collabs.map((request: any) => {
                            const postDate = new Date(request.created_at).toLocaleString('en-US', {
                                timeZone: 'America/Los_Angeles',
                                month: 'numeric',
                                day: 'numeric',
                                year: 'numeric',
                                hour: 'numeric',
                                minute: 'numeric',
                                hour12: true,
                                timeZoneName: 'short'
                            });

                            return (
                                <div key={request.id} className={`border rounded-lg p-3.5 bg-background`}>
                                    <div className={`flex gap-5`}>
                                        <img
                                            src={request.creator_profile?.profile_photo || profile.profile_photo || "https://github.com/shadcn.png"}
                                            alt="profile-photo"
                                            className={`w-10 h-10 rounded-full`}
                                        />
                                        <div className={`flex flex-col`}>
                                            <p className={`text-lg font-semibold text-foreground`}>
                                                {request.creator_profile?.name || profile.name || "You"}
                                                <span className={`text-sm text-gray-500 font-normal`}>
                                                    {request.creator_profile?.pronouns ? ` (${request.creator_profile.pronouns})` : ""}
                                                </span>
                                            </p>
                                            <p className={`text-sm text-gray-500`}>{postDate}</p>
                                        </div>
                                    </div>
                                    <p className={`font-semibold mt-3.5 mb-2`}>{request.title}</p>
                                    <p className={`text-foreground/80 line-clamp-3 text-sm mb-2`}>{request.description}</p>
                                    <div className={`mb-3.5 flex flex-wrap item-center gap-2.5`}>
                                        {(Array.isArray(request.tags) ? request.tags : []).map((tag: any, index2: number) => {
                                            return (
                                                <p
                                                    onClick={() => setOpen(true)}
                                                    key={index2}
                                                    className={`px-2 py-0.5 rounded bg-accent cursor-pointer hover:bg-accent/80 transition-all text-sm text-primary`}
                                                >
                                                    #{tag.slug}
                                                </p>
                                            )
                                        })}
                                    </div>
                                    <div className={`grid grid-cols-2 gap-3.5`}>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant={`default`} className={`cursor-pointer w-full`}>View</Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader className={`flex items-center flex-row gap-5`}>
                                                    <img
                                                        src={request.creator_profile?.profile_photo || profile.profile_photo || "https://github.com/shadcn.png"}
                                                        alt="profile-photo"
                                                        className={`w-10 h-10 rounded-full`}
                                                    />
                                                    <div className={`flex flex-col justify-start items-start`}>
                                                        <p className={`text-lg font-semibold text-foreground`}>
                                                            {request.creator_profile?.name || profile.name || "You"}
                                                            <span className={`text-sm text-gray-500 font-normal`}>
                                                                {request.creator_profile?.pronouns ? ` (${request.creator_profile.pronouns})` : ""}
                                                            </span>
                                                        </p>
                                                        <p className={`text-sm text-gray-500`}>{postDate}</p>
                                                    </div>
                                                </DialogHeader>
                                                <p className={`font-semibold`}>{request.title}</p>
                                                <p className={`text-foreground/80 text-sm mb-1`}>{request.description}</p>
                                                <div className={`mb-3.5 flex flex-wrap item-center gap-2.5`}>
                                                    {(Array.isArray(request.tags) ? request.tags : []).map((tag: any, index2: number) => {
                                                        return (
                                                            <p
                                                                onClick={() => setOpen(true)}
                                                                key={index2}
                                                                className={`px-2 py-0.5 rounded bg-accent cursor-pointer hover:bg-accent/80 transition-all text-sm text-primary`}
                                                            >
                                                                #{tag.slug}
                                                            </p>
                                                        )
                                                    })}
                                                </div>
                                                <Button
                                                    variant={`secondary`}
                                                    className={`cursor-pointer w-full`}
                                                    size={`lg`}
                                                    onClick={() => handleMessage(request.creator_id)}
                                                >
                                                    Message
                                                </Button>
                                            </DialogContent>
                                        </Dialog>
                                        <Button
                                            variant={`secondary`}
                                            className={`cursor-pointer w-full`}
                                            onClick={() => handleMessage(request.creator_id)}
                                        >
                                            Message
                                        </Button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
            <Toaster position="top-right" richColors />
        </div>
    )
}