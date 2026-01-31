"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export const searchDocuments = async (query: string) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const documents = await db.document.findMany({
    where: {
      userId,
      isArchived: false,
      OR: [
        {
          title: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          content: {
            contains: query,
          },
        },
      ],
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 10,
  });

  return documents;
};
