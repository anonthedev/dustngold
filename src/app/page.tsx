"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAllArts, upvoteArt } from "@/lib/api";
import { type ArtType, useArtsStore } from "@/lib/store";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  ArrowBigUp,
  PlusIcon,
  Search,
  TrendingUp,
  Clock,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArtCard } from "@/components/art/art-card";
import { supabaseClient } from "@/lib/supabase";
import { SearchInput } from "@/components/art/search-input";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [isSticky, setIsSticky] = useState(false);
  const [userUpvotes, setUserUpvotes] = useState<string[]>([]);

  // Refs for intersection observer
  const headerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for sticky behavior
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === headerRef.current) {
            setIsSticky(!entry.isIntersecting);
          }
        });
      },
      {
        threshold: 0,
        rootMargin: "0px 0px -100px 0px",
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

  // Fetch user's upvotes when they're logged in
  useEffect(() => {
    async function fetchUserUpvotes() {
      if (!session?.supabaseAccessToken) return;

      const supabase = supabaseClient(session.supabaseAccessToken);
      const { data } = await supabase
        .from("art_votes")
        .select("art_id")
        .eq("user_id", session.user.id);

      if (data) {
        setUserUpvotes(data.map((vote) => vote.art_id));
      }
    }

    fetchUserUpvotes();
  }, [session]);

  // SearchInput component handles debouncing internally

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
      // Find the art in the store and update it with the new vote count
      const artToUpdate = arts.find((art) => art.uuid === data.uuid);
      if (artToUpdate) {
        const updatedArt = {
          ...artToUpdate,
          votes: data.votes,
        };
        upvoteArtInStore(updatedArt);
      }

      // Update the user's upvotes state
      if (data.upvoted) {
        setUserUpvotes((prev) => [...prev, data.uuid]);
      } else {
        setUserUpvotes((prev) => prev.filter((id) => id !== data.uuid));
      }

      toast.success(data.upvoted ? "Upvoted successfully!" : "Upvote removed");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to update vote"
      );
    },
  });

  // Filter and search arts
  let filteredArts = arts;

  // Filter by type
  if (selectedType !== "all") {
    filteredArts = filteredArts.filter((art) => art.type === selectedType);
  }

  // Filter by search query
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredArts = filteredArts.filter(
      (art) =>
        art.name.toLowerCase().includes(query) ||
        art.description?.toLowerCase().includes(query) ||
        art.artist?.some((artist) => artist.toLowerCase().includes(query)) ||
        art.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  }

  // Sort the filtered arts
  filteredArts = [...filteredArts].sort((a, b) => {
    if (sortOption === "votes-high") {
      return Number(b.votes) - Number(a.votes);
    } else if (sortOption === "votes-low") {
      return Number(a.votes) - Number(b.votes);
    } else {
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="text-center mb-10">
            <div className="h-12 bg-slate-800/50 rounded-lg w-64 mx-auto mb-4" />
            <div className="h-6 bg-slate-800/50 rounded-lg w-96 mx-auto" />
          </div>

          {/* Controls skeleton */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="h-10 bg-slate-800/50 rounded-lg w-40" />
              <div className="h-10 bg-slate-800/50 rounded-lg w-32" />
            </div>
            <div className="h-10 bg-slate-800/50 rounded-lg w-48" />
          </div>

          {/* Grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card
                key={i}
                className="overflow-hidden bg-slate-800/30 border-slate-700/50"
              >
                <div className="aspect-[3/4] bg-slate-800/50" />
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-slate-800/50 rounded w-3/4" />
                  <div className="h-4 bg-slate-800/50 rounded w-1/2" />
                  <div className="h-4 bg-slate-800/50 rounded w-full" />
                  <div className="h-4 bg-slate-800/50 rounded w-2/3" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-slate-400 mb-6">{(error as Error).message}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header section with ref for intersection observer */}
      <div ref={headerRef} className="mb-12 text-center">
        <div className="relative inline-block">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
            Dust <span className="text-amber-400">&</span> Gold
          </h1>
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-amber-500/20 blur-3xl -z-10" />
        </div>
        <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Discover and share hidden Arts and forgotten treasures across music,
          books, movies, and more. Unearth the extraordinary in the overlooked.
        </p>

        {/* Stats */}
        <div className="flex justify-center gap-8 mt-8 text-sm text-slate-400">
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400">
              {arts.length}
            </div>
            <div>Arts Found</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400">
              {arts.reduce((sum, art) => sum + art.votes, 0)}
            </div>
            <div>Total Votes</div>
          </div>
        </div>
      </div>

      <div className={cn("mb-8", isSticky && "invisible")}>
        <div className="space-y-4">
          {/* Search bar */}
          <div className="max-w-md">
            <SearchInput
              placeholder="Search Arts..."
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Select
                  value={selectedType}
                  onValueChange={(value) =>
                    setSelectedType(value as ArtType | "all")
                  }
                >
                  <SelectTrigger className="w-[180px] bg-slate-800/40 border-slate-700">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800/95 backdrop-blur-xl border-slate-700 text-white">
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
              </div>

              <Select
                value={sortOption}
                onValueChange={(value) => setSortOption(value as SortOption)}
              >
                <SelectTrigger className="w-[140px] bg-slate-800/40 border-slate-700">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800/95 backdrop-blur-xl border-slate-700 text-white">
                  <SelectItem value="newest">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Newest
                    </div>
                  </SelectItem>
                  <SelectItem value="votes-high">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Most Votes
                    </div>
                  </SelectItem>
                  <SelectItem value="votes-low">
                    <div className="flex items-center gap-2">
                      <ArrowBigUp className="h-4 w-4" />
                      Least Votes
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Link href="/arts/add">
              <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-medium shadow-lg hover:shadow-xl transition-all duration-200">
                <PlusIcon className="h-4 w-4 mr-2" />
                Share a Hidden Art
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content section with padding when sticky is active */}
      <div className={cn(isSticky && "pt-32")}>
        {filteredArts.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-12 border border-slate-700/50 max-w-lg mx-auto">
              <div className="text-6xl mb-6">🔍</div>
              <h3 className="text-2xl font-semibold text-white mb-3">
                {searchQuery ? "No matches found" : "No hidden treasures found"}
              </h3>
              <p className="text-slate-400 mb-8 leading-relaxed">
                {searchQuery
                  ? `No Arts match "${searchQuery}". Try a different search term.`
                  : "Be the first to share something amazing in this category!"}
              </p>
              {!searchQuery && (
                <Link href="/arts/add" className="inline-block">
                  <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-medium shadow-lg hover:shadow-xl transition-all duration-200">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Share a Hidden Art
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredArts.map((art) => (
              <div key={art.uuid} className="h-full">
                <ArtCard
                  art={art}
                  onUpvote={(artId) => session && upvoteMutation.mutate(artId)}
                  isUpvotePending={upvoteMutation.isPending}
                  className="group-hover:scale-[1.02] h-full"
                  upvotedByUser={userUpvotes.includes(art.uuid)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
