"use client"

import { Computer, LogOut, LogOutIcon, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { useSidebar } from "./ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export default function Navbar() {
    const { toggleSidebar, isMobile } = useSidebar();

    return (
        <div className={`w-full py-3.5 pb-5 flex items-center gap-5 mb-2`}>
            <div className={`${!isMobile && `hidden`}`} id={`hamburgerMenu`}>
                <Button onClick={toggleSidebar} variant={`outline`} size={`icon`} className={`cursor-pointer`}><Menu /></Button>
            </div>
            <p className={`text-2xl font-semibold font-sans text-foreground mr-auto`}>Connect</p>
            
            <div className={`flex items-center gap-3.5`}>
                <Button variant={`outline`} size={`icon`} className={`cursor-pointer`}><Computer /></Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild className={`cursor-pointer hover:bg-foreground/10 transition-all p-2 ${isMobile ? `rounded-full` : `rounded-lg`}`}>
                        <div className={`flex flex-row-reverse items-center gap-2.5`}>
                            <div className={`${isMobile && `hidden`}`}>
                                <p className={`text-sm`}>Nikhil Pellakuru</p>
                                <p className={`text-xs text-foreground/80`}>Student</p>
                            </div>
                            <Avatar>
                                <AvatarImage src={`https://github.com/nikrp.png`} />
                                <AvatarFallback>Nikhil Pellakuru</AvatarFallback>
                            </Avatar>
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
                            <DropdownMenuItem variant={`destructive`} className={`flex items-center gap-2 cursor-pointer`}><LogOutIcon /> Log out</DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}