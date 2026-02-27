
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { notificationService } from '@/services/notification.service';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Bell, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function PushNotificationPrompt() {
  const { profile, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && profile) {
      // Verificar si las notificaciones están desactivadas o si el usuario no tiene tokens
      const hasTokens = Array.isArray(profile.fcmTokens) 
        ? profile.fcmTokens.length > 0 
        : (profile.fcmTokens ? Object.keys(profile.fcmTokens).length > 0 : false);

      const isPushEnabled = profile.notificationPrefs?.push;
      
      // Si el push no está habilitado o no tienen tokens (probablemente un dispositivo nuevo)
      if (!isPushEnabled || !hasTokens) {
        // No mostrar inmediatamente, esperar un momento para no ser intrusivo al cargar
        const timer = setTimeout(() => {
          // Usar sessionStorage para no molestar cada vez que cambien de página en la misma sesión
          const dismissed = sessionStorage.getItem('notif-prompt-dismissed');
          if (!dismissed) {
            setOpen(true);
          }
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [profile, loading]);

  const handleEnable = async () => {
    if (!profile?.uid) return;
    setNotifLoading(true);
    try {
      await notificationService.enablePush(profile.uid);
      toast({
        title: "Notificaciones activas",
        description: "¡Excelente! Ahora recibirás alertas de tus tandas en tiempo real.",
      });
      setOpen(false);
    } catch (error: any) {
      console.error(error);
      toast({
        title: "No se pudo activar",
        description: error.message || "Asegúrate de permitir las notificaciones en la configuración de tu navegador.",
        variant: "destructive"
      });
      // No cerramos el diálogo por error para que puedan reintentar o cancelar conscientemente
    } finally {
      setNotifLoading(false);
    }
  };

  const handleClose = () => {
    sessionStorage.setItem('notif-prompt-dismissed', 'true');
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-4 rounded-full">
              <Bell className="h-8 w-8 text-primary animate-bounce" />
            </div>
          </div>
          <AlertDialogTitle className="text-center text-xl">¿Quieres recibir avisos?</AlertDialogTitle>
          <AlertDialogDescription className="text-center text-base">
            Activa las notificaciones push para enterarte al instante cuando recibas un mensaje o cuando el material creativo esté listo para revisar.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-center mt-4">
          <AlertDialogCancel onClick={handleClose} disabled={notifLoading} className="sm:flex-1">
            Ahora no
          </AlertDialogCancel>
          <AlertDialogAction onClick={(e) => { e.preventDefault(); handleEnable(); }} disabled={notifLoading} className="sm:flex-1">
            {notifLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Activar Notificaciones
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
