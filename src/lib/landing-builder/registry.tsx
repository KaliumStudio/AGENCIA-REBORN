
import { 
  Layout, CheckCircle2, MessageCircle, Clock, 
  MousePointer2, MessageSquare, Code2, 
  Star, Image as ImageIcon, ArrowDownCircle
} from 'lucide-react';
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
    type: 'testimonials',
    label: 'Testimonios',
    icon: MessageSquare,
    defaultProps: {
      items: [
        { name: 'María G.', text: 'Increíble calidad, llegó súper rápido. Recomiendo!', rating: 5 },
        { name: 'Juan P.', text: 'El producto superó mis expectativas.', rating: 5 }
      ]
    }
  },
  {
    type: 'timer',
    label: 'Contador Oferta',
    icon: Clock,
    defaultProps: {
      endTime: new Date(Date.now() + 86400000).toISOString(),
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
  },
  {
    type: 'custom_code',
    label: 'Código Personalizado',
    icon: Code2,
    defaultProps: {
      html: '<div style="padding: 20px; text-align: center; border: 2px dashed #ccc;">Inserta tu HTML aquí</div>'
    }
  }
];
