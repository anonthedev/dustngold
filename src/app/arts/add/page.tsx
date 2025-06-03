"use client";

import { ArtForm } from "@/components/art-form/art-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AddArtPage() {
  const router = useRouter();
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-3 mb-6">
        <Button variant={"ghost"} size={"icon"} onClick={() => router.back()} className="flex items-center h-8 w-8 cursor-pointer">
          <ArrowLeft size={30} />
        </Button>
        <h1 className="text-3xl font-bold">Add New Art</h1>
      </div>
      <ArtForm />
    </div>
  );
}
