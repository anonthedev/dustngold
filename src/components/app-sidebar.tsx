"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArtType, useArtsStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { PlusCircle, Music, Book, Film, Layers } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  const pathname = usePathname()
  const { selectedType, setSelectedType } = useArtsStore()
  
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
    </Sidebar>
  )
}