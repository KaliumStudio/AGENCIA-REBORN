/**
 * @fileOverview Helpers compartidos para los widgets del Landing Builder.
 * Maneja estilos globales, conversiones de unidades y rutas de iconos.
 */

export const GLOBAL_DEFAULTS = {
  paddingTop: '40px',
  paddingBottom: '40px',
  paddingLeft: '20px',
  paddingRight: '20px',
  bgColor: '#ffffff',
  containerWidth: '1200px'
};

export const GLOBAL_CONTROLS = [
  { name: 'paddingTop', label: 'Padding Superior', type: 'text', section: 'Diseño Global' },
  { name: 'paddingBottom', label: 'Padding Inferior', type: 'text', section: 'Diseño Global' },
  { name: 'bgColor', label: 'Color de Fondo', type: 'color', section: 'Diseño Global' },
  { name: 'containerWidth', label: 'Ancho Máximo', type: 'text', section: 'Diseño Global' }
];

export function getWrapperStyles(props: any): React.CSSProperties {
  return {
    paddingTop: props.paddingTop || GLOBAL_DEFAULTS.paddingTop,
    paddingBottom: props.paddingBottom || GLOBAL_DEFAULTS.paddingBottom,
    paddingLeft: props.paddingLeft || GLOBAL_DEFAULTS.paddingLeft,
    paddingRight: props.paddingRight || GLOBAL_DEFAULTS.paddingRight,
    backgroundColor: props.bgColor || GLOBAL_DEFAULTS.bgColor,
    width: '100%',
    boxSizing: 'border-box'
  };
}

export function getInnerStyles(props: any): React.CSSProperties {
  return {
    maxWidth: props.containerWidth || GLOBAL_DEFAULTS.containerWidth,
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '100%'
  };
}

export function getWrapperStyleString(props: any): string {
  return `padding-top:${props.paddingTop || GLOBAL_DEFAULTS.paddingTop};padding-bottom:${props.paddingBottom || GLOBAL_DEFAULTS.paddingBottom};background-color:${props.bgColor || GLOBAL_DEFAULTS.bgColor};width:100%;box-sizing:border-box;`;
}

export function getInnerStyleString(props: any): string {
  return `max-width:${props.containerWidth || GLOBAL_DEFAULTS.containerWidth};margin-left:auto;margin-right:auto;width:100%;`;
}

export function getTitleFontSize(tag: string = 'h2'): string {
  switch (tag) {
    case 'h1': return '2.5rem';
    case 'h2': return '2rem';
    case 'h3': return '1.5rem';
    case 'h4': return '1.2rem';
    default: return '2rem';
  }
}

// Mapa básico de rutas Lucide para exportación manual (simplificado para MVP)
export function getIconPath(name: string): string {
  const icons: Record<string, string> = {
    'truck': 'M5 18H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.19M15 6h2a2 2 0 0 1 2 2v2M23 13v6a2 2 0 0 1-2 2H19M14 18h-4M14 6v12M9 18H7M3 10h4M17 13l-5-5 5-5M2 14h5',
    'shield': 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    'credit-card': 'M1 76h22M1 48h22M1 10h22M1 10v12',
    'star': 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    'check': 'M20 6L9 17l-5-5'
  };
  return icons[name] || icons['check'];
}
