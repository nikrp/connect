import { ListIcon, SearchIcon, Settings, User } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "./ui/sidebar";
import Link from "next/link";

export default function AppSidebar() {
    const { isMobile } = useSidebar();
    const menuLayout = `lg:block flex items-start ${isMobile ? `pl-5 gap-5` : `pl-0 gap-0`}`;

    return (
        <Sidebar variant={`floating`} side={`left`} collapsible={`icon`}>
            <SidebarHeader></SidebarHeader>
            <SidebarContent>
                <SidebarMenu className={menuLayout}>
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
                        <SidebarMenuButton asChild size={`lg`} className={`p-0 cursor-pointer`} tooltip={`Profile`}>
                            <Link href="/profile">
                                <User className={`hover:bg-none size-6`} />
                                <span className={`md:hidden`}>Profile</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem className={`p-0`}>
                        <SidebarMenuButton asChild size={`lg`} className={`p-0 cursor-pointer`} tooltip={`Settings`}>
                            <Link href="/settings">
                                <Settings className={`hover:bg-none size-6`} />
                                <span className={`md:hidden`}>Settings</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
            </SidebarFooter>
        </Sidebar>
    )
}