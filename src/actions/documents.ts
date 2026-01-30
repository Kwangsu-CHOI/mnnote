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

  revalidatePath("/documents");
  return document.id;
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

  revalidatePath("/documents");
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

export const getRootDocuments = async () => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const personalDocuments = await db.document.findMany({
    where: {
      parentDocument: null,
      userId,
      isArchived: false,
    },
    orderBy: {
      title: "asc"
    }
  });

  const sharedDocuments = await db.document.findMany({
    where: {
      parentDocument: null,
      collaborators: {
        has: userId
      },
      isArchived: false,
    },
    orderBy: {
      title: "asc"
    }
  });

  return {
    personalDocuments,
    sharedDocuments
  };
};

export const getDocumentPath = async (documentId: string) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const path = [];
  let currentId = documentId;

  while (currentId) {
    const document = await db.document.findUnique({
      where: { id: currentId },
      select: {
        id: true,
        title: true,
        parentDocumentId: true,
      }
    });

    if (!document) break;

    path.unshift(document);
    currentId = document.parentDocumentId as string;
  }

  return path;
};
