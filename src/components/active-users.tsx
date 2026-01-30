"use client";

import { useOthers, useSelf } from "@/liveblocks.config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const ActiveUsers = () => {
  const others = useOthers();
  const currentUser = useSelf();
  const hasMoreUsers = others.length > 3;

  return (
    <div className="flex items-center gap-x-2">
      <div className="flex items-center -space-x-2">
        {currentUser && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Avatar className="h-8 w-8 border-2 border-background">
                  <AvatarImage src={currentUser.info.avatar} />
                  <AvatarFallback>{currentUser.info.name?.charAt(0)}</AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p>{currentUser.info.name} (You)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {others.slice(0, 3).map(({ connectionId, info }) => (
          <TooltipProvider key={connectionId}>
            <Tooltip>
              <TooltipTrigger>
                <Avatar className="h-8 w-8 border-2 border-background">
                  <AvatarImage src={info.avatar} />
                  <AvatarFallback>{info.name?.charAt(0)}</AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p>{info.name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}

        {hasMoreUsers && (
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted border-2 border-background text-xs font-medium">
            +{others.length - 3}
          </div>
        )}
      </div>
    </div>
  );
};
