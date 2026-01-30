import { Liveblocks } from "@liveblocks/node";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export async function POST(request: Request) {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Get the room ID from the request
  const { room } = await request.json();

  // Extract document ID from room name (format: "document-{id}")
  const documentId = room.replace("document-", "");

  // Fetch the document to check authorization
  const document = await db.document.findUnique({
    where: { id: documentId },
    select: {
      userId: true,
      collaborators: true,
    },
  });

  if (!document) {
    return new Response("Document not found", { status: 404 });
  }

  // Check if user is owner OR collaborator
  const isOwner = document.userId === userId;
  const isCollaborator = document.collaborators.includes(userId);

  if (!isOwner && !isCollaborator) {
    return new Response("Forbidden", { status: 403 });
  }

  // Authorize the user for this room
  const session = liveblocks.prepareSession(userId, {
    userInfo: {
      name: user.fullName || user.emailAddresses[0]?.emailAddress || "Anonymous",
      avatar: user.imageUrl,
    },
  });

  session.allow(room, session.FULL_ACCESS);

  const { status, body } = await session.authorize();
  return new Response(body, { status });
}
