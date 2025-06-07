"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Art } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Plus, Palette } from "lucide-react"
import { ArtCard } from "@/components/art/art-card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface UserArtsProps {
  userId: string | undefined
}

export function UserArts({ userId }: UserArtsProps) {
  const [arts, setArts] = useState<Art[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!userId) return

    const fetchUserArts = async () => {
      try {
        const response = await fetch(`/api/arts?profile=true`)

        if (!response.ok) {
          throw new Error("Failed to fetch your arts")
        }

        const data = await response.json()
        setArts(data)
      } catch (error) {
        toast.error("Error", {
          description: error instanceof Error ? error.message : "Failed to load your arts",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserArts()
  }, [userId])

  const handleDelete = async (artId: string) => {
    try {
      const response = await fetch(`/api/arts/${artId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete art")
      }

      // Remove the deleted art from the state
      setArts(arts.filter((art) => art.uuid !== artId))
      toast.success("Art deleted successfully")
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to delete art",
      })
    } finally {
      setDeleteId(null)
    }
  }

  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-28" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-800/30 rounded-xl overflow-hidden animate-pulse">
              <div className="aspect-[3/4] bg-slate-700/50" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 flex-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (arts.length === 0) {
    return (
      <div>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold text-white">Your Collection</h2>
          <Button
            onClick={() => router.push("/arts/add")}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-medium shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Art
          </Button>
        </div>

        <div className="text-center py-20 bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50">
          <div className="max-w-md mx-auto">
            <div className="relative inline-block mb-6">
              <Palette className="h-16 w-16 text-amber-400 mx-auto" />
              <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-xl" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3">Start Your Collection</h3>
            <p className="text-slate-400 mb-8 leading-relaxed">
              You haven't shared any hidden Arts yet. Start building your collection of amazing discoveries!
            </p>
            <Button
              onClick={() => router.push("/arts/add")}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Share Your First Art
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-white">Your Collection</h2>
          <p className="text-slate-400 mt-1">{arts.length} hidden Arts discovered</p>
        </div>
        <Button
          onClick={() => router.push("/arts/add")}
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-medium shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Art
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {arts.map((art) => (
          <ArtCard
            key={art.uuid}
            art={art}
            showActions={true}
            onEdit={(artId) => router.push(`/arts/edit/${artId}`)}
            onDelete={(artId) => setDeleteId(artId)}
          />
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open: boolean) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-slate-800/95 backdrop-blur-xl border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This action cannot be undone. This will permanently delete your hidden Art from the collection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
