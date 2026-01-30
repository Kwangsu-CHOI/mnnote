"use client";

import { ThemeToggle } from "@/components/theme-toggle";

export default function SettingsPage() {
  return (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      <div className="max-w-lg w-full p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your preferences
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between border rounded-lg p-4">
            <div>
              <h3 className="font-medium">Appearance</h3>
              <p className="text-sm text-muted-foreground">
                Customize how your app looks
              </p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}
