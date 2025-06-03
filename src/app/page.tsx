"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAllArts, upvoteArt } from "@/lib/api";
import { ArtType, useArtsStore } from "@/lib/store";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { ArrowBigUp, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
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
    setSelectedType,
    upvoteArt: upvoteArtInStore,
  } = useArtsStore();
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [isSticky, setIsSticky] = useState(false);
  
  // Refs for intersection observer
  const headerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);

  const typeStyles: { [key: string]: string } = {
    music: "bg-pink-500/20 text-pink-300 border-pink-500/50",
    book: "bg-sky-500/20 text-sky-300 border-sky-500/50",
    movie: "bg-amber-500/20 text-amber-300 border-amber-500/50",
    misc: "bg-teal-500/20 text-teal-300 border-teal-500/50",
    default: "bg-slate-600/20 text-slate-300 border-slate-500/50",
  };

  const typeIcons: { [key: string]: string } = {
    music: "🎵",
    book: "📚",
    movie: "🎬",
    misc: "🎨",
  };

  // Intersection Observer for sticky behavior
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // When the header goes out of view (scrolled past), make controls sticky
          if (entry.target === headerRef.current) {
            setIsSticky(!entry.isIntersecting);
          }
        });
      },
      {
        threshold: 0,
        rootMargin: "0px 0px -100px 0px", // Trigger when header is 100px from top
      }
    );

    if (headerRef.current) {
      observer.observe(headerRef.current);
    }

    return () => observer.disconnect();
  }, []);

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

  // Controls component to avoid duplication
  const ControlsSection = ({ className = "" }: { className?: string }) => (
    <div className={cn("flex flex-col md:flex-row justify-between items-center gap-4", className)}>
      <div className="flex items-center gap-4">
        <Select
          value={selectedType}
          onValueChange={(value) => setSelectedType(value as ArtType | "all")}
        >
          <SelectTrigger className="w-[180px] bg-slate-800/40 border-slate-700">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800/40 border-0 backdrop-blur-2xl text-white">
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <span className="text-lg">✨</span> All Treasures
              </div>
            </SelectItem>
            <SelectItem value="music">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎵</span> Lost Music
              </div>
            </SelectItem>
            <SelectItem value="book">
              <div className="flex items-center gap-2">
                <span className="text-lg">📚</span> Hidden Books
              </div>
            </SelectItem>
            <SelectItem value="movie">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎬</span> Forgotten Films
              </div>
            </SelectItem>
            <SelectItem value="misc">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎨</span> Rare Finds
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={sortOption}
          onValueChange={(value) => setSortOption(value as SortOption)}
        >
          <SelectTrigger className="w-[140px] bg-slate-800/40 border-slate-700">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800/40 border-0 backdrop-blur-2xl text-white">
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="votes-high">Most Votes</SelectItem>
            <SelectItem value="votes-low">Least Votes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Link href="/arts/add">
        <Button className="bg-amber-500 hover:bg-amber-600 flex flex-row items-center gap-2 text-black font-medium px-5 py-2 h-auto cursor-pointer">
          <PlusIcon /> Share a Hidden Gem
        </Button>
      </Link>
    </div>
  );

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header section with ref for intersection observer */}
      <div ref={headerRef} className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-3 text-white">
          Dust <span className="text-amber-400">&</span> Gold
        </h1>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto">
          Discover and share hidden gems and forgotten treasures across music,
          books, movies, and more.
        </p>
      </div>

      {/* Sticky controls that appear when scrolled past header */}
      {isSticky && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 shadow-lg transition-all duration-300 ease-in-out">
          <div className="container mx-auto px-4 py-4">
            <ControlsSection />
          </div>
        </div>
      )}

      {/* Original controls section */}
      <div ref={controlsRef} className={cn("mb-8", isSticky && "invisible")}>
        <ControlsSection />
      </div>

      {/* Content section with padding when sticky is active */}
      <div className={cn(isSticky && "pt-4")}>
        {filteredArts.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-8 border border-slate-700/50 max-w-md mx-auto">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-xl text-slate-300 mb-3">
                No hidden treasures found
              </p>
              <p className="text-slate-400 mb-6">
                Be the first to share something amazing in this category!
              </p>
              <Link href="/arts/add" className="inline-block">
                <Button className="bg-amber-500 hover:bg-amber-600 text-black font-medium px-5 py-2 h-auto">
                  <span className="mr-2">+</span> Share a Hidden Gem
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArts.map((art) => (
              <Link
                href={art.url!}
                key={art.uuid}
                target="_blank"
                className="h-full"
              >
                <Card
                  key={art.uuid}
                  className="pt-0 h-full overflow-hidden flex flex-col bg-slate-800/60 backdrop-blur-md border border-slate-700/80 rounded-lg hover:shadow-xl hover:border-amber-500/70 transition-all duration-300 group"
                >
                  {art.image_url ? (
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <img
                        src={art.image_url}
                        alt={art.name}
                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[3/4] bg-gradient-to-br from-slate-800 to-indigo-900 flex items-center justify-center">
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

                  <div className="p-4 flex-1 flex flex-col text-slate-100">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div>
                        <h2 className="text-xl font-semibold line-clamp-2 mb-2 text-amber-300 group-hover:text-amber-200 transition-colors">
                          {art.name}
                        </h2>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold tracking-wide border",
                            typeStyles[art.type as keyof typeof typeStyles] ||
                              typeStyles.default
                          )}
                        >
                          {typeIcons[art.type as keyof typeof typeIcons]}{" "}
                          {art.type.charAt(0).toUpperCase() + art.type.slice(1)}
                        </span>
                        <p className="text-xs text-slate-400 mt-2">
                          Added: {new Date(art.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "flex items-center gap-1.5 h-8 transition-colors bg-slate-700/50 border-slate-600 hover:bg-slate-600/70",
                            art.upvoted_by?.includes(session?.user?.id || "") &&
                              "border-amber-500 text-amber-400 hover:text-amber-300 hover:border-amber-400 bg-amber-500/10"
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
                                "fill-amber-500"
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
                              className="bg-slate-700/70 text-slate-300 px-2 py-0.5 text-xs rounded-full border border-slate-600/50"
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
    </div>
  );
}