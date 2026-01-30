
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const count = await db.document.count();
    const docs = await db.document.findMany({
      take: 10,
      select: { id: true, title: true, userId: true, parentDocumentId: true, isArchived: true }
    });
    
    return NextResponse.json({ count, docs });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch docs", details: String(error) }, { status: 500 });
  }
}
