import { Sidebar } from "./_components/sidebar";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const MainLayout = async ({
  children
}: {
  children: React.ReactNode;
}) => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  return (
    <div className="h-full flex dark:bg-[#1F1F1F]">
      <Sidebar />
      <main className="flex-1 h-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
};
 
export default MainLayout;
