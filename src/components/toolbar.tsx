"use client";

import { type Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Undo,
  Redo,
  Minus,
  Link as LinkIcon,
  Image as ImageIcon,
  Youtube,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef } from "react";
import { toast } from "sonner";

interface ToolbarProps {
  editor: Editor | null;
}

export const Toolbar = ({ editor }: ToolbarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!editor) {
    return null;
  }

  const addYoutubeVideo = () => {
    const url = prompt('Enter YouTube URL:');
    if (url) {
      editor.commands.setYoutubeVideo({
        src: url,
        width: 640,
        height: 480,
      });
    }
  };

  const addImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    const toastId = toast.loading("Uploading image...");

    try {
      // Create local URL for immediate preview
      const url = URL.createObjectURL(file);
      editor.commands.setImage({ src: url });
      toast.success("Image added!", { id: toastId });
    } catch (error) {
      toast.error("Failed to upload image", { id: toastId });
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />
      
      <div className="bg-muted/50 dark:bg-zinc-700 border border-border rounded-lg flex items-center gap-0.5 p-1 flex-wrap shadow-sm">
        {/* Undo/Redo */}
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
          title="Undo (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo className="h-4 w-4" />
        </button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Text Formatting */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            "p-1.5 rounded hover:bg-accent",
            editor.isActive("bold") && "bg-accent"
          )}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            "p-1.5 rounded hover:bg-accent",
            editor.isActive("italic") && "bg-accent"
          )}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={cn(
            "p-1.5 rounded hover:bg-accent",
            editor.isActive("strike") && "bg-accent"
          )}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={cn(
            "p-1.5 rounded hover:bg-accent",
            editor.isActive("code") && "bg-accent"
          )}
          title="Inline Code"
        >
          <Code className="h-4 w-4" />
        </button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Headings */}
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={cn(
            "p-1.5 rounded hover:bg-accent",
            editor.isActive("heading", { level: 1 }) && "bg-accent"
          )}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn(
            "p-1.5 rounded hover:bg-accent",
            editor.isActive("heading", { level: 2 }) && "bg-accent"
          )}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={cn(
            "p-1.5 rounded hover:bg-accent",
            editor.isActive("heading", { level: 3 }) && "bg-accent"
          )}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Lists */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            "p-1.5 rounded hover:bg-accent",
            editor.isActive("bulletList") && "bg-accent"
          )}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            "p-1.5 rounded hover:bg-accent",
            editor.isActive("orderedList") && "bg-accent"
          )}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={cn(
            "p-1.5 rounded hover:bg-accent",
            editor.isActive("taskList") && "bg-accent"
          )}
          title="Task List"
        >
          <ListChecks className="h-4 w-4" />
        </button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Block Formatting */}
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn(
            "p-1.5 rounded hover:bg-accent",
            editor.isActive("blockquote") && "bg-accent"
          )}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={cn(
            "p-1.5 rounded hover:bg-accent text-xs font-mono",
            editor.isActive("codeBlock") && "bg-accent"
          )}
          title="Code Block"
        >
          {"</>"}
        </button>
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-1.5 rounded hover:bg-accent"
          title="Horizontal Line"
        >
          <Minus className="h-4 w-4" />
        </button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Media */}
        <button
          onClick={addImage}
          className="p-1.5 rounded hover:bg-accent"
          title="Insert Image"
        >
          <ImageIcon className="h-4 w-4" />
        </button>
        <button
          onClick={addYoutubeVideo}
          className="p-1.5 rounded hover:bg-accent"
          title="Embed YouTube Video"
        >
          <Youtube className="h-4 w-4" />
        </button>
      </div>
    </>
  );
};
