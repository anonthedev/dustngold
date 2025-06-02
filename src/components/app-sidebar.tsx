"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArtType, useArtsStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  Music,
  Book,
  Film,
  Layers,
  LogOut,
  LogIn,
  User as UserIcon,
} from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppSidebar() {
  const pathname = usePathname();
  const { selectedType, setSelectedType } = useArtsStore();
  const { data: session, status } = useSession();

  return (
    <Sidebar>
      <SidebarHeader className="flex flex-row items-center justify-between px-4">
        <h2 className="text-xl font-bold">Dust & Gold</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setSelectedType("all")}
                isActive={selectedType === "all"}
              >
                <Layers className="mr-2" />
                All
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setSelectedType("music")}
                isActive={selectedType === "music"}
              >
                <Music className="mr-2" />
                Music
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setSelectedType("book")}
                isActive={selectedType === "book"}
              >
                <Book className="mr-2" />
                Books
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setSelectedType("movie")}
                isActive={selectedType === "movie"}
              >
                <Film className="mr-2" />
                Movies
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setSelectedType("misc")}
                isActive={selectedType === "misc"}
              >
                <Layers className="mr-2" />
                Misc
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="px-4 py-2">
        {status === "authenticated" && session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {session.user.name || "User"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {session.user.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        ) : (
          <Button onClick={() => signIn()} variant="outline" className="w-full">
            <LogIn className="mr-2 h-4 w-4" />
            <span>Log in</span>
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
