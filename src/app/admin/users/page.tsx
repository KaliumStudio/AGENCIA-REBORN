"use client";

import { useEffect, useState } from 'react';
import { userService } from '@/services/user.service';
import { UserProfile, UserRole } from '@/types';
import { RoleGuard } from '@/components/layout/role-guard';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { UserPlus, Shield, User, Edit, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    userService.getAllUsers().then(data => {
      setUsers(data);
      setLoading(false);
    });
  }, []);

  const roleColors: Record<UserRole, string> = {
    admin: "bg-destructive/10 text-destructive border-destructive/20",
    editor: "bg-accent/10 text-accent border-accent/20",
    client: "bg-primary/10 text-primary border-primary/20",
  };

  const filteredUsers = users.filter(u => u.displayName.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <RoleGuard allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Usuarios</h1>
            <p className="text-sm md:text-base text-muted-foreground">Administra los accesos y roles de tu equipo y clientes.</p>
          </div>
          <Button disabled className="w-full md:w-auto h-11 md:h-10">
            <UserPlus className="mr-2 h-4 w-4" /> Invitar Usuario
          </Button>
        </div>

        <div className="mb-6 relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            className="pl-9 h-11 md:h-10" 
            placeholder="Buscar usuario..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Desktop View */}
        <div className="hidden md:block bg-white rounded-xl shadow-sm border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredUsers.map((u) => (
                <TableRow key={u.uid}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                       <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">
                          {u.displayName.substring(0, 2).toUpperCase()}
                       </div>
                       <div>
                          <div className="font-semibold">{u.displayName}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{u.uid}</div>
                       </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("capitalize", roleColors[u.role])}>
                       {u.role === 'admin' ? <Shield className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
                       {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.active ? "default" : "secondary"}>{u.active ? "Activo" : "Inactivo"}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
          ) : filteredUsers.map((u) => (
            <Card key={u.uid} className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-sm text-primary">
                      {u.displayName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold">{u.displayName}</div>
                      <Badge variant="outline" className={cn("mt-1 text-[10px] h-5", roleColors[u.role])}>
                        {u.role}
                      </Badge>
                    </div>
                  </div>
                  <Badge variant={u.active ? "default" : "secondary"}>{u.active ? "Activo" : "Inactivo"}</Badge>
                </div>
                <div className="flex justify-end border-t pt-3">
                  <Button variant="outline" size="sm" className="w-full">Editar Perfil</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
