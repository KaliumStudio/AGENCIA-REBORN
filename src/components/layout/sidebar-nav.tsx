"use client";

import { useAuth } from '@/context/auth-context';
import { LayoutDashboard, FolderKanban, Users, Building2, LogOut, MessageSquare } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarGroup, SidebarGroupLabel } from '@/components/ui/sidebar';
import { auth } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';

export function SidebarNav() {
  const { profile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
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
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border">
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