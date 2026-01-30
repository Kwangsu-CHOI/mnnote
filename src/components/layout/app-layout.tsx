"use client"

import * as React from "react"
import { Sidebar } from "./sidebar"
import { TopNav } from "./top-nav"
import { MainWrapper } from "./main-wrapper"

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [sidebarWidth, setSidebarWidth] = React.useState(240)
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        width={sidebarWidth}
        setWidth={setSidebarWidth}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />
      <div className="flex flex-1 flex-col overflow-hidden transition-all duration-300 ease-in-out">
        <TopNav
            onMenuClick={() => setIsMobileOpen(!isMobileOpen)}
            isCollapsed={isCollapsed}
            onExpandClick={() => setIsCollapsed(false)}
        />
        <MainWrapper>
            {children}
        </MainWrapper>
      </div>
    </div>
  )
}
