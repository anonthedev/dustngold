"use client"

import type React from "react"

import { useState } from "react"
import type { User } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, Save, UserIcon } from "lucide-react"

interface UserProfileProps {
  user: User | undefined
}

export function UserProfile({ user }: UserProfileProps) {
  const [username, setUsername] = useState(user?.username || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim()) {
      toast.error("Username required", {
        description: "Please enter a username",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      })

      console.log(await response.json())

      if (!response.ok) {
        throw new Error("Failed to update username")
      }

      toast.success("Profile updated", {
        description: "Your username has been updated successfully",
      })
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to update profile",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="bg-slate-800/40 backdrop-blur-md border border-slate-700/60 shadow-xl">
      <CardContent className="p-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="flex-shrink-0">
            {user?.image ? (
              <div className="relative h-24 w-24 rounded-full overflow-hidden ring-4 ring-amber-400/30">
                <img
                  src={user.image || "/placeholder.svg"}
                  alt={user.name || "User"}
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-amber-400/20 to-transparent" />
              </div>
            ) : (
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center ring-4 ring-amber-400/30">
                <UserIcon className="h-12 w-12 text-black" />
              </div>
            )}
          </div>

          <div className="flex-grow flex flex-col gap-4">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-white">{user?.name}</h3>
              <p className="text-slate-400">{user?.email}</p>
            </div>

            <form onSubmit={handleUpdateUsername} className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-300">
                  Username
                </Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Set your username"
                  className="bg-slate-700/50 border-slate-600 focus:border-amber-500/50 focus:ring-amber-500/20"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-fit bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Username
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
