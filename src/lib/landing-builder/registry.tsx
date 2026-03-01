
import { Layout, CheckCircle2, MessageCircle, Clock, MousePointer2, Type, ImageIcon, ArrowDown } from 'lucide-react';
import { WidgetDefinition } from '@/types/landing-builder';

export const WIDGET_REGISTRY: WidgetDefinition[] = [
  {
    type: 'hero',
    label: 'Cabecera (Hero)',
    icon: Layout,
    defaultProps: {
      title: 'Tu Oferta Irresistible Aquí',
      subtitle: 'Explica el beneficio principal de tu producto en una frase corta.',
      buttonText: 'COMPRAR AHORA',
      bgColor: '#2962FF',
      textColor: '#ffffff',
      height: '400px'
    }
  },
  {
    type: 'benefits',
    label: 'Beneficios',
    icon: CheckCircle2,
    defaultProps: {
      items: [
        { title: 'Envío Gratis', desc: 'En compras mayores a $50.000', icon: 'Truck' },
        { title: 'Calidad Premium', desc: 'Materiales seleccionados', icon: 'Star' },
        { title: 'Garantía', desc: '30 días de satisfacción', icon: 'ShieldCheck' }
      ],
      columns: 3
    }
  },
  {
    type: 'whatsapp',
    label: 'Botón Flotante WA',
    icon: MessageCircle,
    defaultProps: {
      phone: '5491100000000',
      message: 'Hola! Quiero más info',
      label: '¿Dudas? Habla con nosotros'
    }
  },
  {
    type: 'timer',
    label: 'Contador Oferta',
    icon: Clock,
    defaultProps: {
      endTime: '2025-12-31T23:59:59',
      label: 'LA OFERTA TERMINA EN:',
      bgColor: '#ff0000',
      textColor: '#ffffff'
    }
  },
  {
    type: 'cta',
    label: 'Llamado a la Acción',
    icon: MousePointer2,
    defaultProps: {
      text: '¡LO QUIERO YA!',
      subtext: 'Pocas unidades disponibles',
      url: '#',
      bgColor: '#00c853'
    }
  }
];
