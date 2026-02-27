
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { chatService } from '@/services/chat.service';
import { notificationService } from '@/services/notification.service';
import { LayoutDashboard, FolderKanban, Users, Building2, LogOut, Bell, BellOff, Loader2, RefreshCw, XCircle, Scissors } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarGroup, SidebarGroupLabel } from '@/components/ui/sidebar';
import { auth } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function SidebarNav() {
  const { profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && profile?.uid) {
      const unsubscribe = chatService.subscribeToUnreadCount(profile.uid, setUnreadCount);
      return () => unsubscribe();
    }
  }, [profile, authLoading]);

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  const handleEnableNotifications = async () => {
    if (!profile?.uid) return;
    
    setNotifLoading(true);
    try {
      await notificationService.enablePush(profile.uid);
      toast({
        title: "Notificaciones activas",
        description: "Este dispositivo recibirá avisos de nuevos mensajes.",
      });
    } catch (error: any) {
      toast({
        title: "Error al activar",
        description: error.message || "No se pudo completar el registro.",
        variant: "destructive"
      });
    } finally {
      setNotifLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    if (!profile?.uid) return;
    setNotifLoading(true);
    try {
      await notificationService.disablePush(profile.uid);
      toast({
        title: "Notificaciones desactivadas",
        description: "Ya no recibirás alertas en tus dispositivos.",
      });
    } catch (error: any) {
      toast({ title: "Error", description: "No se pudo desactivar.", variant: "destructive" });
    } finally {
      setNotifLoading(false);
    }
  };

  const hasTokens = Array.isArray(profile?.fcmTokens) 
    ? profile.fcmTokens.length > 0 
    : (profile?.fcmTokens ? Object.keys(profile.fcmTokens).length > 0 : false);

  const isPushEnabled = profile?.notificationPrefs?.push;
  const isPending = isPushEnabled && !hasTokens;
  const isActive = isPushEnabled && hasTokens;

  const menuItems = {
    admin: [
      { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
      { label: 'Tandas', icon: FolderKanban, href: '/admin/batches' },
      { label: 'Clientes', icon: Building2, href: '/admin/clients' },
      { label: 'Editores', icon: Scissors, href: '/admin/editors' },
      { label: 'Usuarios', icon: Users, href: '/admin/users' },
    ],
    editor: [
      { label: 'Mis Tandas', icon: FolderKanban, href: '/editor/batches' },
    ],
    client: [
      { label: 'Mis Tandas', icon: FolderKanban, href: '/client/batches' },
      { label: 'Nueva Tanda', icon: FolderKanban, href: '/client/batches/new' },
    ]
  };

  const currentMenu = profile ? menuItems[profile.role] : [];

  return (
    <Sidebar className="border-r border-sidebar-border bg-white">
      <SidebarHeader className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg rotate-3">
            <span className="font-black text-xl tracking-tighter">AM</span>
          </div>
          <div>
            <h1 className="font-black text-lg leading-none tracking-tighter text-slate-900">AGENCIA AM</h1>
            <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-widest">{profile?.role}</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-bold text-slate-400">NAVEGACIÓN</SidebarGroupLabel>
          <SidebarMenu>
            {currentMenu.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton 
                  isActive={pathname === item.href}
                  onClick={() => router.push(item.href)}
                  className={cn(
                    "transition-all duration-200 h-11 px-4",
                    pathname === item.href ? "bg-primary/10 text-primary font-bold" : "hover:bg-slate-50"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", pathname === item.href ? "text-primary" : "text-slate-500")} />
                  <span className="flex-1">{item.label}</span>
                  {(item.label === 'Mis Tandas' || item.label === 'Tandas') && unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-auto h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                      {unreadCount}
                    </Badge>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border bg-slate-50/50">
        {profile && (
          <div className="mb-4 space-y-1">
            {isActive ? (
              <div className="flex flex-col gap-1">
                <SidebarMenuButton disabled className="text-green-600 bg-green-50/50 border border-green-100 cursor-default hover:bg-green-50/50 h-9">
                  <Bell className="w-4 h-4" />
                  <span className="text-xs font-bold">Push Activo</span>
                </SidebarMenuButton>
                <button 
                  onClick={handleDisableNotifications}
                  disabled={notifLoading}
                  className="text-[10px] text-muted-foreground hover:text-destructive transition-colors text-left px-2 flex items-center gap-1 font-medium mt-1"
                >
                  <XCircle className="w-3 h-3" /> Desactivar alertas
                </button>
              </div>
            ) : isPending ? (
              <SidebarMenuButton
                onClick={handleEnableNotifications}
                disabled={notifLoading}
                className="text-amber-600 animate-pulse bg-amber-50 border border-amber-100 h-9"
              >
                {notifLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                <span className="text-xs font-bold">Reactivar push</span>
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton
                onClick={handleEnableNotifications}
                disabled={notifLoading}
                className="text-primary bg-primary/5 border border-primary/10 hover:bg-primary/10 h-9"
              >
                {notifLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BellOff className="w-4 h-4" />}
                <span className="text-xs font-bold">Activar avisos</span>
              </SidebarMenuButton>
            )}
          </div>
        )}
        <div className="mb-4 px-2">
          <p className="text-sm font-bold text-slate-900 truncate">{profile?.displayName}</p>
          <p className="text-[10px] text-muted-foreground truncate font-medium">{auth.currentUser?.email}</p>
        </div>
        <SidebarMenuButton 
          onClick={handleLogout} 
          className="text-destructive hover:text-destructive hover:bg-destructive/10 font-bold h-10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
