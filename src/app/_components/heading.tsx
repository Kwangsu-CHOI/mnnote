"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

export const Heading = () => {
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-3xl font-bold sm:text-5xl md:text-6xl">
        Your Ideas, Documents, & Plans. Unified. Welcome to <span className="underline">MyNewNote</span>
      </h1>
      <h3 className="text-base font-medium sm:text-xl md:text-2xl">
        MyNewNote is the connected workspace where <br />
        better, faster work happens.
      </h3>
      {isLoaded && !isSignedIn && (
        <SignInButton mode="modal">
          <Button>
            Get MyNewNote free
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </SignInButton>
      )}
      {isSignedIn && (
        <Button asChild>
          <Link href="/documents">
            Enter MyNewNote
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      )}
    </div>
  );
};
