"use client"

import * as React from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  users: Array<{
    id: string
    name: string
    username?: string
    image: string | null
  }>
  max?: number
  size?: "sm" | "md" | "lg"
  onShowAll?: () => void
}

export function AvatarGroup({
  users,
  max = 3,
  size = "md",
  onShowAll,
  className,
  ...props
}: AvatarGroupProps) {
  const visibleUsers = users.slice(0, max)
  const remainingCount = users.length - max
  
  const sizeClasses = {
    sm: "size-6 -ml-2 first:ml-0",
    md: "size-8 -ml-3 first:ml-0",
    lg: "size-10 -ml-4 first:ml-0"
  }
  
  const fontSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  }
  
  const remainingSizeClasses = {
    sm: "size-6 -ml-2",
    md: "size-8 -ml-3",
    lg: "size-10 -ml-4"
  }

  return (
    <div className={cn("flex items-center", className)} {...props}>
      {visibleUsers.map((user) => (
        <Avatar 
          key={user.id} 
          className={cn(
            "border-2 border-slate-800",
            sizeClasses[size]
          )}
        >
          <AvatarImage 
            src={user.image || undefined} 
            alt={user.name || "User"} 
          />
          <AvatarFallback className={fontSizeClasses[size]}>
            {user.name?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
      ))}
      
      {remainingCount > 0 && (
        <div 
          className={cn(
            "rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-xs font-medium text-slate-300 cursor-pointer hover:bg-slate-600 transition-colors",
            remainingSizeClasses[size],
            fontSizeClasses[size]
          )}
          onClick={onShowAll}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  )
}
