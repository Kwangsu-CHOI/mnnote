"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, Trash, Undo } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { Spinner } from "@/components/spinner";

interface TrashBoxProps {
  documents: any[];
  setDocuments: (docs: any[]) => void;
  onRefresh?: () => void;
}

export const TrashBox = ({ documents, setDocuments, onRefresh }: TrashBoxProps) => {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filteredDocuments = documents.filter((document) => {
    return document.title.toLowerCase().includes(search.toLowerCase());
  });

  const onClick = (documentId: string) => {
    router.push(`/documents/${documentId}`);
  };

  const onRestore = async (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    documentId: string,
  ) => {
    event.stopPropagation();
    const { restoreDocument } = await import("@/actions/trash");
    
    toast.promise(
      restoreDocument(documentId).then(() => {
        // Remove from local state immediately
        setDocuments(documents.filter(doc => doc.id !== documentId));
        onRefresh?.();
        router.refresh();
      }),
      {
        loading: "Restoring note...",
        success: "Note restored!",
        error: "Failed to restore note.",
      }
    );
  };

  const onRemove = async (documentId: string) => {
    const { deleteDocument } = await import("@/actions/trash");
    
    toast.promise(
      deleteDocument(documentId).then(() => {
        // Remove from local state immediately
        setDocuments(documents.filter(doc => doc.id !== documentId));
        onRefresh?.();
        router.refresh();
      }),
      {
        loading: "Deleting note...",
        success: "Note deleted!",
        error: "Failed to delete note.",
      }
    );
  };

  if (!documents) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="text-sm">
      <div className="flex items-center gap-x-1 p-2">
        <Search className="h-4 w-4" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-7 px-2 focus-visible:ring-transparent bg-secondary"
          placeholder="Filter by page title..."
        />
      </div>
      <div className="mt-2 px-1 pb-1">
        <p className="hidden last:block text-xs text-center text-muted-foreground pb-2">
          No documents found.
        </p>
        {filteredDocuments?.map((document) => (
          <div
            key={document.id}
            role="button"
            onClick={() => onClick(document.id)}
            className="text-sm rounded-sm w-full hover:bg-primary/5 flex items-center text-primary justify-between"
          >
            <span className="truncate pl-2">
              {document.title}
            </span>
            <div className="flex items-center">
              <div
                onClick={(e) => onRestore(e, document.id)}
                role="button"
                className="rounded-sm p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600"
              >
                <Undo className="h-4 w-4 text-muted-foreground" />
              </div>
              <ConfirmModal onConfirm={() => onRemove(document.id)}>
                <div
                  role="button"
                  className="rounded-sm p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                >
                  <Trash className="h-4 w-4 text-muted-foreground" />
                </div>
              </ConfirmModal>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
