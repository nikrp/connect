"use client"

import { Computer, LogOutIcon, Menu, Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";
import { useSidebar } from "./ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { AuthUser } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { Skeleton } from "./ui/skeleton";
import { useTheme } from "next-themes";

export default function Navbar() {
    const { toggleSidebar, isMobile } = useSidebar();
    const { user, profile, setUser, setProfile }: { user: AuthUser, profile: any, setUser: (user: AuthUser) => void, setProfile: (profile: any) => void } = useUser();
    const supabase = createClient();
    const router = useRouter();
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        async function collectProfilePhoto() {
            const path = `${user.id}/profile_photo`;
            const { data: sData, error: sError } = await supabase.storage.from('profile-photos').createSignedUrl(path, 31536000);

            if (sError) {
                console.error("Error downloading profile photo from Supabase storage:", sError);
            } else {
                setProfile((prev: any) => ({ ...prev, profile_photo: sData.signedUrl }));
                localStorage.setItem('profile_photo', sData.signedUrl);
                console.log(profile);
            }
        }

        collectProfilePhoto();
    }, [])

    function isValidUrl(url?: string) {
        if (!url) return false;
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      }

    return (
        <div className={`w-full py-3.5 pb-5 flex items-center gap-5 mb-2`}>
            <div className={`${!isMobile && `hidden`}`} id={`hamburgerMenu`}>
                <Button onClick={toggleSidebar} variant={`outline`} size={`icon`} className={`cursor-pointer`}><Menu /></Button>
            </div>
            <p className={`text-2xl font-semibold font-sans text-foreground mr-auto`}>Connect</p>
            
            <div className={`flex items-center gap-3.5`}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant={`outline`} size={`icon`} className={`cursor-pointer`}>{theme === 'system' ? <Computer /> : theme === 'light' ? <Sun /> : <Moon />}</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuGroup>
                            <DropdownMenuLabel className={`text-sm text-foreground/60`}>Themes</DropdownMenuLabel>
                            <DropdownMenuItem className={`cursor-pointer`} onClick={() => setTheme("system")}>System</DropdownMenuItem>
                            <DropdownMenuItem className={`cursor-pointer`} onClick={() => setTheme("light")}>Light</DropdownMenuItem>
                            <DropdownMenuItem className={`cursor-pointer`} onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild className={`cursor-pointer hover:bg-foreground/10 transition-all p-2 ${isMobile ? `rounded-full` : `rounded-lg`}`}>
                        <div className={`flex flex-row-reverse items-center gap-2.5`}>
                            <div className={`${isMobile && `hidden`}`}>
                                <p className={`text-sm`}>Nikhil Pellakuru</p>
                                <p className={`text-xs text-foreground/80`}>Student</p>
                            </div>
                            {isValidUrl(profile.profile_photo) ? (
                                <Avatar>
                                    <AvatarImage src={`${profile.profile_photo}`} />
                                    <AvatarFallback>NP</AvatarFallback>
                                </Avatar>
                            ) : (
                                <>
                                    <Skeleton className={`w-8 h-8 rounded-full`} />
                                </>
                            )}
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuGroup>
                            <DropdownMenuLabel className={`text-sm text-foreground/60`}>My Account</DropdownMenuLabel>
                            <DropdownMenuItem className={`cursor-pointer`}>Profile</DropdownMenuItem>
                            <DropdownMenuItem className={`cursor-pointer`}>Settings</DropdownMenuItem>
                            <DropdownMenuItem className={`cursor-pointer`}>Keyboard Shortcuts</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className={`cursor-pointer`}>Support</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => supabase.auth.signOut().then((error) => {router.push("/")}).catch(error => {console.error("Error signing out:", error)})} variant={`destructive`} className={`flex items-center gap-2 cursor-pointer`}><LogOutIcon /> Log out</DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}