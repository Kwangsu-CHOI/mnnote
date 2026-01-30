"use client";

import { useRouter } from "next/navigation";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DocumentNotFound() {
  const router = useRouter();

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      <FileQuestion className="h-20 w-20 text-muted-foreground" />
      <h2 className="text-2xl font-semibold">Page not found</h2>
      <p className="text-muted-foreground text-center max-w-md">
        This page doesn't exist or has been deleted.
      </p>
      <div className="flex gap-2">
        <Button onClick={() => router.push("/documents")} variant="default">
          Go to Documents
        </Button>
        <Button onClick={() => router.back()} variant="outline">
          Go Back
        </Button>
      </div>
    </div>
  );
}
