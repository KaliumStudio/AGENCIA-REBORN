
import { Badge } from '@/components/ui/badge';
import { BatchStatus } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: BatchStatus;
  className?: string;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  new: { label: 'Nuevo', variant: 'outline' },
  in_progress: { label: 'En Progreso', variant: 'secondary' },
  pending_review: { label: 'Revisión Admin', variant: 'secondary' },
  delivered: { label: 'Entregado', variant: 'default' },
  revisions: { label: 'Correcciones', variant: 'destructive' },
  approved: { label: 'Aprobado', variant: 'default' },
  rejected: { label: 'Rechazado', variant: 'destructive' },
};

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  // Fallback para estados no definidos o nulos
  const config = statusConfig[status] || { label: status || 'Pendiente', variant: 'outline' };
  
  return (
    <Badge 
      variant={config.variant} 
      className={cn(
        "font-bold uppercase text-[10px] tracking-wider", 
        status === 'pending_review' && "bg-orange-500 text-white border-none",
        status === 'rejected' && "bg-red-600 text-white border-none animate-pulse",
        className
      )}
    >
      {config.label}
    </Badge>
  );
};
