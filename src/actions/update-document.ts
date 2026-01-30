"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export const updateDocument = async (id: string, data: {
  title?: string;
  content?: string;
  coverImage?: string;
  icon?: string;
}) => {
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

  if (existingDocument.userId !== userId && !existingDocument.collaborators.includes(userId)) {
    throw new Error("Unauthorized");
  }

  const document = await db.document.update({
    where: { id },
    data
  });

  revalidatePath(`/documents/${id}`);
  revalidatePath("/documents");
  revalidatePath("/", "layout");
  return document;
};

export const getDocument = async (id: string) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const document = await db.document.findUnique({
    where: { id }
  });

  if (!document) {
    throw new Error("Not found");
  }

  if (document.userId !== userId && !document.collaborators.includes(userId)) {
    throw new Error("Unauthorized");
  }

  return document;
};

export const removeIcon = async (id: string) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const document = await db.document.update({
    where: { id },
    data: { icon: null }
  });

  revalidatePath(`/documents/${id}`);
  return document;
};

export const removeCoverImage = async (id: string) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const document = await db.document.update({
    where: { id },
    data: { coverImage: null }
  });

  revalidatePath(`/documents/${id}`);
  return document;
};
