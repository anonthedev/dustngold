"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { EditArtForm } from "@/components/art-form/edit-art-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Art } from "@/lib/store";

export default function EditArtPage({ params }: { params: { uuid: string } }) {
  const { uuid } = params;
  const router = useRouter();
  const { data: session, status } = useSession();
  const [art, setArt] = useState<Art | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      const fetchArt = async () => {
        try {
          const response = await fetch(`/api/arts/${uuid}`);
          
          if (!response.ok) {
            throw new Error("Failed to fetch art");
          }
          
          const data = await response.json();
          
          // Check if the user is the owner of the art
          if (data.submitted_by !== session.user.id) {
            toast.error("You don't have permission to edit this art");
            router.push("/profile");
            return;
          }
          
          setArt(data);
        } catch (error) {
          toast.error("Error", {
            description: error instanceof Error ? error.message : "Failed to load art",
          });
          router.push("/profile");
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchArt();
    }
  }, [uuid, router, status, session]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center gap-3 mb-6">
          <Button variant={"ghost"} size={"icon"} onClick={() => router.back()} className="flex items-center h-8 w-8 cursor-pointer">
            <ArrowLeft size={30} />
          </Button>
          <Skeleton className="h-9 w-40" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!art) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center gap-3 mb-6">
          <Button variant={"ghost"} size={"icon"} onClick={() => router.back()} className="flex items-center h-8 w-8 cursor-pointer">
            <ArrowLeft size={30} />
          </Button>
          <h1 className="text-3xl font-bold">Art Not Found</h1>
        </div>
        <p>The art you're trying to edit could not be found.</p>
        <Button onClick={() => router.push("/profile")} className="mt-4">
          Return to Profile
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-3 mb-6">
        <Button variant={"ghost"} size={"icon"} onClick={() => router.back()} className="flex items-center h-8 w-8 cursor-pointer">
          <ArrowLeft size={30} />
        </Button>
        <h1 className="text-3xl font-bold">Edit Art</h1>
      </div>
      <EditArtForm art={art} />
    </div>
  );
}
