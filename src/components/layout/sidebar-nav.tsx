"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { chatService } from '@/services/chat.service';
import { notificationService } from '@/services/notification.service';
import { LayoutDashboard, FolderKanban, Users, Building2, LogOut, Bell, BellOff, Loader2 } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarGroup, SidebarGroupLabel } from '@/components/ui/sidebar';
import { auth } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export function SidebarNav() {
  const { profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifStatus, setNotifStatus] = useState<string>('default');

  useEffect(() => {
    // Solo suscribirse si el perfil está listo y tiene UID
    // Esto evita errores de permisos al cargar la página
    if (!authLoading && profile?.uid) {
      const unsubscribe = chatService.subscribeToUnreadCount(profile.uid, setUnreadCount);
      setNotifStatus(notificationService.getPermissionStatus());
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
      await notificationService.registerPushToken(profile.uid);
      setNotifStatus('granted');
      toast({
        title: "Notificaciones activadas",
        description: "Recibirás avisos de nuevos mensajes en este dispositivo.",
      });
    } catch (error: any) {
      toast({
        title: "Error al activar",
        description: error.message || "Ocurrió un problema al solicitar permisos.",
        variant: "destructive"
      });
    } finally {
      setNotifLoading(false);
    }
  };

  const menuItems = {
    admin: [
      { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
      { label: 'Tandas', icon: FolderKanban, href: '/admin/batches' },
      { label: 'Clientes', icon: Building2, href: '/admin/clients' },
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
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg">
            <span className="font-bold text-xl">CF</span>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none">CreativeFlow</h1>
            <p className="text-xs text-muted-foreground mt-1 capitalize">{profile?.role}</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menú Principal</SidebarGroupLabel>
          <SidebarMenu>
            {currentMenu.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton 
                  isActive={pathname === item.href}
                  onClick={() => router.push(item.href)}
                  className="transition-all duration-200"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="flex-1">{item.label}</span>
                  {item.label === 'Mis Tandas' && unreadCount > 0 && (
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
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {profile && notifStatus !== 'unsupported' && (
          <div className="mb-4">
            <SidebarMenuButton
              onClick={handleEnableNotifications}
              disabled={notifLoading || notifStatus === 'granted'}
              className={notifStatus === 'granted' ? "text-green-600 opacity-80" : "text-primary"}
            >
              {notifLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : notifStatus === 'granted' ? (
                <Bell className="w-5 h-5" />
              ) : (
                <BellOff className="w-5 h-5" />
              )}
              <span>{notifStatus === 'granted' ? "Notificaciones activas" : "Activar notificaciones"}</span>
            </SidebarMenuButton>
          </div>
        )}
        <div className="mb-4 px-2">
          <p className="text-sm font-medium truncate">{profile?.displayName}</p>
          <p className="text-xs text-muted-foreground truncate">{auth.currentUser?.email}</p>
        </div>
        <SidebarMenuButton 
          onClick={handleLogout} 
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-5 h-5" />
          <span>Cerrar Sesión</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}