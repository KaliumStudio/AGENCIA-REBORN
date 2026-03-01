
import { 
  Layout, CheckCircle2, MessageCircle, Clock, 
  MousePointer2, MessageSquare, Code2, 
  Star, Image as ImageIcon, ArrowDownCircle,
  Layers, ListOrdered, ShieldCheck, Video,
  Columns, Smartphone
} from 'lucide-react';
import { WidgetDefinition } from '@/types/landing-builder';

export const WIDGET_REGISTRY: WidgetDefinition[] = [
  {
    type: 'HERO',
    label: 'Cabecera (Hero)',
    icon: Layout,
    defaultProps: {
      title: 'Tu Oferta Irresistible Aquí',
      subtitle: 'Explica el beneficio principal de tu producto en una frase corta.',
      buttonText: 'COMPRAR AHORA',
      bgColor: '#2962FF',
      textColor: '#ffffff',
      height: '400px'
    },
    render: (props) => (
      <div style={{ background: props.bgColor, color: props.textColor }} className="p-12 text-center">
        <h1 className="text-4xl font-black mb-4">{props.title}</h1>
        <p className="opacity-80 mb-8">{props.subtitle}</p>
        <button style={{ background: props.textColor, color: props.bgColor }} className="px-8 py-3 rounded-full font-bold uppercase">{props.buttonText}</button>
      </div>
    ),
    exportHTML: (props) => `
      <section style="background-color: ${props.bgColor}; color: ${props.textColor}; padding: 80px 20px; text-align: center;">
        <h1 style="font-size: 2.8rem; font-weight: 900; margin-bottom: 15px; line-height: 1.1;">${props.title}</h1>
        <p style="font-size: 1.3rem; opacity: 0.9; margin-bottom: 40px;">${props.subtitle}</p>
        <a href="#" style="background-color: ${props.textColor}; color: ${props.bgColor}; padding: 18px 50px; border-radius: 12px; text-decoration: none; font-weight: 900; text-transform: uppercase;">${props.buttonText}</a>
      </section>
    `,
    controls: [
      { name: 'title', label: 'Título', type: 'text' },
      { name: 'subtitle', label: 'Subtítulo', type: 'textarea' },
      { name: 'buttonText', label: 'Texto Botón', type: 'text' },
      { name: 'bgColor', label: 'Color Fondo', type: 'color' },
      { name: 'textColor', label: 'Color Texto', type: 'color' }
    ]
  },
  {
    type: 'BENEFITS',
    label: 'Beneficios',
    icon: CheckCircle2,
    defaultProps: {
      items: [
        { title: 'Envío Gratis', desc: 'En compras mayores a $50.000', icon: 'Truck' },
        { title: 'Calidad Premium', desc: 'Materiales seleccionados', icon: 'Star' }
      ]
    },
    render: (props) => (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-12 bg-slate-50">
        {props.items.map((item: any, i: number) => (
          <div key={i} className="text-center">
            <div className="w-10 h-10 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
            <h4 className="font-bold">{item.title}</h4>
            <p className="text-xs text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>
    ),
    exportHTML: (props) => `
      <div style="display: flex; flex-wrap: wrap; padding: 60px 10px; justify-content: center; background: #ffffff; gap: 20px;">
        ${props.items.map((item: any) => `
          <div style="flex: 1; min-width: 280px; padding: 30px; text-align: center; border: 1px solid #eee; border-radius: 20px;">
            <div class="am-icon" data-icon="${item.icon}" style="width: 50px; height: 50px; margin: 0 auto 20px; color: #2962FF;"></div>
            <h3 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 10px;">${item.title}</h3>
            <p style="font-size: 0.95rem; color: #555;">${item.desc}</p>
          </div>
        `).join('')}
      </div>
    `,
    controls: []
  },
  {
    type: 'BUNDLE_SKINNER',
    label: 'Skinner de Combos',
    icon: Layers,
    defaultProps: {
      primaryColor: '#2962FF',
      borderRadius: '12px',
      showBadges: true,
      priceColor: '#00c853'
    },
    render: (props) => (
      <div className="p-6 border rounded-xl" style={{ borderColor: props.primaryColor }}>
        <h3 className="font-bold mb-4">Vista Previa de Combo</h3>
        <div className="flex gap-4 items-center">
          <div className="w-16 h-16 bg-slate-200 rounded"></div>
          <div className="flex-1">
            <p className="font-bold">Pack X3 Auriculares</p>
            <p className="text-lg font-black" style={{ color: props.priceColor }}>$45.000</p>
          </div>
          <button style={{ background: props.primaryColor, borderRadius: props.borderRadius }} className="px-4 py-2 text-white text-xs font-bold">COMPRAR</button>
        </div>
      </div>
    ),
    exportHTML: () => `<!-- Skinner content managed by JS -->`,
    exportJS: (props) => `
      window.AM_SKINNER_CONFIG = ${JSON.stringify(props)};
      console.log('AM Skinner Loaded');
    `,
    controls: [
      { name: 'primaryColor', label: 'Color Principal', type: 'color' },
      { name: 'priceColor', label: 'Color Precio', type: 'color' },
      { name: 'borderRadius', label: 'Borde Redondeado', type: 'text' }
    ]
  },
  {
    type: 'CUSTOM_CODE',
    label: 'Código IA',
    icon: Code2,
    defaultProps: {
      html: '<div style="padding: 20px; text-align: center; border: 2px dashed #ccc;">Contenido generado por IA</div>',
      js: ''
    },
    render: (props) => <div dangerouslySetInnerHTML={{ __html: props.html }} />,
    exportHTML: (props) => props.html,
    exportJS: (props) => props.js,
    controls: [
      { name: 'html', label: 'HTML', type: 'textarea' },
      { name: 'js', label: 'JavaScript', type: 'textarea' }
    ]
  }
];
