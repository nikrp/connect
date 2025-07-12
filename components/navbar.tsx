"use client"

import { Computer, Globe, LogOut, Menu, MessageCircle, Moon, Plus, Sun, User } from "lucide-react";
import { Button } from "./ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "./ui/drawer";

export default function Navbar() {
    return (
        <div className={`w-full py-3.5 px-3.5 border-b border-b-border flex items-center gap-5`}>
            <div className={`lg:hidden`} id={`hamburgerMenu`}>
                <Drawer direction={`left`}>
                    <DrawerTrigger asChild>
                        <Button variant={`outline`} size={`icon`} className={`cursor-pointer`}><Menu /></Button>
                    </DrawerTrigger>
                    <DrawerContent>
                        <DrawerHeader className={`flex items-center justify-between`}>
                            <DrawerTitle>Connect</DrawerTitle>
                            <DrawerClose />
                        </DrawerHeader>
                        <div></div>
                    </DrawerContent>
                </Drawer>
            </div>
            <p className={`text-2xl font-semibold font-sans text-foreground mr-auto`}>Connect</p>
            <div className={`hidden lg:flex items-center gap-8.5 ml-auto mr-7.5`}>
                <p className={`text-base font-medium cursor-pointer flex items-center gap-1.5`}>Explore</p>
                <p className={`text-base font-medium cursor-pointer flex items-center gap-1.5`}>Create</p>
                <p className={`text-base font-medium cursor-pointer flex items-center gap-1.5`}>Messages</p>
                <p className={`text-base font-medium cursor-pointer flex items-center gap-1.5`}>Profile</p>
            </div>
            <div className={`flex items-center gap-2.5`}>
                <Button variant={`outline`} size={`icon`} className={`cursor-pointer`}><Computer /></Button>
                <Button variant={`destructive`} size={`default`} className={`cursor-pointer`}><LogOut />Logout</Button>
            </div>
        </div>
    )
}