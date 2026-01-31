"use client";

import { useEffect, useState } from "react";
import { File } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDebounce } from "use-debounce";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { searchDocuments } from "@/actions/search";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface SearchCommandProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchCommand = ({ isOpen, onClose }: SearchCommandProps) => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!debouncedSearch) {
        setDocuments([]);
        return;
      }

      setIsLoading(true);
      try {
        const results = await searchDocuments(debouncedSearch);
        setDocuments(results);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, [debouncedSearch]);

  const onSelect = (id: string) => {
    router.push(`/documents/${id}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 overflow-hidden z-[100000]">
        <DialogHeader>
          <DialogTitle className="sr-only">Search Documents</DialogTitle>
        </DialogHeader>
        <Command shouldFilter={false} className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          <CommandInput
            placeholder="Search documents..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Searching..." : "No results found."}
            </CommandEmpty>
            <CommandGroup heading="Documents">
              {documents.map((document) => (
                <CommandItem
                  key={document.id}
                  value={`${document.id}-${document.title}`}
                  onSelect={() => onSelect(document.id)}
                >
                  {document.icon ? (
                    <p className="mr-2 text-[18px]">{document.icon}</p>
                  ) : (
                    <File className="mr-2 h-4 w-4" />
                  )}
                  <span>{document.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};
