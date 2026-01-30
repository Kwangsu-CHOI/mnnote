import * as React from "react"
import { cn } from "@/lib/utils"

interface MainWrapperProps extends React.HTMLAttributes<HTMLDivElement> {}

export function MainWrapper({ className, children, ...props }: MainWrapperProps) {
  return (
    <main className={cn("flex-1 overflow-y-auto p-4 md:p-6", className)} {...props}>
      <div className="mx-auto max-w-3xl space-y-6">
        {children}
      </div>
    </main>
  )
}
