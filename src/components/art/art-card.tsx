"use client"

import type React from "react"

import type { Art } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowBigUp, Edit, Trash2, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface ArtCardProps {
  art: Art
  onUpvote?: (artId: string) => void
  onDelete?: (artId: string) => void
  onEdit?: (artId: string) => void
  isUpvotePending?: boolean
  showActions?: boolean
  className?: string
  upvotedByUser?: boolean
}

export function ArtCard({
  art,
  onUpvote,
  onDelete,
  onEdit,
  isUpvotePending = false,
  showActions = false,
  className = "",
  upvotedByUser = false,
}: ArtCardProps) {
  const { data: session } = useSession()
  const router = useRouter()

  const typeStyles: { [key: string]: string } = {
    music: "bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 border-pink-500/50",
    book: "bg-gradient-to-r from-sky-500/20 to-blue-500/20 text-sky-300 border-sky-500/50",
    movie: "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/50",
    misc: "bg-gradient-to-r from-teal-500/20 to-emerald-500/20 text-teal-300 border-teal-500/50",
    default: "bg-gradient-to-r from-slate-600/20 to-slate-500/20 text-slate-300 border-slate-500/50",
  }

  const typeIcons: { [key: string]: string } = {
    music: "🎵",
    book: "📚",
    movie: "🎬",
    misc: "🎨",
  }

  // Handle click on the card while preventing navigation when clicking on action buttons
  const handleCardClick = (e: React.MouseEvent) => {
    // If we clicked on a button or its children, don't navigate
    if ((e.target as HTMLElement).closest("button")) {
      e.preventDefault()
      return
    }

    // If the card has a URL and we're not in edit mode, navigate to it
    if (art.url && !showActions) {
      window.open(art.url, "_blank")
    }
  }

  const CardContent = (
    <Card
      className={cn(
        "pt-0 h-full overflow-hidden flex flex-col bg-slate-800/40 backdrop-blur-md border border-slate-700/60 rounded-xl hover:shadow-2xl transition-all duration-300 group",
        !showActions && art.url && "hover:border-amber-500/50 hover:shadow-amber-500/10 cursor-pointer",
        showActions && "hover:border-slate-600/80",
        className,
      )}
      onClick={handleCardClick}
    >
      {art.image_url ? (
        <div className="relative pt-0 aspect-[3/4] overflow-hidden">
          <img
            src={art.image_url || "/placeholder.svg"}
            alt={art.name}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      ) : (
        <div className="aspect-[3/4] bg-gradient-to-br from-slate-800 via-slate-700 to-indigo-900 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-purple-500/10" />
          <span className="text-6xl relative z-10">{typeIcons[art.type as keyof typeof typeIcons] || "🎨"}</span>
        </div>
      )}

      <div className="px-5 py-0 flex-1 flex flex-col">
        <div className="flex justify-between items-start gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold line-clamp-2 mb-2 text-white group-hover:text-amber-300 transition-colors">
              {art.name}
            </h2>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold tracking-wide border backdrop-blur-sm",
                typeStyles[art.type as keyof typeof typeStyles] || typeStyles.default,
              )}
            >
              {typeIcons[art.type as keyof typeof typeIcons]} {art.type.charAt(0).toUpperCase() + art.type.slice(1)}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            className={cn(
              "flex items-center gap-1.5 h-9 px-3 transition-all duration-200 bg-slate-700/50 border-slate-600 hover:bg-slate-600/70 shrink-0",
              upvotedByUser &&
                "border-amber-500 text-amber-400 hover:text-amber-300 hover:border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/20",
            )}
            onClick={(e) => {
              e.stopPropagation()
              onUpvote && session && onUpvote(art.uuid)
            }}
            disabled={!session || isUpvotePending || !onUpvote}
          >
            <ArrowBigUp
              className={cn(
                "h-4 w-4 transition-all duration-200",
                upvotedByUser && "fill-amber-500 scale-110",
              )}
            />
            <span className="font-semibold">{art.votes}</span>
          </Button>
        </div>

        {art.description && (
          <p className="text-slate-400 text-sm line-clamp-2 mb-3 leading-relaxed">{art.description}</p>
        )}

        {art.artist && art.artist.length > 0 && (
          <p className="text-sm text-slate-300 mb-3 font-medium">By {art.artist.join(", ")}</p>
        )}

        <div className="mt-auto space-y-3">
          {art.tags && art.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {art.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="bg-slate-700/60 text-slate-300 px-2.5 py-1 text-xs rounded-full border border-slate-600/50 backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
              {art.tags.length > 3 && (
                <span className="bg-slate-700/60 text-slate-400 px-2.5 py-1 text-xs rounded-full border border-slate-600/50">
                  +{art.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {showActions && (
            <div className="flex gap-2 pt-3 border-t border-slate-700/50">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-slate-700/50 border-slate-600 hover:bg-slate-600/70 hover:border-amber-500/50 transition-all duration-200"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(art.uuid)
                  }}
                >
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
              )}

              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-slate-700/50 border-slate-600 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 transition-all duration-200"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(art.uuid)
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              )}

              {art.url && (
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-slate-700/50 border-slate-600 hover:bg-slate-600/70 hover:border-amber-500/50 transition-all duration-200"
                  onClick={(e) => {
                    e.stopPropagation()
                    window.open(art.url!, "_blank")
                  }}
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="sr-only">Visit</span>
                </Button>
              )}
            </div>
          )}

          <p className="text-xs text-slate-500">Added {new Date(art.created_at).toLocaleDateString()}</p>
        </div>
      </div>
    </Card>
  )

  // If we're not showing actions and the art has a URL, wrap it in a link
  if (!showActions && art.url) {
    return <div className="h-full">{CardContent}</div>
  }

  // Otherwise, just return the card
  return CardContent
}
