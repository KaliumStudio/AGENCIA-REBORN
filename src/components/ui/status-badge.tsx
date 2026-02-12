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
  delivered: { label: 'Entregado', variant: 'default' },
  revisions: { label: 'Correcciones', variant: 'destructive' },
  approved: { label: 'Aprobado', variant: 'default' },
};

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  // Fallback para estados no definidos o nulos
  const config = statusConfig[status] || { label: status || 'Pendiente', variant: 'outline' };
  
  return (
    <Badge variant={config.variant} className={cn("font-medium", className)}>
      {config.label}
    </Badge>
  );
};
