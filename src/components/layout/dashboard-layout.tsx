"use client";

import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { SidebarNav } from './sidebar-nav';
import { Separator } from '@/components/ui/separator';
import { PushNotificationPrompt } from './push-notification-prompt';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#05070A] text-white relative overflow-hidden">
        {/* Iluminación ambiental premium de fondo */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[10%] left-[15%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[140px] animate-pulse" />
          <div className="absolute bottom-[5%] right-[10%] w-[35%] h-[35%] bg-accent/10 rounded-full blur-[120px]" />
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-white/[0.01] rounded-full blur-[160px]" />
        </div>

        <SidebarNav />
        <PushNotificationPrompt />
        
        <SidebarInset className="flex flex-col relative z-10 bg-transparent">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/5 bg-black/20 backdrop-blur-xl px-4 lg:px-6 sticky top-0 z-20">
            <SidebarTrigger className="lg:hidden text-gray-400 hover:text-white" />
            <Separator orientation="vertical" className="mr-2 h-4 lg:hidden bg-white/10" />
            
            <div className="flex-1 flex items-center justify-between">
              <div className="md:hidden flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black text-xs shadow-lg shadow-primary/20">
                  AM
                </div>
                <span className="font-black text-white tracking-tighter text-sm">AGENCIA AM</span>
              </div>
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto p-4 lg:p-10 relative">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}