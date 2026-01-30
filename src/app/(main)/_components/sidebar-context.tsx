"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface SidebarContextType {
  refreshSidebar: () => void;
  refreshKey: number;
}

const SidebarContext = createContext<SidebarContextType | null>(null);

export const useSidebarRefresh = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    return { refreshSidebar: () => {}, refreshKey: 0 }; // No-op if not in sidebar context
  }
  return context;
};

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  
  const refreshSidebar = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <SidebarContext.Provider value={{ refreshSidebar, refreshKey }}>
      <div key={refreshKey}>
        {children}
      </div>
    </SidebarContext.Provider>
  );
};
