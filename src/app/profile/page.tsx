"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { UserProfile } from "@/components/profile/user-profile"
import { UserArts } from "@/components/profile/user-arts"
import { Loader2, User } from "lucide-react"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated") {
      setIsLoading(false)
    }
  }, [status, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-400 mx-auto mb-4" />
          <p className="text-slate-400">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="relative">
            <User className="h-8 w-8 text-amber-400" />
            <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-lg" />
          </div>
          <h1 className="text-3xl font-bold text-white">Your Profile</h1>
        </div>

        <div className="space-y-12">
          {/* User Profile Section */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-6">Profile Information</h2>
            <UserProfile user={session?.user} />
          </section>

          {/* User Arts Section */}
          <section>
            <UserArts userId={session?.user?.id} />
          </section>
        </div>
      </div>
    </div>
  )
}
