"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";
import { Markdown } from "tiptap-markdown";
import { useEffect, useState, useCallback } from "react";
import type { Editor as TiptapEditorType } from "@tiptap/react";
import TextareaAutosize from "react-textarea-autosize";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { ImageResizer } from "@/components/image-resizer";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import { useRoom, useSelf } from "@/liveblocks.config";
import * as Y from "yjs";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import { useTools } from "@/components/providers/tools-provider";

interface EditorProps {
  initialContent?: string;
  editable?: boolean;
  onChange?: (content: string) => void;
  onEditorReady?: (editor: TiptapEditorType) => void;
}

interface EditorInnerProps extends EditorProps {
  provider: LiveblocksYjsProvider;
  doc: Y.Doc;
  userInfo: any;
}

const EditorInner = ({ initialContent, editable = true, onChange, onEditorReady, provider, doc, userInfo }: EditorInnerProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [markdownContent, setMarkdownContent] = useState("");
  const { setEditorContext } = useTools();

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        history: false,
      } as any),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: "rounded-lg",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 hover:underline cursor-pointer",
        },
      }),
      Youtube.configure({
        controls: true,
        nocookie: true,
        HTMLAttributes: {
          class: "w-full aspect-video my-4",
        },
      }),
      Markdown,
      Collaboration.configure({
        document: doc,
      }),
      CollaborationCursor.configure({
        provider: provider,
        user: {
          name: userInfo?.name || "Anonymous",
          color: "#f783ac",
        },
      }),
    ],
    content: initialContent || "",
    editable,
    editorProps: {
      attributes: {
        class:
          "prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[300px] prose-headings:font-bold prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-p:leading-7 prose-img:rounded-lg prose-img:shadow-md",
        "data-placeholder": "Type '/' for commands...",
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith("image/")) {
            event.preventDefault();
            handleImageUpload(file);
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event) => {
        if (event.clipboardData && event.clipboardData.files && event.clipboardData.files[0]) {
          const file = event.clipboardData.files[0];
          if (file.type.startsWith("image/")) {
            event.preventDefault();
            handleImageUpload(file);
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
      
      // Sync context for AI
      const text = editor.getText();
      setEditorContext(text);

      if (isSourceMode) {
        setMarkdownContent((editor.storage as any).markdown.getMarkdown());
      }
    },
  });

  const { pendingInsertion, clearInsertion } = useTools();

  useEffect(() => {
    if (editor && pendingInsertion) {
      editor.chain().focus().insertContent(pendingInsertion).run();
      clearInsertion();
      toast.success("Content added to note!");
    }
  }, [editor, pendingInsertion, clearInsertion]);

  const handleImageUpload = useCallback(async (file: File) => {
    if (!editor) return;

    const toastId = toast.loading("Uploading image to Cloudinary...");
    
    try {
      const { uploadToCloudinary } = await import("@/lib/cloudinary");
      const url = await uploadToCloudinary(file);
      editor.chain().focus().setImage({ src: url, alt: file.name }).run();
      
      // Set width to 50% after insertion
      setTimeout(() => {
        const images = editor.view.dom.querySelectorAll('img');
        const lastImage = images[images.length - 1] as HTMLImageElement;
        if (lastImage) {
          lastImage.style.width = '50%';
          lastImage.style.height = 'auto';
        }
      }, 100);
      
      toast.success("Image uploaded successfully!", { id: toastId });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image. Please check your Cloudinary configuration.", { id: toastId });
    }
  }, [editor]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    onDrop: (files) => {
      if (files[0]) {
        handleImageUpload(files[0]);
      }
    },
    noClick: true,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (editor && onEditorReady && isMounted) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady, isMounted]);

  useEffect(() => {
    if (editor && initialContent !== undefined && provider) {
      const setInitialContent = () => {
        // Only set content if the editor is empty (meaning remote doc is also empty or just has default paragraph)
        if (editor.isEmpty) {
          editor.commands.setContent(initialContent || "");
        }
      };

      if (provider.synced) {
        setInitialContent();
      } else {
        provider.once('synced', setInitialContent);
      }
    }
  }, [editor, initialContent, provider, doc]);

  const toggleSourceMode = () => {
    if (!editor) return;

    if (isSourceMode) {
      // Source -> Visual: Update editor with markdown
      editor.commands.setContent(markdownContent);
      setIsSourceMode(false);
    } else {
      // Visual -> Source: Get markdown from editor
      const markdown = (editor.storage as any).markdown.getMarkdown();
      setMarkdownContent(markdown);
      setIsSourceMode(true);
    }
  };

  const handleMarkdownChange = (value: string) => {
    setMarkdownContent(value);
  };

  if (!isMounted || !editor) {
    return (
      <div className="px-8 py-4 text-muted-foreground">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="w-full">
      <ImageResizer editor={editor} />
      
      <div className="mb-2 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="dark:bg-zinc-800 dark:hover:bg-zinc-700"
            onClick={toggleSourceMode}
          >
          {isSourceMode ? "📝 Visual" : "🔤 Source"}
        </Button>
      </div>

      {isSourceMode ? (
        <div className="border rounded-md p-4">
          <TextareaAutosize
            value={markdownContent}
            onChange={(e) => handleMarkdownChange(e.target.value)}
            className="w-full font-mono text-sm focus:outline-none resize-none bg-transparent"
            placeholder="# Markdown source..."
            minRows={15}
          />
        </div>
      ) : (
        <div {...getRootProps()} className="relative">
          <input {...getInputProps()} />
          {isDragActive && (
            <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center z-10">
              <p className="text-lg font-medium">Drop image here...</p>
            </div>
          )}

          <EditorContent editor={editor} />
        </div>
      )}
    </div>
  );
};

export const Editor = (props: EditorProps) => {
  const room = useRoom();
  const [provider, setProvider] = useState<LiveblocksYjsProvider | null>(null);
  const [doc, setDoc] = useState<Y.Doc | null>(null);
  const userInfo = useSelf((me) => me.info);

  useEffect(() => {
    const yDoc = new Y.Doc();
    const yProvider = new LiveblocksYjsProvider(room, yDoc);
    setDoc(yDoc);
    setProvider(yProvider);

    return () => {
      yDoc.destroy();
      yProvider.destroy();
    };
  }, [room]);

  if (!provider || !doc) {
    return (
      <div className="px-8 py-4 text-muted-foreground">
        Loading editor...
      </div>
    );
  }

  return <EditorInner {...props} provider={provider} doc={doc} userInfo={userInfo} />;
};
