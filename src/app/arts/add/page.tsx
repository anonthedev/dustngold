"use client";

import { ArtForm } from "@/components/art-form/art-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

export default function AddArtPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [hasUsername, setHasUsername] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent('/arts/add')}`);
      return;
    }

    // If still loading session, wait
    if (status === "loading") return;

    // Check if user has a username
    const checkUsername = async () => {
      try {
        if (!session?.user?.id) return;

        // Use the user's access token to check their username
        const supabase = supabaseClient(session.supabaseAccessToken || '');
        
        const { data, error } = await supabase
          .from('users')
          .select('username')
          .eq('id', session.user.id)
          .single();
        
        if (error) throw error;
        
        if (!data || !data.username) {
          toast.error("Username required", {
            description: "Please set a username before adding arts"
          });
          router.push('/profile');
          return;
        }
        
        setHasUsername(true);
      } catch (error) {
        console.error('Error checking username:', error);
        toast.error("Error", {
          description: "Could not verify your account. Please try again."
        });
        router.push('/profile');
      } finally {
        setIsLoading(false);
      }
    };

    checkUsername();
  }, [session, status, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center gap-3 mb-6">
          <Button variant={"ghost"} size={"icon"} onClick={() => router.back()} className="flex items-center h-8 w-8 cursor-pointer">
            <ArrowLeft size={30} />
          </Button>
          <h1 className="text-3xl font-bold">Add New Art</h1>
        </div>
        <Card className="p-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <span className="ml-2">Checking your account...</span>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-3 mb-6">
        <Button variant={"ghost"} size={"icon"} onClick={() => router.back()} className="flex items-center h-8 w-8 cursor-pointer">
          <ArrowLeft size={30} />
        </Button>
        <h1 className="text-3xl font-bold">Add New Art</h1>
      </div>
      {hasUsername && <ArtForm />}
    </div>
  );
}
