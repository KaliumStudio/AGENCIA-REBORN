"use client";

import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { SidebarNav } from './sidebar-nav';
import { Separator } from '@/components/ui/separator';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <SidebarNav />
        <SidebarInset className="flex flex-col">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-6">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex-1">
              {/* Optional dynamic title based on path */}
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-6 lg:p-10">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}