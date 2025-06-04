"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useArtsStore } from "@/lib/store";
import { ArtCard } from "@/components/art/art-card";
import { upvoteArt } from "@/lib/api";
import { supabaseClient } from "@/lib/supabase";
import { Art } from "@/lib/store";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { User } from "@/types";

export default function UserArtsPage({
  params,
}: {
  params: { username: string };
}) {
  const { username } = params;
  const router = useRouter();
  const { data: session } = useSession();
  const [arts, setArts] = useState<Art[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<{
    name?: string;
    image?: string | null;
  } | null>(null);
  const [userUpvotes, setUserUpvotes] = useState<string[]>([]);
  const { upvoteArt: upvoteArtInStore } = useArtsStore();

  useEffect(() => {
    if ((session?.user as User)?.username && username === (session?.user as User)?.username) {
      router.replace("/profile");
    }
  }, [username, session]);

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

      // Update the art in the local state
      setArts((prevArts) =>
        prevArts.map((art) =>
          art.uuid === data.uuid
            ? {
                ...art,
                votes: data.votes,
              }
            : art
        )
      );
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to update vote"
      );
    },
  });

  // Handle upvote
  const handleUpvote = (artId: string) => {
    if ((session?.user as User)?.id) {
      upvoteMutation.mutate(artId);
    } else {
      toast.error("Please sign in to upvote");
    }
  };

  useEffect(() => {
    async function fetchUserArts() {
      try {
        const res = await fetch(`/api/arts?username=${encodeURIComponent(username)}`);

        if (!res.ok) {
          throw new Error("Failed to fetch user's arts");
        }

        const data = await res.json();
        setArts(data.arts);
        setUserInfo(data.user || {});
      } catch (error) {
        console.error("Error fetching user arts:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (username) {
      fetchUserArts();
    }
  }, [username]);

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

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-slate-800/80">
              <Skeleton className="h-full w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold mb-2">User not found</h1>
          <p className="text-slate-400">
            We couldn't find a user with the username "{username}"
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* User header */}
      <div className="flex items-center gap-4 mb-8 bg-slate-800/60 backdrop-blur-md p-6 rounded-lg border border-slate-700/80">
        <div className="flex-shrink-0">
          {userInfo.image ? (
            <div className="relative h-16 w-16 rounded-full overflow-hidden">
              <img
                src={userInfo.image}
                alt={userInfo.name || username}
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-16 w-16 rounded-full bg-amber-500/20 flex items-center justify-center">
              <span className="text-2xl font-bold text-amber-300">
                {username.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold text-white">{username}</h1>
          {userInfo.name && <p className="text-slate-400">{userInfo.name}</p>}
        </div>
      </div>

      {/* Arts grid */}
      {arts.length === 0 ? (
        <div className="text-center py-16 bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50">
          <div className="max-w-md mx-auto">
            <div className="text-5xl mb-4">🎨</div>
            <h3 className="text-xl font-medium mb-2">No arts found</h3>
            <p className="text-slate-400">
              This user hasn't shared any arts yet
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {arts.map((art) => (
            <ArtCard
              key={art.uuid}
              art={art}
              onUpvote={(artId) => session && upvoteMutation.mutate(artId)}
              isUpvotePending={
                upvoteMutation.isPending &&
                upvoteMutation.variables === art.uuid
              }
              upvotedByUser={userUpvotes.includes(art.uuid)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
