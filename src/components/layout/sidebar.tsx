"use client"

import * as React from "react"
import { ChevronsLeft, Menu, Plus, Search, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
  width: number
  setWidth: (width: number) => void
  isMobileOpen: boolean
  setIsMobileOpen: (open: boolean) => void
}

export function Sidebar({
  className,
  isCollapsed,
  setIsCollapsed,
  width,
  setWidth,
  isMobileOpen,
  setIsMobileOpen,
}: SidebarProps) {
  const [isResizing, setIsResizing] = React.useState(false)
  const sidebarRef = React.useRef<HTMLDivElement>(null)

  const startResizing = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }, [])

  const stopResizing = React.useCallback(() => {
    setIsResizing(false)
  }, [])

  const resize = React.useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizing) {
        const newWidth = mouseMoveEvent.clientX
        if (newWidth > 240 && newWidth < 480) {
          setWidth(newWidth)
        }
      }
    },
    [isResizing, setWidth]
  )

  React.useEffect(() => {
    window.addEventListener("mousemove", resize)
    window.addEventListener("mouseup", stopResizing)
    return () => {
      window.removeEventListener("mousemove", resize)
      window.removeEventListener("mouseup", stopResizing)
    }
  }, [resize, stopResizing])

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        ref={sidebarRef}
        className={cn(
          "group/sidebar relative z-50 flex h-full flex-col overflow-hidden border-r bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out",
          isCollapsed ? "w-[60px]" : "w-[var(--sidebar-width)]",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          "fixed inset-y-0 left-0 md:relative",
          className
        )}
        style={
          {
            "--sidebar-width": `${width}px`,
          } as React.CSSProperties
        }
      >
        {/* Header */}
        <div className="flex h-14 items-center border-b px-3">
            <div className="flex items-center gap-2 font-semibold">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    N
                </div>
                {!isCollapsed && <span>MyNewNote</span>}
            </div>
            {!isCollapsed && (
                <button
                    onClick={() => setIsCollapsed(true)}
                    className="ml-auto rounded-sm p-1 opacity-0 hover:bg-sidebar-accent group-hover/sidebar:opacity-100"
                >
                    <ChevronsLeft className="h-4 w-4" />
                </button>
            )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-2">
            <nav className="grid gap-1 px-2">
                <button className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                    <Search className="h-4 w-4" />
                    {!isCollapsed && <span>Search</span>}
                </button>
                <button className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                    <Settings className="h-4 w-4" />
                    {!isCollapsed && <span>Settings</span>}
                </button>
                <button className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                    <Plus className="h-4 w-4" />
                    {!isCollapsed && <span>New Page</span>}
                </button>
            </nav>
        </div>

        {/* Drag Handle */}
        <div
          onMouseDown={startResizing}
          className="absolute right-0 top-0 h-full w-1 cursor-ew-resize bg-border opacity-0 transition-opacity hover:opacity-100 group-hover/sidebar:opacity-100"
        />
      </aside>
    </>
  )
}
