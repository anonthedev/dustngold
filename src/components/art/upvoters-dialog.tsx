"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"

export interface UpvoterUser {
  id: string
  name: string
  username?: string
  image: string | null
}

interface UpvotersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  upvoters: UpvoterUser[]
  artName: string
}

export function UpvotersDialog({
  open,
  onOpenChange,
  upvoters,
  artName
}: UpvotersDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            People who upvoted "{artName}"
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] mt-4">
          <div className="space-y-3 p-1">
            {upvoters.length > 0 ? (
              upvoters.map((user) => (
                <Link
                  href={`/${user.username || '#'}`}
                  key={user.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
                >
                  <Avatar className="border border-slate-700">
                    <AvatarImage src={user.image || undefined} alt={user.name} />
                    <AvatarFallback>
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-slate-200">{user.name}</p>
                    {user.username && (
                      <p className="text-sm text-slate-400">@{user.username}</p>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-center text-slate-400 py-4">No upvotes yet</p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
