"use client";

import { Cover } from "@/components/cover";
import { Editor } from "@/components/editor";
import { Toolbar } from "@/components/toolbar";
import { IconPicker } from "@/components/icon-picker";
import { Button } from "@/components/ui/button";
import { updateDocument, removeIcon } from "@/actions/update-document";
import { useDebounce } from "use-debounce";
import { useEffect, useState } from "react";
import { ImageIcon, Smile, X } from "lucide-react";
import { useCoverImage } from "@/hooks/use-cover-image";
import TextareaAutosize from "react-textarea-autosize";
import type { Editor as TiptapEditor } from "@tiptap/react";
import { useRouter } from "next/navigation";

import { RoomProvider } from "@/components/providers/room-provider";
import { ShareModal } from "@/components/modals/share-modal";
import { ActiveUsers } from "@/components/active-users";
import { useUser } from "@clerk/nextjs";
import { Share, Sparkles } from "lucide-react";
import { useTools } from "@/components/providers/tools-provider";
import { AntigravityHero } from "@/components/antigravity-hero";

interface DocumentPageProps {
  document: any;
}

export const DocumentPage = ({ document }: DocumentPageProps) => {
  const router = useRouter();
  const { user } = useUser();
  const { toggleTools } = useTools();
  const [title, setTitle] = useState(document.title);
  const [content, setContent] = useState(document.content || "");
  const [icon, setIcon] = useState(document.icon);
  const [editor, setEditor] = useState<TiptapEditor | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showHero, setShowHero] = useState(false);
  
  const [debouncedTitle] = useDebounce(title, 500);
  const [debouncedContent] = useDebounce(content, 500);
  
  const coverImage = useCoverImage();

  useEffect(() => {
    if (debouncedTitle !== document.title) {
      updateDocument(document.id, { title: debouncedTitle }).then(() => {
        router.refresh();
      });
    }
  }, [debouncedTitle, document.id, document.title]);

  useEffect(() => {
    if (debouncedContent !== document.content) {
      updateDocument(document.id, { content: debouncedContent });
    }
  }, [debouncedContent, document.id, document.content]);

  const onIconSelect = (icon: string) => {
    setIcon(icon);
    updateDocument(document.id, { icon });
  };

  const onRemoveIcon = () => {
    setIcon(null);
    removeIcon(document.id);
  };

  return (
    <RoomProvider roomId={`document-${document.id}`}>
      <div className="pb-40 relative">
        <Cover url={document.coverImage} />
        
        {/* Share Button & Active Users - Absolute positioned top right */}
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTools}>
            <Sparkles className="h-5 w-5 text-muted-foreground" />
          </Button>
          <ActiveUsers />
          <Button 
            onClick={() => setIsShareModalOpen(true)}
            variant="outline" 
            size="sm"
            className="gap-2"
          >
            <Share className="h-4 w-4" />
            Share
          </Button>
        </div>

        <ShareModal
          documentId={document.id}
          isOwner={document.userId === user?.id}
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
        />

        <div className="md:max-w-3xl lg:max-w-4xl mx-auto px-4 md:px-10 pt-2">
          {/* Icon Section */}
          <div className="group relative">
            {!!icon && (
              <div className="flex items-center gap-x-2 group/icon mb-4">
                <IconPicker onChange={onIconSelect}>
                  <p className="text-6xl hover:opacity-75 transition cursor-pointer">
                    {icon}
                  </p>
                </IconPicker>
                <Button
                  onClick={onRemoveIcon}
                  className="rounded-full opacity-0 group-hover/icon:opacity-100 transition text-muted-foreground text-xs"
                  variant="outline"
                  size="icon"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            

            
            {showHero && (
               <div className="relative group/hero">
                  <AntigravityHero />
                  <Button
                    onClick={() => setShowHero(false)}
                    className="absolute top-2 right-2 opacity-0 group-hover/hero:opacity-100 transition-opacity"
                    variant="ghost"
                    size="icon"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </Button>
               </div>
            )}
          </div>


          {/* Title Section with clear separation */}
          <div className="mb-4">
            <TextareaAutosize
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled"
              className="text-5xl bg-transparent font-bold break-words outline-none text-[#3F3F3F] dark:text-[#CFCFCF] resize-none w-full"
            />
          </div>

          {/* Divider */}
          <div className="border-b border-border mb-4" />

          {/* Toolbar - with better styling */}
          <div className="mb-4 sticky top-0 z-30 py-2">
            <Toolbar editor={editor} />
          </div>

          {/* Editor Section */}
          <Editor
            initialContent={content}
            onChange={setContent}
            onEditorReady={setEditor}
          />
        </div>
      </div>
    </RoomProvider>
  );
};
