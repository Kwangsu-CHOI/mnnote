"use client"

import * as React from "react"
import { Menu, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTools } from "@/components/providers/tools-provider"
import { Button } from "@/components/ui/button"

interface TopNavProps extends React.HTMLAttributes<HTMLDivElement> {
  onMenuClick: () => void
  isCollapsed: boolean
  onExpandClick: () => void
}

function ToolsTrigger() {
  const { toggleTools } = useTools()
  
  return (
    <Button variant="ghost" size="icon" onClick={toggleTools} className="text-muted-foreground hover:text-primary">
      <Sparkles className="h-5 w-5" />
      <span className="sr-only">Toggle Tools</span>
    </Button>
  )
}

export function TopNav({ className, onMenuClick, isCollapsed, onExpandClick }: TopNavProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6",
        className
      )}
    >
      <button
        onClick={onMenuClick}
        className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground md:hidden"
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle Menu</span>
      </button>
      {isCollapsed && (
         <button
            onClick={onExpandClick}
            className="hidden md:inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
         >
            <Menu className="h-5 w-5" />
         </button>
      )}
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="ml-auto flex items-center gap-2">
            <ToolsTrigger />
            {/* Placeholder for breadcrumbs or actions */}
            <span className="text-sm text-muted-foreground">Home</span>
        </div>
      </div>
    </header>
  )
}
