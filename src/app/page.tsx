import { Button } from "@/components/ui/button";
import { Heading } from "./_components/heading";
import { Footer } from "./_components/footer";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AntigravityHero } from "@/components/antigravity-hero";

export default async function MarketingPage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/documents");
  }

  return (
    <div className="min-h-full flex flex-col relative">
      <AntigravityHero />
      <div className="flex-col flex-1 flex items-center justify-center text-center gap-y-8 flex-grow px-6 pb-10 z-10">
        <Heading />
      </div>
      <Footer />
    </div>
  );
}
