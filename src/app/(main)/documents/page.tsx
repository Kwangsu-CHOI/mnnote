"use client";

import { useUser } from "@clerk/nextjs";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createDocument } from "@/actions/documents";
import { AntigravityHero } from "@/components/antigravity-hero";

const DocumentsPage = () => {
  const { user } = useUser();
  const router = useRouter();

  const onCreate = () => {
    const promise = createDocument({ title: "Untitled" })
      .then((documentId: string) => {
        router.refresh();
        router.push(`/documents/${documentId}`);
      });

    toast.promise(promise, {
      loading: "Creating a new note...",
      success: "New note created!",
      error: "Failed to create a new note."
    });
  };

  return ( 
    <div className="h-full flex flex-col items-center justify-center space-y-4 relative overflow-hidden">
      <AntigravityHero />
      <div className="z-10 flex flex-col items-center space-y-4">
        <h2 className="text-lg font-medium">
          Welcome to {user?.firstName}&apos;s MyNewNote
        </h2>
        <Button onClick={onCreate}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Create a note
        </Button>
      </div>
    </div>
   );
}
 
export default DocumentsPage;
