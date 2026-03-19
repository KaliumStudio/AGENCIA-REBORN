
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
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { Shield, User, Edit, Search, RefreshCw, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { AddUserDialog } from '@/components/users/add-user-dialog';
import { useToast } from '@/hooks/use-toast';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    const data = await userService.getAllUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = (uid: string) => {
    setUsers(prev => prev.filter(u => u.uid !== uid));
    userService.deleteUser(uid);
    toast({ title: "Perfil eliminado correctamente" });
  };

  const roleColors: Record<UserRole, string> = {
    admin: "bg-red-500/10 text-red-400 border-red-500/20",
    editor: "bg-primary/10 text-primary border-primary/20",
    client: "bg-accent/10 text-accent border-accent/20",
  };

  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.uid?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <RoleGuard allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white uppercase leading-none">Equipo</h1>
            <p className="text-gray-400 mt-4 font-medium">Administra los accesos y roles de tu factoría creativa.</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Button variant="outline" size="icon" onClick={fetchUsers} disabled={loading} className="h-12 w-12 border-white/10 hover:bg-white/5 rounded-xl">
              <RefreshCw className={`h-5 w-5 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <AddUserDialog onUserAdded={fetchUsers} />
          </div>
        </div>

        <div className="mb-8 relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input 
            className="pl-11 h-12 bg-white/[0.03] border-white/10 text-white placeholder:text-gray-600 rounded-2xl transition-all focus:border-primary" 
            placeholder="Buscar usuario..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="bg-white/[0.02] backdrop-blur-xl rounded-[40px] border border-white/10 overflow-hidden shadow-2xl">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-500 py-8 px-8">Perfil</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-500 py-8">Rol de Acceso</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-500 py-8 text-center">Estado</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-500 py-8 text-right px-8">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-white/5">
                    <TableCell colSpan={4} className="h-20 animate-pulse bg-white/[0.01]" />
                  </TableRow>
                ))
              ) : filteredUsers.length === 0 ? (
                <TableRow className="border-none">
                  <TableCell colSpan={4} className="text-center py-24 text-gray-500 font-bold uppercase tracking-widest text-xs opacity-50">
                    No se encontraron perfiles vinculados.
                  </TableCell>
                </TableRow>
              ) : filteredUsers.map((u) => (
                <TableRow key={u.uid} className="border-white/5 hover:bg-white/[0.04] group transition-all duration-300">
                  <TableCell className="px-8">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-sm text-primary group-hover:bg-primary/20 transition-all duration-500">
                          {(u.displayName || '??').substring(0, 2).toUpperCase()}
                       </div>
                       <div>
                          <div className="font-black text-white uppercase tracking-tight text-base leading-none">{u.displayName || 'Sin nombre'}</div>
                          <div className="text-[10px] text-gray-500 font-mono mt-1.5 uppercase tracking-widest">{u.uid.substring(0, 12)}...</div>
                       </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("font-black text-[9px] tracking-[0.2em] px-4 py-1.5 rounded-full uppercase", roleColors[u.role] || "bg-white/5 text-white border-white/10")}>
                       {u.role === 'admin' ? <Shield className="w-3.5 h-3.5 mr-2" /> : <User className="w-3.5 h-3.5 mr-2" />}
                       {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={cn(
                      "font-black text-[9px] tracking-widest px-3 py-1 rounded-full",
                      u.active ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-white/5 text-gray-500 border-white/10"
                    )}>{u.active ? "ACTIVO" : "INACTIVO"}</Badge>
                  </TableCell>
                  <TableCell className="text-right px-8">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" disabled className="h-10 w-10 rounded-xl bg-white/5 text-gray-600 cursor-not-allowed opacity-30"><Edit className="h-5 w-5" /></Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-xl">
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-slate-950 border-white/10 text-white rounded-[32px]">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-2xl font-black uppercase tracking-tighter">¿Eliminar este perfil?</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-400">
                              Se borrará el perfil de <span className="text-white font-bold">"{u.displayName}"</span> de la base de datos de CreativeFlow. Esta acción no elimina la cuenta de Firebase Auth del usuario.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="mt-6">
                            <AlertDialogCancel className="bg-transparent border-white/10 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl">Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteUser(u.uid)} className="bg-red-600 text-white hover:bg-red-700 rounded-xl font-bold">
                              Confirmar Eliminación
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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
