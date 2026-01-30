
import { db } from "@/lib/db";

async function main() {
  try {
    const count = await db.document.count();
    console.log(`Total documents: ${count}`);
    
    const docs = await db.document.findMany({
      take: 5,
      select: { id: true, title: true, userId: true, parentDocumentId: true, isArchived: true }
    });
    console.log("First 5 documents:", JSON.stringify(docs, null, 2));
  } catch (error) {
    console.error("Error querying database:", error);
  }
}

main();
