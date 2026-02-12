import { Badge } from '@/components/ui/badge';
import { BatchStatus } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: BatchStatus;
  className?: string;
}

const statusConfig: Record<BatchStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  new: { label: 'Nuevo', variant: 'outline' },
  in_progress: { label: 'En Progreso', variant: 'secondary' },
  delivered: { label: 'Entregado', variant: 'default' },
  revisions: { label: 'Correcciones', variant: 'destructive' },
  approved: { label: 'Aprobado', variant: 'default' },
};

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} className={cn("font-medium", className)}>
      {config.label}
    </Badge>
  );
};