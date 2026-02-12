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
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4 lg:px-6 sticky top-0 z-10">
            <SidebarTrigger className="lg:hidden" />
            <Separator orientation="vertical" className="mr-2 h-4 lg:hidden" />
            <div className="flex-1 flex items-center justify-between">
              <span className="font-bold text-slate-900 md:hidden">CreativeFlow</span>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 lg:p-10">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
