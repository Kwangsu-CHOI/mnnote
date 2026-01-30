"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export const createDocument = async ({
  title,
  parentDocumentId
}: {
  title: string;
  parentDocumentId?: string;
}) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const document = await db.document.create({
    data: {
      title,
      parentDocumentId,
      userId,
      isArchived: false,
      isPublished: false,
    }
  });

  return document;
};

export const archiveDocument = async (id: string) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const existingDocument = await db.document.findUnique({
    where: { id }
  });

  if (!existingDocument) {
    throw new Error("Not found");
  }

  if (existingDocument.userId !== userId) {
    throw new Error("Unauthorized");
  }

  const recursiveArchive = async (documentId: string) => {
    const children = await db.document.findMany({
      where: {
        parentDocumentId: documentId,
        userId
      }
    });

    for (const child of children) {
      await db.document.update({
        where: { id: child.id },
        data: { isArchived: true }
      });

      await recursiveArchive(child.id);
    }
  };

  const document = await db.document.update({
    where: { id },
    data: { isArchived: true }
  });

  await recursiveArchive(id);

  revalidatePath("/");
  return document;
};

export const getSidebar = async (parentDocumentId?: string) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const documents = await db.document.findMany({
    where: {
      parentDocumentId: parentDocumentId,
      userId,
      isArchived: false,
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return documents;
};
