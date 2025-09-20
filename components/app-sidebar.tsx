import { BookmarkIcon, ListIcon, MessageCircleIcon, PlusIcon, SearchIcon } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "./ui/sidebar";
import Link from "next/link";

export default function AppSidebar() {
    const { isMobile } = useSidebar();

    return (
        <Sidebar variant={`floating`} side={`left`} collapsible={`icon`}>
            <SidebarHeader></SidebarHeader>
            <SidebarContent>
                <SidebarMenu className={`lg:block flex items-start ${isMobile ? `pl-5 gap-5` : `pl-0 gap-0`}`}>
                    <SidebarMenuItem className={`p-0`}>
                        <SidebarMenuButton asChild size={`lg`} className={`p-0 cursor-pointer`} tooltip={`Explore`}>
                            <Link href="/requests">
                                <SearchIcon className={`hover:bg-none size-6`} />
                                <span className={`md:hidden`}>Explore</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem className={`p-0`}>
                        <SidebarMenuButton asChild size={`lg`} className={`p-0 cursor-pointer`} tooltip={`My Posts`}>
                            <Link href="/requests/posts">
                                <ListIcon className={`hover:bg-none size-6`} />
                                <span className={`md:hidden`}>My Posts</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem className={`p-0`}>
                        <SidebarMenuButton asChild size={`lg`} className={`p-0 cursor-pointer`} tooltip={`Messages`}>
                            <Link href="/messages">
                                <MessageCircleIcon className={`hover:bg-none size-6`} />
                                <span className={`md:hidden`}>Messages</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem className={`p-0`}>
                        <SidebarMenuButton asChild size={`lg`} className={`p-0 cursor-pointer`} tooltip={`Saved`}>
                            <Link href="/saved">
                                <BookmarkIcon className={`hover:bg-none size-6`} />
                                <span className={`md:hidden`}>Saved Posts</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter></SidebarFooter>
        </Sidebar>
    )
}