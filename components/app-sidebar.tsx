import { BookmarkIcon, ListIcon, MessageCircleIcon, PlusIcon, SearchIcon } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "./ui/sidebar";

export default function AppSidebar() {
    const { isMobile } = useSidebar();

    return (
        <Sidebar variant={`floating`} side={`left`} collapsible={`icon`}>
            <SidebarHeader></SidebarHeader>
            <SidebarContent>
                <SidebarMenu className={`lg:block flex items-start ${isMobile ? `pl-5 gap-5` : `pl-0 gap-0`}`}>
                    <SidebarMenuItem className={`p-0`}>
                        <SidebarMenuButton size={`lg`} className={`p-0 cursor-pointer`} tooltip={`Explore`}>
                            <SearchIcon className={`hover:bg-none size-6`} />
                            <span className={`md:hidden`}>Explore</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem className={`p-0`}>
                        <SidebarMenuButton size={`lg`} className={`p-0 cursor-pointer`} tooltip={`Create Post`}>
                            <ListIcon className={`hover:bg-none size-6`} />
                            <span className={`md:hidden`}>My Posts</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem className={`p-0`}>
                        <SidebarMenuButton size={`lg`} className={`p-0 cursor-pointer`} tooltip={`Messages`}>
                            <MessageCircleIcon className={`hover:bg-none size-6`} />
                            <span className={`md:hidden`}>Messages</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem className={`p-0`}>
                        <SidebarMenuButton size={`lg`} className={`p-0 cursor-pointer`} tooltip={`Saved`}>
                            <BookmarkIcon className={`hover:bg-none size-6`} />
                            <span className={`md:hidden`}>Saved Posts</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter></SidebarFooter>
        </Sidebar>
    )
}