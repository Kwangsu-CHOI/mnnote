"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ToolsContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggleTools: () => void;
  editorContext: string;
  setEditorContext: (text: string) => void;
  messages: any[];
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  clearMessages: () => void;
  pendingInsertion: string | null;
  insertContent: (content: string) => void;
  clearInsertion: () => void;
}

const ToolsContext = createContext<ToolsContextType | null>(null);

export const useTools = () => {
  const context = useContext(ToolsContext);
  if (!context) {
    throw new Error("useTools must be used within a ToolsProvider");
  }
  return context;
};

export const ToolsProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editorContext, setEditorContext] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [pendingInsertion, setPendingInsertion] = useState<string | null>(null);

  const toggleTools = () => setIsOpen((prev) => !prev);
  const clearMessages = () => setMessages([]);
  const insertContent = (content: string) => setPendingInsertion(content);
  const clearInsertion = () => setPendingInsertion(null);

  return (
    <ToolsContext.Provider 
      value={{ 
        isOpen, 
        setIsOpen, 
        toggleTools, 
        editorContext, 
        setEditorContext,
        messages,
        setMessages,
        clearMessages,
        pendingInsertion,
        insertContent,
        clearInsertion
      }}
    >
      {children}
    </ToolsContext.Provider>
  );
};
