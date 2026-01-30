"use client";

import { getDocumentPath } from "@/actions/documents";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";

interface DocumentPath {
  id: string;
  title: string;
  parentDocumentId: string | null;
}

export const SidebarBreadcrumbs = () => {
  const params = useParams();
  const [path, setPath] = useState<DocumentPath[]>([]);

  useEffect(() => {
    const fetchPath = async () => {
      if (typeof params.documentId === "string") {
        const documentPath = await getDocumentPath(params.documentId);
        setPath(documentPath);
      } else {
        setPath([]);
      }
    };

    fetchPath();
  }, [params.documentId]);

  if (path.length === 0) return null;

  return (
    <div className="flex items-center gap-1 px-3 py-2 text-[10px] text-muted-foreground border-t mt-auto">
      {path.map((doc, index) => (
        <div key={doc.id} className="flex items-center">
          {index > 0 && <ChevronRight className="h-3 w-3 mx-1 text-muted-foreground/50" />}
          <span className="truncate max-w-[80px] font-medium">
            {doc.title}
          </span>
        </div>
      ))}
    </div>
  );
};
