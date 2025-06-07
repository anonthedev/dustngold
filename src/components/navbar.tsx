"use client"

import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronDown, LogOut, User, Plus, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"

export function Navbar() {
  const { data: session } = useSession()
  const router = useRouter()

  return (
    <nav className="w-full py-4 px-6 flex justify-between items-center bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <Sparkles className="h-6 w-6 text-amber-400 group-hover:text-amber-300 transition-colors" />
            <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-lg group-hover:bg-amber-300/30 transition-all" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
            Dust & Gold
          </span>
        </Link>

        {/* Navigation links for larger screens */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">
            Discover
          </Link>
          {session?.user && (
            <Link href="/profile" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">
              My Collection
            </Link>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {session?.user ? (
          <>
            <Button
              onClick={() => router.push("/arts/add")}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-medium shadow-lg hover:shadow-xl transition-all duration-200 hidden sm:flex"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Art
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 hover:bg-white/10 transition-colors">
                  <div className="flex items-center">
                    {session.user.image ? (
                      <div className="relative">
                        <img
                          src={session.user.image || "/placeholder.svg"}
                          alt={session.user.name || "Profile"}
                          className="w-8 h-8 rounded-full mr-2 ring-2 ring-amber-400/50"
                        />
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400/20 to-transparent mr-2" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center mr-2 text-black font-semibold">
                        {session.user.name?.charAt(0) || "U"}
                      </div>
                    )}
                    <span className="mr-1 hidden sm:block">{session.user.name}</span>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-slate-900/95 backdrop-blur-xl border-slate-700">
                <div className="px-2 py-1.5 text-sm text-slate-400">{session.user.email}</div>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer sm:hidden">
                  <Link href="/arts/add" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Add Art</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex items-center gap-2 cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <Button
            asChild
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-medium shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Link href="/login">Sign in</Link>
          </Button>
        )}
      </div>
    </nav>
  )
}
