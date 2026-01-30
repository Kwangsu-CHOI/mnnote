"use client";

import { ReactNode } from "react";
import { RoomProvider as LiveblocksRoomProvider, ClientSideSuspense } from "@liveblocks/react/suspense";
import { Spinner } from "@/components/spinner";

interface RoomProviderProps {
  roomId: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export const RoomProvider = ({ 
  roomId, 
  children,
  fallback = <div className="h-full flex items-center justify-center"><Spinner size="lg" /></div>
}: RoomProviderProps) => {
  return (
    <LiveblocksRoomProvider 
      id={roomId} 
      initialPresence={{ cursor: null }}
    >
      <ClientSideSuspense fallback={fallback}>
        {children}
      </ClientSideSuspense>
    </LiveblocksRoomProvider>
  );
};
