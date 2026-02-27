"use client";

import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { SidebarNav } from './sidebar-nav';
import { Separator } from '@/components/ui/separator';
import { PushNotificationPrompt } from './push-notification-prompt';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <SidebarNav />
        <PushNotificationPrompt />
        <SidebarInset className="flex flex-col">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4 lg:px-6 sticky top-0 z-10">
            <SidebarTrigger className="lg:hidden" />
            <Separator orientation="vertical" className="mr-2 h-4 lg:hidden" />
            <div className="flex-1 flex items-center justify-between">
              <div className="md:hidden flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white font-bold text-xs">
                  AM
                </div>
                <span className="font-black text-slate-900 tracking-tighter">AGENCIA AM</span>
              </div>
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
