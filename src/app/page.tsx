"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAllArts, upvoteArt } from "@/lib/api";
import { ArtType, useArtsStore } from "@/lib/store";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { ArrowBigUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortOption = "newest" | "votes-high" | "votes-low";

export default function ArtsPage() {
  const { data: session } = useSession();
  const {
    arts,
    setArts,
    selectedType,
    upvoteArt: upvoteArtInStore,
  } = useArtsStore();
  const [sortOption, setSortOption] = useState<SortOption>("newest");

  // Fetch all arts
  const { data, isLoading, error } = useQuery({
    queryKey: ["arts"],
    queryFn: getAllArts,
  });

  // Set arts in the store when data is fetched
  useEffect(() => {
    if (data) {
      setArts(data);
    }
  }, [data, setArts]);

  // Upvote mutation
  const upvoteMutation = useMutation({
    mutationFn: upvoteArt,
    onSuccess: (data) => {
      upvoteArtInStore(data);
      const isUpvoted = data.upvoted_by?.includes(session?.user?.id || "");
      toast.success(isUpvoted ? "Upvoted successfully!" : "Upvote removed");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to update vote"
      );
    },
  });

  // Filter arts by selected type
  let filteredArts =
    selectedType === "all"
      ? arts
      : arts.filter((art) => art.type === selectedType);

  // Sort the filtered arts
  filteredArts = [...filteredArts].sort((a, b) => {
    if (sortOption === "votes-high") {
      return Number(b.votes) - Number(a.votes);
    } else if (sortOption === "votes-low") {
      return Number(a.votes) - Number(b.votes);
    } else {
      // Default sort by newest (created_at)
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="pt-0 overflow-hidden">
              <div className="h-48 bg-gray-200 dark:bg-gray-800 animate-pulse" />
              <div className="p-6 space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3 animate-pulse" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        Error: {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">
            {selectedType === "all"
              ? "All Arts"
              : selectedType === "music"
              ? "Music"
              : selectedType === "book"
              ? "Books"
              : selectedType === "movie"
              ? "Movies"
              : "Miscellaneous"}
          </h1>

          <Select
            value={sortOption}
            onValueChange={(value) => setSortOption(value as SortOption)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="votes-high">Most Votes</SelectItem>
              <SelectItem value="votes-low">Least Votes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Link href="/arts/add">
          <Button>Add New Art</Button>
        </Link>
      </div>

      {filteredArts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">No arts found</p>
          <Link href="/arts/add" className="mt-4 inline-block">
            <Button className="cursor-pointer">Add New Art</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArts.map((art) => (
            <Link href={art.url!} key={art.uuid} target="_blank" className="h-full">
              <Card
                key={art.uuid}
                className="pt-0 h-full overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-200"
              >
                {art.image_url ? (
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={art.image_url}
                      alt={art.name}
                      className="object-cover w-full h-full transition-transform duration-200 hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                    <span className="text-5xl">
                      {art.type === "music"
                        ? "🎵"
                        : art.type === "book"
                        ? "📚"
                        : art.type === "movie"
                        ? "🎬"
                        : "🎨"}
                    </span>
                  </div>
                )}

                <div className="px-4 flex-1 flex flex-col">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div>
                      <h2 className="text-lg font-bold line-clamp-2 mb-1.5">
                        {art.name}
                      </h2>
                      <span className="inline-block bg-primary/10 text-muted-foreground text-xs px-2 py-1 rounded-md uppercase font-semibold tracking-wide">
                        {art.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "flex items-center gap-1.5 h-8 transition-colors",
                          art.upvoted_by?.includes(session?.user?.id || "") &&
                            "border-green-500 text-green-500 hover:text-green-500 hover:border-green-600"
                        )}
                        onClick={() =>
                          session && upvoteMutation.mutate(art.uuid)
                        }
                        disabled={!session || upvoteMutation.isPending}
                      >
                        <ArrowBigUp
                          className={cn(
                            "h-5 w-5 transition-colors",
                            art.upvoted_by?.includes(session?.user?.id || "") &&
                              "fill-green-500"
                          )}
                        />
                        <span className="font-medium">{art.votes}</span>
                      </Button>
                    </div>
                  </div>

                  {art.description && (
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
                      {art.description}
                    </p>
                  )}

                  {art.artist && art.artist.length > 0 && (
                    <p className="text-sm text-muted-foreground mb-2">
                      By {art.artist.join(", ")}
                    </p>
                  )}

                  <div className="mt-auto space-y-2">
                    {art.tags && art.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {art.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-secondary text-secondary-foreground px-1.5 py-0.5 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
