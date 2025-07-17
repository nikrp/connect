"use client"

import AppSidebar from "@/components/app-sidebar";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import React, { useState } from "react";

const requests = [
    {
        title: "Looking for ML + Bio partner for ISEF",
        profilePhoto: "https://github.com/shadcn.png",
        name: "Shadcn",
        pronouns: "he/him",
        postDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleString('en-US', { 
            timeZone: 'America/Los_Angeles',
            month: 'numeric',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
            timeZoneName: 'short'
        }),
        grade: "10th Grade",
        school: "Monta Vista High School",
        skillsNeeded: ["biology", "machine-learning", "fun"],
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    },
    {
        title: "Looking for ML + Bio partner for ISEF",
        profilePhoto: "https://github.com/shadcn.png",
        name: "Shadcn",
        pronouns: "he/him",
        postDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleString('en-US', { 
            timeZone: 'America/Los_Angeles',
            month: 'numeric',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
            timeZoneName: 'short'
        }),
        grade: "10th Grade",
        school: "Monta Vista High School",
        skillsNeeded: ["biology", "machine-learning"],
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    }
]

export default function Requests() {
    const [search, setSearch] = useState("");
    const [filteredRequests, setFilteredRequests] = useState<typeof requests>([])

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);

        // Filter based on tags
    }

    return (
        <div className={``}>
            <SidebarProvider open={false} defaultOpen={false}>
                {/* <Navbar /> */}
                <AppSidebar />
                <div className={`mt-2 w-11/12 mx-auto`}>
                    <Input value={search} onChange={onChange} placeholder={`Search with tags (machine-learning, bio, biology, etc.)`} className={`mb-3 w-full text-sm`} />
                    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-3`}>
                        {requests.map((request, index) => {
                            return (
                                <div key={index} className={`border rounded-lg p-3.5`}>
                                    <div className={`flex gap-5`}>
                                        <img src={request.profilePhoto} alt="profile-photo" className={`w-10 h-10 rounded-full`} />
                                        <div className={`flex flex-col`}>
                                            <p className={`text-lg font-semibold text-foreground`}>{request.name} <span className={`text-sm text-gray-500 font-normal`}>{request.pronouns}</span></p>
                                            <p className={`text-sm text-gray-500`}>{request.postDate}</p>
                                        </div>
                                    </div>
                                    <p className={`font-semibold mt-3.5 mb-2`}>{request.title}</p>
                                    <p className={`text-foreground/80 line-clamp-3 text-sm mb-2`}>{request.description}</p>
                                    <div className={`mb-3.5 flex flex-wrap item-center gap-2.5`}>
                                        {request.skillsNeeded.map((skill, index2) => {
                                            return (
                                                <p onClick={() => setSearch((currValue) => currValue + ", " + skill)} key={index2} className={`px-2 py-0.5 rounded bg-accent cursor-pointer hover:bg-accent/80 transition-all text-sm text-primary`}>#{skill}</p>
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
                                                    <img src={request.profilePhoto} alt="profile-photo" className={`w-10 h-10 rounded-full`} />
                                                    <div className={`flex flex-col justify-start items-start`}>
                                                        <p className={`text-lg font-semibold text-foreground`}>{request.name} <span className={`text-sm text-gray-500 font-normal`}>{request.pronouns}</span></p>
                                                        <p className={`text-sm text-gray-500`}>{request.postDate}</p>
                                                    </div>
                                                </DialogHeader>
                                                <p className={`font-semibold`}>{request.title}</p>
                                                <p className={`text-foreground/80 text-sm mb-1`}>{request.description}</p>
                                                <div className={`mb-3.5 flex flex-wrap item-center gap-2.5`}>
                                                    {request.skillsNeeded.map((skill, index2) => {
                                                        return (
                                                            <p onClick={() => setSearch((currValue) => currValue + ", " + skill)} key={index2} className={`px-2 py-0.5 rounded bg-accent cursor-pointer hover:bg-accent/80 transition-all text-sm text-primary`}>#{skill}</p>
                                                        )
                                                    })}
                                                </div>
                                                <Button variant={`secondary`} className={`cursor-pointer w-full`} size={`lg`}>Message</Button>
                                            </DialogContent>
                                        </Dialog>
                                        <Button variant={`secondary`} className={`cursor-pointer w-full`}>Message</Button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </SidebarProvider>
        </div>
    )
}