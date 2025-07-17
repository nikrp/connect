import { BookmarkIcon, MessageCircle, MessageCircleIcon, PlusIcon, SearchIcon } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";

export default function AppSidebar() {
    return (
        <Sidebar variant={`floating`} side={`left`} collapsible={`icon`}>
            <SidebarHeader></SidebarHeader>
            <SidebarContent>
                <SidebarMenu className={``}>
                    <SidebarMenuItem className={`p-0`}>
                        <SidebarMenuButton size={`lg`} className={`p-0 cursor-pointer`} tooltip={`Explore`}>
                            <SearchIcon className={`hover:bg-none size-6`} />
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem className={`p-0`}>
                        <SidebarMenuButton size={`lg`} className={`p-0 cursor-pointer`} tooltip={`Create Post`}>
                            <PlusIcon className={`hover:bg-none size-6`} />
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem className={`p-0`}>
                        <SidebarMenuButton size={`lg`} className={`p-0 cursor-pointer`} tooltip={`Messages`}>
                            <MessageCircleIcon className={`hover:bg-none size-6`} />
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem className={`p-0`}>
                        <SidebarMenuButton size={`lg`} className={`p-0 cursor-pointer`} tooltip={`Saved`}>
                            <BookmarkIcon className={`hover:bg-none size-6`} />
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter></SidebarFooter>
        </Sidebar>
    )
}