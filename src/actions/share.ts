"use server";

import { db } from "@/lib/db";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export const addCollaborator = async (documentId: string, email: string) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Fetch the document
  const document = await db.document.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    throw new Error("Document not found");
  }

  // Only owner can add collaborators
  if (document.userId !== userId) {
    throw new Error("Only the owner can add collaborators");
  }

  // Find user by email using Clerk
  const client = await clerkClient();
  const users = await client.users.getUserList({
    emailAddress: [email],
  });

  if (users.data.length === 0) {
    throw new Error("User not found with this email");
  }

  const collaboratorUserId = users.data[0].id;

  // Don't add owner as collaborator
  if (collaboratorUserId === userId) {
    throw new Error("You are already the owner");
  }

  // Check if already a collaborator
  if (document.collaborators.includes(collaboratorUserId)) {
    throw new Error("User is already a collaborator");
  }

  // Add collaborator
  await db.document.update({
    where: { id: documentId },
    data: {
      collaborators: {
        push: collaboratorUserId,
      },
    },
  });

  revalidatePath("/");
  return { success: true };
};

export const removeCollaborator = async (
  documentId: string,
  collaboratorId: string
) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const document = await db.document.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    throw new Error("Document not found");
  }

  // Only owner can remove collaborators
  if (document.userId !== userId) {
    throw new Error("Only the owner can remove collaborators");
  }

  await db.document.update({
    where: { id: documentId },
    data: {
      collaborators: {
        set: document.collaborators.filter((id) => id !== collaboratorId),
      },
    },
  });

  revalidatePath("/");
  return { success: true };
};

export const getCollaborators = async (documentId: string) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const document = await db.document.findUnique({
    where: { id: documentId },
    select: {
      userId: true,
      collaborators: true,
    },
  });

  if (!document) {
    throw new Error("Document not found");
  }

  // Check access
  const hasAccess =
    document.userId === userId || document.collaborators.includes(userId);

  if (!hasAccess) {
    throw new Error("Access denied");
  }

  // Fetch collaborator details from Clerk
  if (document.collaborators.length === 0) {
    return [];
  }

  const client = await clerkClient();
  const collaboratorDetails = await Promise.all(
    document.collaborators.map(async (collabId) => {
      try {
        const user = await client.users.getUser(collabId);
        return {
          id: user.id,
          name: user.fullName || user.emailAddresses[0]?.emailAddress || "Unknown",
          email: user.emailAddresses[0]?.emailAddress || "",
          avatar: user.imageUrl,
        };
      } catch (error) {
        return null;
      }
    })
  );

  return collaboratorDetails.filter((c) => c !== null);
};
