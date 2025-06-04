"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useArtFormStore } from "@/lib/stores/art-form-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { artSchema } from "@/lib/schemas";
import { TagsInput } from "./tags-input";
import { ArtistsInput } from "./artists-input";
import { PublishedDate } from "./published-date";
import { Art } from "@/lib/store";
import { Loader2 } from "lucide-react";

interface EditArtFormProps {
  art: Art;
}

export function EditArtForm({ art }: EditArtFormProps) {
  const { data: session } = useSession();
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  // Initialize form with art data
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(artSchema),
    defaultValues: {
      type: art.type || "music",
      name: art.name || "",
      url: art.url || "",
      description: art.description || undefined,
      image_url: art.image_url || null,
      tags: art.tags || ([] as string[]),
      artist: art.artist || ([] as string[]),
      published_on: art.published_on || null,
    },
  });

  // Get the current art type to conditionally render the components
  const currentArtType = watch("type");

  // Initialize form state from art data
  useEffect(() => {
    // Set tags in the store
    if (art.tags && art.tags.length > 0) {
      const tagsSet = new Set(art.tags);
      useArtFormStore.getState().setTags(tagsSet);
    }

    // Set artists in the store
    if (art.artist && art.artist.length > 0) {
      const artistsSet = new Set(art.artist);
      useArtFormStore.getState().setArtists(artistsSet);
    }

    // Set published date if available
    if (art.published_on) {
      const dateStr = new Date(art.published_on).toISOString().split("T")[0];
      useArtFormStore.getState().setPublishedDateStr(dateStr);
    }
  }, [art]);

  const onSubmit = async (data: any) => {
    if (!session || !session.user?.id) {
      toast.error("You must be logged in to update art");
      return;
    }

    setSubmitting(true);

    try {
      // Update existing art
      const response = await fetch(`/api/arts/${art.uuid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update art");
      }

      toast.success("Art updated successfully");
      router.push("/profile");
    } catch (error) {
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to update art",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="text-white p-6 bg-slate-800/60 backdrop-blur-md border border-slate-700/80 rounded-lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          {/* <label className="block text-sm font-medium mb-2">Type</label> */}
          {/* <ArtTypeSelector setValue={setValue} /> */}
          {errors.type && (
            <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Name
          </label>
          <Input id="name" placeholder="Enter name" {...register("name")} />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="url" className="block text-sm font-medium mb-2">
            URL
          </label>
          <Input id="url" placeholder="Enter URL" {...register("url")} />
          {errors.url && (
            <p className="text-red-500 text-sm mt-1">{errors.url.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium mb-2"
          >
            Description
          </label>
          <Input
            id="description"
            placeholder="Enter description"
            {...register("description")}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="image_url" className="block text-sm font-medium mb-2">
            Cover Art URL
          </label>
          <Input
            id="image_url"
            placeholder="Enter cover art URL"
            {...register("image_url")}
          />
          {errors.image_url && (
            <p className="text-red-500 text-sm mt-1">
              {errors.image_url.message}
            </p>
          )}
        </div>

        <div className="text-black">
          <label className="block text-sm font-medium mb-2 text-white">
            Tags
          </label>
          <TagsInput />
        </div>

        {/* Artist/Author field for all art types */}
        <div className="text-black">
          <label className="block text-sm font-medium mb-2 text-white">
            {currentArtType === "movie" ? "Director/Artist" : "Artist/Author"}
          </label>
          <ArtistsInput artType={currentArtType} setValue={setValue} />
        </div>

        {/* Published date field for all art types */}
        <div>
          <label
            htmlFor="published_on"
            className="block text-sm font-medium mb-2"
          >
            {currentArtType === "movie" ? "Release Date" : "Published Date"}
          </label>
          <PublishedDate artType={currentArtType} setValue={setValue} />
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            disabled={!session || submitting}
            className="bg-amber-500 hover:bg-amber-600 text-black font-medium"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Art"
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
