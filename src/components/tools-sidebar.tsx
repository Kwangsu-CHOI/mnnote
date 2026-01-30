"use client";

import { useState } from "react";
import { evaluate } from "mathjs";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useTools } from "@/components/providers/tools-provider";
import { Bot, Calculator as CalcIcon, Calendar as CalIcon, Send, Sparkles } from "lucide-react";

export const ToolsSidebar = () => {
  const { isOpen, setIsOpen, editorContext } = useTools();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] flex flex-col p-0 h-full">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Tools & Assistant
          </SheetTitle>
        </SheetHeader>
        
        <Tabs defaultValue="chat" className="flex-1 flex flex-col h-full min-h-0 bg-background">
          <div className="px-4 pt-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <Bot className="h-4 w-4" /> AI Chat
              </TabsTrigger>
              <TabsTrigger value="utils" className="flex items-center gap-2">
                <CalcIcon className="h-4 w-4" /> Utilities
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="chat" className="flex-1 flex flex-col p-0 m-0 overflow-hidden min-h-0 data-[state=inactive]:hidden">
            <ChatTab context={editorContext} />
          </TabsContent>

          <TabsContent value="utils" className="flex-1 p-4 m-0 overflow-auto min-h-0">
            <UtilitiesTab />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

const ChatTab = ({ context }: { context: string }) => {
  const { messages, setMessages, clearMessages, insertContent } = useTools();
  const [localInput, setLocalInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSummarize = () => {
    const prompt = "Please summarize the current note context.";
    setLocalInput(prompt);
    if (context) {
      sendMessage(prompt);
      setLocalInput("");
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage = { role: "user", content };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }
      
      if (data.error) throw new Error(data.error);


      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.text },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!localInput.trim()) return;
    
    sendMessage(localInput);
    setLocalInput("");
  };

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <div className="flex-1 w-full p-4 overflow-y-auto">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4 mt-10">
            <Bot className="h-12 w-12 opacity-20" />
            <p className="text-sm">Ask me anything about your notes!</p>
            {context && (
              <Button variant="outline" size="sm" onClick={handleSummarize} disabled={isLoading}>
                <Sparkles className="h-3 w-3 mr-2" />
                Summarize Note
              </Button>
            )}
          </div>
        )}
        {messages.length > 0 && (
           <div className="flex justify-end mb-4">
             <Button variant="ghost" size="sm" onClick={clearMessages} className="h-6 text-xs text-muted-foreground hover:text-destructive">
               Clear Chat
             </Button>
           </div>
        )}
        <div className="space-y-4 pb-2">
          {messages.map((m: any, i: number) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`relative max-w-[85%] rounded-lg px-3 py-2 text-sm group break-words whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {m.content}
                {m.role === "assistant" && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="absolute -bottom-3 right-0.5 h-6 text-[10px] px-2 bg-background shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-accent"
                    onClick={() => insertContent(m.content)}
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                )}
              </div>
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex justify-start">
              <div className="bg-muted text-foreground max-w-[85%] rounded-lg px-3 py-2 text-sm">
                Thinking...
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="p-4 border-t bg-background z-10">
        <form onSubmit={onSubmit} className="flex gap-2">
          <Input
            value={localInput}
            onChange={(e) => setLocalInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

const UtilitiesTab = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="font-medium flex items-center gap-2">
          <CalIcon className="h-4 w-4" /> Calendar
        </h3>
        <div className="border rounded-md p-2 flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium flex items-center gap-2">
          <CalcIcon className="h-4 w-4" /> Calculator
        </h3>
        <Calculator />
      </div>
    </div>
  );
};

const Calculator = () => {
  const [display, setDisplay] = useState("");

  const handlePress = (val: string) => {
    if (val === "=") {
      try {
        const result = evaluate(display);
        setDisplay(result.toString());
      } catch (e) {
        setDisplay("Error");
      }
    } else if (val === "C") {
      setDisplay("");
    } else {
      setDisplay((prev) => prev + val);
    }
  };

  const buttons = [
    "7", "8", "9", "/",
    "4", "5", "6", "*",
    "1", "2", "3", "-",
    "0", ".", "=", "+",
    "C"
  ];

  return (
    <div className="w-full max-w-[280px] mx-auto border rounded-lg p-4 bg-card">
      <div className="bg-muted p-3 rounded-md mb-4 text-right font-mono text-xl h-12 overflow-hidden">
        {display || "0"}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {buttons.map((btn) => (
          <Button
            key={btn}
            variant={["/", "*", "-", "+", "="].includes(btn) ? "default" : "outline"}
            className={btn === "C" ? "col-span-4 mt-2" : ""}
            onClick={() => handlePress(btn)}
          >
            {btn}
          </Button>
        ))}
      </div>
    </div>
  );
};
