"use client";

import { ReactNode } from "react";
import { LiveblocksProvider as LiveblocksProviderWrapper } from "@liveblocks/react/suspense";

interface LiveblocksProviderProps {
  children: ReactNode;
}

export const LiveblocksProvider = ({ children }: LiveblocksProviderProps) => {
  return (
    <LiveblocksProviderWrapper authEndpoint="/api/liveblocks-auth">
      {children}
    </LiveblocksProviderWrapper>
  );
};
