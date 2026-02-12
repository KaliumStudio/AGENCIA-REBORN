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
import { UserPlus, Shield, User, Edit } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <RoleGuard allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
            <p className="text-muted-foreground">Administra los accesos y roles de tu equipo y clientes.</p>
          </div>
          <Button disabled>
            <UserPlus className="mr-2 h-4 w-4" /> Invitar Usuario
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Empresa (Cliente)</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.uid}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                       <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center font-bold text-xs">
                          {u.displayName.substring(0, 2).toUpperCase()}
                       </div>
                       <div>
                          <div className="font-semibold">{u.displayName}</div>
                          <div className="text-xs text-muted-foreground">{u.uid}</div>
                       </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("capitalize px-3 py-1", roleColors[u.role])}>
                       {u.role === 'admin' ? <Shield className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
                       {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {u.active ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Activo</Badge>
                    ) : (
                      <Badge variant="secondary">Inactivo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {u.clientId || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                       <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}

import { cn } from '@/lib/utils';