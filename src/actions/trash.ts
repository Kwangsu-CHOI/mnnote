"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export const restoreDocument = async (id: string) => {
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

  const recursiveRestore = async (documentId: string) => {
    const children = await db.document.findMany({
      where: {
        parentDocumentId: documentId,
        userId
      }
    });

    for (const child of children) {
      await db.document.update({
        where: { id: child.id },
        data: { isArchived: false }
      });

      await recursiveRestore(child.id);
    }
  };

  const document = await db.document.update({
    where: { id },
    data: { isArchived: false }
  });

  await recursiveRestore(id);

  revalidatePath("/documents");
  return document;
};

export const deleteDocument = async (id: string) => {
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

  const document = await db.document.delete({
    where: { id }
  });

  revalidatePath("/documents");
  return document;
};

export const getTrash = async () => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const documents = await db.document.findMany({
    where: {
      userId,
      isArchived: true,
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return documents;
};
