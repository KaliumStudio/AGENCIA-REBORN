import React from 'react';
import { 
  Layout, CheckCircle2, Gift, Clock, 
  FlipHorizontal, MessageSquare, Code2, 
  Star, Image as ImageIcon, Layers,
  ShieldCheck, Video, Flame, Eye, ShoppingCart, Minus, Plus
} from 'lucide-react';
import { WidgetDefinition } from '@/types/landing-builder';
import { 
  GLOBAL_CONTROLS, GLOBAL_DEFAULTS, 
  getWrapperStyles, getInnerStyles, 
  getWrapperStyleString, getInnerStyleString, 
  getTitleFontSize, getIconPath 
} from './widget-helpers';

// --- SLIDER VIEW (BeforeAfter) ---
const SliderView = ({ props }: { props: any }) => {
  const [position, setPosition] = React.useState(50);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isDragging = React.useRef(false);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setPosition(percent);
  };

  const onMouseMove = (e: React.MouseEvent) => { if (isDragging.current) handleMove(e.clientX); };
  const onTouchMove = (e: React.TouchEvent) => { if (isDragging.current) handleMove(e.touches[0].clientX); };

  return (
    <div 
      ref={containerRef}
      style={{ 
        position: 'relative', width: '100%', maxWidth: '100%', aspectRatio: '16/9', 
        userSelect: 'none', cursor: 'ew-resize', overflow: 'hidden', borderRadius: '8px'
      }}
      onMouseDown={() => isDragging.current = true}
      onMouseUp={() => isDragging.current = false}
      onMouseLeave={() => isDragging.current = false}
      onMouseMove={onMouseMove}
      onTouchStart={() => isDragging.current = true}
      onTouchEnd={() => isDragging.current = false}
      onTouchMove={onTouchMove}
    >
      <img src={props.imageAfter} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} alt="After" />
      <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '4px 8px', fontSize: '12px', fontWeight: 'bold', borderRadius: '4px', zIndex: 5 }}>{props.labelAfter}</span>
      <div style={{ position: 'absolute', top: 0, left: 0, width: `${position}%`, height: '100%', overflow: 'hidden', borderRight: '2px solid white', zIndex: 10 }}>
        <img src={props.imageBefore} style={{ position: 'absolute', top: 0, left: 0, width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '1000px', height: '100%', maxWidth: 'none', objectFit: 'cover', pointerEvents: 'none' }} alt="Before" />
        <span style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '4px 8px', fontSize: '12px', fontWeight: 'bold', borderRadius: '4px', zIndex: 15 }}>{props.labelBefore}</span>
      </div>
      <div style={{ position: 'absolute', top: '50%', left: `${position}%`, transform: 'translate(-50%, -50%)', width: '40px', height: '40px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20, boxShadow: '0 2px 6px rgba(0,0,0,0.3)', pointerEvents: 'none' }}>
        <FlipHorizontal size={20} color="black" />
      </div>
    </div>
  );
};

// --- TWO COLUMN VIEW (BeforeAfter) ---
const TwoColumnView = ({ props }: { props: any }) => {
  const pointsBefore = props.beforePoints || [];
  const pointsAfter = props.afterPoints || [];

  const renderCard = (type: 'before' | 'after', img: string, label: string, points: any[]) => {
    const badgeBg = type === 'before' ? props.badgeBgBefore : props.badgeBgAfter;
    const badgeColor = type === 'before' ? props.badgeTextBefore : props.badgeTextAfter;
    const iconColor = type === 'before' ? props.iconColorBefore : props.iconColorAfter;

    return (
      <div style={{
        flex: '1',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: props.cardBg,
        borderRadius: `${props.cardRadius}px`,
        overflow: 'hidden',
        boxShadow: props.cardShadow ? '0 4px 6px rgba(0,0,0,0.1)' : 'none',
        border: props.cardShadow ? 'none' : '1px solid #e5e7eb'
      }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <img src={img} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} alt={label} />
          {props.badgePosition !== 'below' && (
            <span style={{
              position: 'absolute',
              bottom: props.badgePosition === 'overlay' ? '10px' : 'auto',
              top: props.badgePosition === 'top' ? '10px' : 'auto',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: badgeBg,
              color: badgeColor,
              padding: '4px 8px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              zIndex: 2
            }}>
              {label}
            </span>
          )}
        </div>
        <div style={{ padding: `${props.cardPadding}px`, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {points.map((p: any, i: number) => (
            <div key={i} style={{ display: 'flex', alignItems: 'start', gap: '6px', fontSize: '0.85rem', color: props.textColor }}>
              <CheckCircle2 size={14} color={iconColor} style={{ marginTop: '2px', flexShrink: 0 }} />
              <span>{p.text || p}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: `${props.gap}px`, justifyContent: 'center' }}>
      {renderCard('before', props.imageBefore, props.labelBefore, pointsBefore)}
      {renderCard('after', props.imageAfter, props.labelAfter, pointsAfter)}
    </div>
  );
};

// --- BUNDLE SKINNER MOCK ---
const BundleSkinnerMock = ({ props }: { props: any }) => {
  const [selected, setSelected] = React.useState(0);
  const onSectionChange = props._onSectionChange || (() => {});
  const activeSection = props._activeSection || 'bundles';

  return (
    <div style={{ padding: '20px', border: '1px dashed #ccc', borderRadius: '8px', background: '#fff' }}>
      <div 
        onClick={() => onSectionChange('bundles')}
        className={`p-2 rounded-lg ${activeSection === 'bundles' ? 'ring-2 ring-primary bg-primary/5' : ''}`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${props.gap}px`, marginBottom: '20px' }}>
          {(props.bundles || []).map((bundle: any, i: number) => (
            <div 
              key={i}
              onClick={() => setSelected(i)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                border: `${props.borderWidth}px solid ${selected === i ? props.activeBorderColor : props.borderColor}`,
                borderRadius: `${props.borderRadius}px`,
                padding: `${props.paddingY}px ${props.paddingX}px`,
                backgroundColor: selected === i ? props.activeBgColor : props.cardBgColor,
                cursor: 'pointer', position: 'relative'
              }}
            >
              {bundle.topBadge1Text && (
                <div style={{
                  position: 'absolute', top: '-12px', right: '12px', background: bundle.topBadge1Bg,
                  color: bundle.topBadge1Color, padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold'
                }}>
                  {bundle.topBadge1Text}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {selected === i && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: props.activeBorderColor }} />}
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: props.titleSize }}>{bundle.titleOverride || `Variante ${i + 1}`}</div>
                  <div style={{ fontSize: '12px', opacity: 0.7 }}>{bundle.subtitle}</div>
                </div>
              </div>
              <div style={{ fontWeight: 'bold', fontSize: props.priceFontSize }}>{bundle.price}</div>
            </div>
          ))}
        </div>
      </div>
      <div 
        onClick={() => onSectionChange('button')}
        className={`p-2 mt-4 rounded-lg ${activeSection === 'button' ? 'ring-2 ring-primary bg-primary/5' : ''}`}
      >
        <button style={{
          width: '100%', background: props.buyBtnBgColor, color: props.buyBtnTextColor,
          padding: `${props.buyBtnPaddingY}px`, borderRadius: `${props.buyBtnBorderRadius}px`,
          fontWeight: 'bold', textTransform: props.buyBtnTransform as any, border: 'none'
        }}>
          {props.buyBtnText}
        </button>
      </div>
    </div>
  );
};

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
      textColor: '#ffffff'
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
    label: 'Beneficios Pro',
    icon: Gift,
    defaultProps: {
      items: [
        { title: 'Envío Gratis', desc: 'En pedidos superiores a $50.000', icon: 'truck' },
        { title: 'Garantía 30 Días', desc: 'Devolución sin preguntas.', icon: 'shield' },
        { title: 'Pago Seguro', desc: 'Tus datos están protegidos.', icon: 'credit-card' }
      ],
      iconColor: '#2962FF',
      cardBg: '#ffffff',
      ...GLOBAL_DEFAULTS
    },
    render: (props) => (
      <div style={getWrapperStyles(props)}>
        <div style={{ ...getInnerStyles(props), display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          {props.items.map((item: any, i: number) => (
            <div key={i} style={{ padding: '30px', background: props.cardBg, borderRadius: '12px', border: '1px solid #eee' }}>
              <div style={{ color: props.iconColor, marginBottom: '15px' }}>
                <CheckCircle2 size={32} />
              </div>
              <h4 style={{ fontWeight: 'bold', marginBottom: '8px' }}>{item.title}</h4>
              <p style={{ fontSize: '14px', opacity: 0.7 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
    exportHTML: (props, id) => `
      <div style="${getWrapperStyleString(props)}">
        <div style="${getInnerStyleString(props)}display:grid;grid-template-columns:repeat(auto-fit, minmax(250px, 1fr));gap:20px;">
          ${props.items.map((item: any, i: number) => `
            <div style="padding:30px;background:${props.cardBg};border-radius:12px;border:1px solid #eee;">
              <div id="${id}-icon-${i}" style="color:${props.iconColor};margin-bottom:15px;"></div>
              <h4 style="font-weight:bold;margin-bottom:8px;">${item.title}</h4>
              <p style="font-size:14px;opacity:0.7;">${item.desc}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `,
    exportJS: (props, id) => {
      const icons = props.items.map((it: any, i: number) => ({ id: `${id}-icon-${i}`, path: getIconPath(it.icon) }));
      return `
        (function(){
          var icons = ${JSON.stringify(icons)};
          icons.forEach(function(icon) {
            var el = document.getElementById(icon.id);
            if(el) el.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="'+icon.path+'"></path></svg>';
          });
        })();
      `;
    },
    controls: [
      { name: 'items', label: 'Items', type: 'array_objects', fields: [
        { name: 'title', label: 'Título', type: 'text' },
        { name: 'desc', label: 'Descripción', type: 'textarea' },
        { name: 'icon', label: 'Icono', type: 'icon' }
      ]},
      { name: 'iconColor', label: 'Color Icono', type: 'color' },
      { name: 'cardBg', label: 'Fondo Tarjeta', type: 'color' },
      ...GLOBAL_CONTROLS
    ]
  },
  {
    type: 'BEFORE_AFTER',
    label: 'Antes / Después',
    icon: FlipHorizontal,
    defaultProps: {
      layoutMode: 'slider',
      imageBefore: 'https://picsum.photos/seed/before/800/600',
      imageAfter: 'https://picsum.photos/seed/after/800/600',
      labelBefore: 'ANTES',
      labelAfter: 'DESPUÉS',
      title: 'Resultados Increíbles',
      gap: 15,
      cardBg: '#ffffff',
      cardRadius: 12,
      ...GLOBAL_DEFAULTS
    },
    render: (props) => (
      <div style={getWrapperStyles(props)}>
        <div style={getInnerStyles(props)}>
          <h2 style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '30px' }}>{props.title}</h2>
          {props.layoutMode === 'twoColumn' ? <TwoColumnView props={props} /> : <SliderView props={props} />}
        </div>
      </div>
    ),
    exportHTML: (props, id) => {
      const tag = 'h2';
      const styles = getWrapperStyleString(props);
      const inner = getInnerStyleString(props);
      if (props.layoutMode === 'twoColumn') {
        return `
          <div style="${styles}">
            <div style="${inner}">
              <h2 style="text-align:center;font-weight:bold;margin-bottom:30px;">${props.title}</h2>
              <div style="display:flex;gap:${props.gap}px;">
                <div style="flex:1;background:${props.cardBg};border-radius:${props.cardRadius}px;overflow:hidden;">
                  <img src="${props.imageBefore}" style="width:100%;aspect-ratio:4/3;object-fit:cover;">
                  <div style="padding:15px;text-align:center;font-weight:bold;">${props.labelBefore}</div>
                </div>
                <div style="flex:1;background:${props.cardBg};border-radius:${props.cardRadius}px;overflow:hidden;">
                  <img src="${props.imageAfter}" style="width:100%;aspect-ratio:4/3;object-fit:cover;">
                  <div style="padding:15px;text-align:center;font-weight:bold;">${props.labelAfter}</div>
                </div>
              </div>
            </div>
          </div>
        `;
      }
      return `
        <div style="${styles}">
          <div style="${inner}">
            <h2 style="text-align:center;font-weight:bold;margin-bottom:30px;">${props.title}</h2>
            <div id="ba-${id}" style="position:relative;width:100%;aspect-ratio:16/9;overflow:hidden;border-radius:8px;cursor:ew-resize;">
              <img src="${props.imageAfter}" style="width:100%;height:100%;object-fit:cover;">
              <div class="ba-overlay" style="position:absolute;top:0;left:0;width:50%;height:100%;overflow:hidden;border-right:2px solid white;">
                <img src="${props.imageBefore}" style="width:100%;height:100%;object-fit:cover;max-width:none;">
              </div>
              <div class="ba-handle" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:40px;height:40px;background:white;border-radius:50%;box-shadow:0 2px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;"></div>
            </div>
          </div>
        </div>
      `;
    },
    exportJS: (props, id) => {
      if (props.layoutMode === 'twoColumn') return '';
      return `
        (function(){
          var container = document.getElementById('ba-${id}');
          if(!container) return;
          var overlay = container.querySelector('.ba-overlay');
          var handle = container.querySelector('.ba-handle');
          handle.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2"><path d="M18 8L22 12L18 16M6 8L2 12L6 16"></path></svg>';
          function move(e) {
            var x = (e.pageX || e.touches[0].pageX) - container.getBoundingClientRect().left;
            var pct = Math.max(0, Math.min(x / container.offsetWidth * 100, 100));
            overlay.style.width = pct + '%';
            handle.style.left = pct + '%';
          }
          container.addEventListener('mousemove', move);
          container.addEventListener('touchmove', move);
        })();
      `;
    },
    controls: [
      { name: 'layoutMode', label: 'Modo', type: 'select', options: [{label: 'Slider', value: 'slider'}, {label: 'Doble Columna', value: 'twoColumn'}] },
      { name: 'title', label: 'Título', type: 'text' },
      { name: 'imageBefore', label: 'Imagen Antes', type: 'image' },
      { name: 'imageAfter', label: 'Imagen Después', type: 'image' },
      ...GLOBAL_CONTROLS
    ]
  },
  {
    type: 'BUNDLE_SKINNER',
    label: 'Bundle Skinner PRO',
    icon: Layers,
    defaultProps: {
      borderColor: '#e5e7eb',
      activeBorderColor: '#2962FF',
      cardBgColor: '#ffffff',
      activeBgColor: '#F0F5FF',
      borderRadius: 8,
      borderWidth: 2,
      gap: 12,
      paddingX: 16,
      paddingY: 12,
      buyBtnText: 'COMPRAR AHORA',
      buyBtnBgColor: '#2962FF',
      buyBtnTextColor: '#ffffff',
      buyBtnBorderRadius: 8,
      buyBtnPaddingY: 15,
      buyBtnTransform: 'uppercase',
      bundles: [
        { titleOverride: 'Pack Inicial', price: '$15.000', subtitle: 'Para probar' },
        { titleOverride: 'Pack Recomendado', price: '$27.000', subtitle: 'Más vendido', topBadge1Text: 'OFERTA' }
      ]
    },
    render: (props) => <BundleSkinnerMock props={props} />,
    exportHTML: () => '',
    exportJS: (props) => `
      (function(){
        var CONFIG = ${JSON.stringify(props)};
        // Lógica de inyección dinámica en Tienda Nube (abreviada)
        console.log('Bundle Skinner PRO configurado');
      })();
    `,
    controls: [
      { name: 'bundles', label: 'Configurar Bundles', type: 'array_objects', fields: [
        { name: 'titleOverride', label: 'Título', type: 'text' },
        { name: 'price', label: 'Precio', type: 'text' },
        { name: 'subtitle', label: 'Subtítulo', type: 'text' },
        { name: 'topBadge1Text', label: 'Badge Superior', type: 'text' },
        { name: 'topBadge1Bg', label: 'Color Badge', type: 'color' }
      ]},
      { name: 'activeBorderColor', label: 'Borde Activo', type: 'color', section: 'Estilos' },
      { name: 'buyBtnBgColor', label: 'Fondo Botón', type: 'color', section: 'Botón' },
      { name: 'buyBtnText', label: 'Texto Botón', type: 'text', section: 'Botón' }
    ]
  }
];
