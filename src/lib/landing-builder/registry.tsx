import React, { useState, useEffect, useRef } from 'react';
import { 
  Layout, Gift, FlipHorizontal, Layers, 
  CheckCircle, Clock, AlertCircle, Flame, 
  Eye, ShoppingCart, Minus, Plus,
  Type, List, ShieldCheck, Video, Code2, Star
} from 'lucide-react';
import { WidgetDefinition } from '@/types/landing-builder';
import { 
  GLOBAL_CONTROLS, GLOBAL_DEFAULTS, 
  getWrapperStyles, getInnerStyles, 
  getWrapperStyleString, getInnerStyleString, 
  getTitleFontSize, getIconPath 
} from './widget-helpers';

// --- BEFORE/AFTER INTERNAL COMPONENTS ---

const SliderView = ({ props }: { props: any }) => {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

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
                position: 'relative', width: '100%', maxWidth: '100%', aspectRatio: '16/9', height: props.height || 'auto',
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
                <img src={props.imageBefore} style={{ position: 'absolute', top: 0, left: 0, width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100vw', height: '100%', maxWidth: 'none', objectFit: 'cover', pointerEvents: 'none' }} alt="Before" />
                <span style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '4px 8px', fontSize: '12px', fontWeight: 'bold', borderRadius: '4px', zIndex: 15 }}>{props.labelBefore}</span>
            </div>
            <div style={{ position: 'absolute', top: '50%', left: `${position}%`, transform: 'translate(-50%, -50%)', width: '40px', height: '40px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20, boxShadow: '0 2px 6px rgba(0,0,0,0.3)', pointerEvents: 'none' }}>
                <FlipHorizontal size={20} color="black" />
            </div>
         </div>
  );
};

const TwoColumnView = ({ props }: { props: any }) => {
    const pointsBefore = props.beforePoints?.map ? props.beforePoints : [];
    const pointsAfter = props.afterPoints?.map ? props.afterPoints : [];

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
                boxShadow: props.cardShadow ? '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)' : 'none',
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
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            zIndex: 2,
                            whiteSpace: 'nowrap'
                        }}>
                            {label}
                        </span>
                    )}
                </div>
                
                {props.badgePosition === 'below' && (
                    <div style={{ textAlign: 'center', marginTop: '-12px', position: 'relative', zIndex: 3 }}>
                        <span style={{
                            backgroundColor: badgeBg,
                            color: badgeColor,
                            padding: '2px 8px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            display: 'inline-block'
                        }}>
                            {label}
                        </span>
                    </div>
                )}

                <div style={{ padding: `${props.cardPadding}px`, display: 'flex', flexDirection: 'column', gap: props.showDividers ? '0' : '8px' }}>
                    {points.length > 0 ? (
                        points.map((p: any, i: number) => (
                            <div key={i} style={{ 
                                display: 'flex', 
                                alignItems: 'start', 
                                gap: '6px', 
                                fontSize: '0.85rem', 
                                color: props.textColor, 
                                lineHeight: 1.3, 
                                wordBreak: 'break-word',
                                borderBottom: props.showDividers && i < points.length - 1 ? `1px solid ${props.dividerColor}` : 'none',
                                paddingBottom: props.showDividers ? '8px' : '0',
                                marginBottom: props.showDividers ? '8px' : '0'
                            }}>
                                <CheckCircle size={14} color={iconColor} style={{ marginTop: '2px', flexShrink: 0 }} />
                                <span>{p.text || p}</span>
                            </div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', opacity: 0.5, fontStyle: 'italic', fontSize: '0.8rem' }}>-</div>
                    )}
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

const BeforeAfterComponent = ({ props }: { props: any }) => {
  const TitleTag = props.titleTag || 'h2';
  return (
    <div style={getWrapperStyles(props)}>
      <div style={getInnerStyles(props)}>
         {(props.title || props.subtitle) && (
            <div style={{ textAlign: 'center', marginBottom: '32px', color: props.textColor }}>
               {props.title && <TitleTag dangerouslySetInnerHTML={{__html: props.title}} style={{ fontSize: getTitleFontSize(props.titleTag), fontWeight: 'bold', marginBottom: '8px', lineHeight: 1.2, marginTop: 0, color: 'inherit' }} />}
               {props.subtitle && <div dangerouslySetInnerHTML={{__html: props.subtitle}} style={{ fontSize: '1rem', opacity: 0.9 }}></div>}
            </div>
         )}
         
         {props.layoutMode === 'twoColumn' ? <TwoColumnView props={props} /> : <SliderView props={props} />}
      </div>
    </div>
  );
};

// --- BUNDLE SKINNER INTERNAL COMPONENTS ---

const BundleSkinnerMock = ({ props }: { props: any }) => {
    const bundles = props.bundles || [];
    const defaultIdx = Math.max(0, Math.min(props.defaultSelectedIndex || 0, bundles.length - 1));
    const [selected, setSelected] = useState<number>(defaultIdx);
    
    useEffect(() => {
        setSelected(Math.max(0, Math.min(props.defaultSelectedIndex || 0, bundles.length - 1)));
    }, [props.defaultSelectedIndex, bundles.length]);

    const onSectionChange = props._onSectionChange || (() => {});
    const activeSection = props._activeSection || 'bundles';

    const bundlesActive = activeSection === 'bundles';
    const buttonActive = activeSection === 'button';

    const renderWidgetIcon = (iconName: string, size: number) => {
        if (iconName === 'fire') return <Flame size={size} />;
        if (iconName === 'clock') return <Clock size={size} />;
        if (iconName === 'eye') return <Eye size={size} />;
        if (iconName === 'alert') return <AlertCircle size={size} />;
        return null;
    };

    return (
        <div style={{ padding: '20px', border: '1px dashed #ccc', borderRadius: '8px', background: '#fff' }}>
            <div 
                onClick={(e) => { e.stopPropagation(); onSectionChange('bundles'); }}
                className={`transition-all duration-200 p-2 rounded-lg ${bundlesActive ? 'ring-2 ring-indigo-500 bg-indigo-50/50' : 'hover:ring-2 hover:ring-indigo-200'}`}
            >
                <p className="text-xs font-bold text-gray-400 mb-2 uppercase text-center">
                    Sección Variantes {bundlesActive && '(Editando)'}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: `${props.gap}px`, marginBottom: '20px' }}>
                    {bundles.map((bundleData: any, i: number) => {
                        const isSelected = selected === i;
                        const borderColor = isSelected ? props.activeBorderColor : props.borderColor;
                        const bg = isSelected ? props.activeBgColor : props.cardBgColor;
                        const textColor = isSelected ? props.activeTextColor : props.textColor; 
                        const subtitleColor = isSelected ? props.activeSubtitleColor : props.subtitleColor;
                        const priceColor = isSelected ? props.activePriceColor : props.priceColor;
                        const displayTitle = bundleData.titleOverride || `Opción ${i + 1}`;

                        return (
                            <div 
                                key={i}
                                onClick={() => setSelected(i)}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    border: `${props.borderWidth}px solid ${borderColor}`, borderRadius: `${props.borderRadius}px`,
                                    padding: `${props.paddingY}px ${props.paddingX}px`, backgroundColor: bg,
                                    cursor: 'pointer', position: 'relative',
                                    boxShadow: isSelected ? `0 4px 12px rgba(0,0,0, 0.15)` : (props.shadow ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'),
                                    transform: isSelected ? 'translateY(-1px)' : 'none', transition: 'all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)', zIndex: isSelected ? 2 : 1,
                                    marginTop: (bundleData.topBadge1Text || bundleData.topBadge2Text || bundleData.topBadge3Text) ? '12px' : '0' 
                                }}
                            >
                                <div style={{ position: 'absolute', top: '-15px', right: '12px', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: '10px', zIndex: 10 }}>
                                    {[1, 2, 3].map(num => {
                                        const txt = bundleData[`topBadge${num}Text`];
                                        const badgeBg = bundleData[`topBadge${num}Bg`] || '#7a4a12';
                                        const badgeColor = bundleData[`topBadge${num}Color`] || '#fff';
                                        if (!txt) return null;
                                        return (
                                            <div key={num} style={{ position: 'relative', backgroundColor: badgeBg, color: badgeColor, fontWeight: 700, fontSize: '12.5px', lineHeight: 1, padding: '6px 10px', borderRadius: '4px', boxShadow: '0 4px 10px rgba(0,0,0,0.15)', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                                                <div style={{ position: 'absolute', top: '6px', left: '-8px', width: 0, height: 0, borderRight: `8px solid ${badgeBg}`, borderTop: '8px solid transparent', filter: 'brightness(0.6)', zIndex: -1 }} />
                                                {txt}
                                            </div>
                                        );
                                    })}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
                                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${isSelected ? props.activeBorderColor : '#d1d5db'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', flexShrink: 0, marginTop: '3px', transition: 'border-color 0.2s ease' }}>
                                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: props.activeBorderColor, transform: isSelected ? 'scale(1)' : 'scale(0)', transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }} />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                                <span style={{ fontWeight: '700', color: textColor, fontSize: props.titleSize, lineHeight: 1.2 }}>{displayTitle}</span>
                                                {bundleData.inlineBadgeText && (
                                                    <span style={{ backgroundColor: bundleData.inlineBadgeBg || '#333', color: bundleData.inlineBadgeColor || '#fff', fontSize: '0.65rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{bundleData.inlineBadgeText}</span>
                                                )}
                                            </div>
                                            {(bundleData.subtitle || props.globalSubtitle) && (
                                                <span style={{ fontSize: '0.85rem', color: subtitleColor, fontWeight: props.subtitleFontWeight === 'bold' ? 'bold' : 'normal', fontStyle: props.subtitleFontStyle === 'italic' ? 'italic' : 'normal', marginTop: '4px', lineHeight: 1.4 }}>{bundleData.subtitle || props.globalSubtitle}</span>
                                            )}
                                            {bundleData.triggerText && (
                                                <div className={bundleData.triggerPulse ? 'animate-pulse' : ''} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 'bold', marginTop: '6px', color: bundleData.triggerColor || '#ef4444' }}>
                                                    {bundleData.triggerIcon && renderWidgetIcon(bundleData.triggerIcon, 12)}
                                                    <span>{bundleData.triggerText}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {(bundleData.price || bundleData.comparePrice) && (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginLeft: '10px' }}>
                                            {bundleData.comparePrice && <span style={{ fontSize: props.comparePriceFontSize, textDecoration: 'line-through', color: '#9ca3af', marginBottom: '2px' }}>{bundleData.comparePrice}</span>}
                                            <span style={{ fontWeight: '800', color: priceColor, fontSize: props.priceFontSize }}>{bundleData.price}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div 
                onClick={(e) => { e.stopPropagation(); onSectionChange('button'); }}
                className={`transition-all duration-200 p-2 mt-4 rounded-lg ${buttonActive ? 'ring-2 ring-indigo-500 bg-indigo-50/50' : 'hover:ring-2 hover:ring-indigo-200'}`}
            >
                <p className="text-xs font-bold text-gray-400 mb-2 uppercase text-center border-t pt-2">Sección Compra {buttonActive && '(Editando)'}</p>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'stretch' }}>
                    {!props.hideQuantity && (
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ced4da', borderRadius: '4px', width: '100px', flexShrink: 0 }}>
                            <div style={{ padding: '0 8px', color: '#6c757d' }}><Minus size={14}/></div>
                            <input type="text" value="1" readOnly style={{ width: '100%', textAlign: 'center', border: 'none', outline: 'none', fontWeight: 'bold', color: '#495057' }} />
                            <div style={{ padding: '0 8px', color: '#6c757d' }}><Plus size={14}/></div>
                        </div>
                    )}
                    <button style={{ flex: 1, background: props.buyBtnBgGradient ? `linear-gradient(180deg, ${props.buyBtnBgColor}, ${props.buyBtnBgGradient})` : props.buyBtnBgColor || '#2c3e50', color: props.buyBtnTextColor || '#ffffff', border: 'none', borderRadius: `${props.buyBtnBorderRadius || 4}px`, padding: `${props.buyBtnPaddingY}px ${props.buyBtnPaddingX}px`, fontSize: props.buyBtnFontSize, fontWeight: 'bold', textTransform: props.buyBtnTransform, boxShadow: props.buyBtnShadow ? '0 4px 6px rgba(0,0,0,0.1)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                        {props.buyBtnText || 'Agregar al carrito'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- WIDGET DEFINITIONS ---

export const HERO: WidgetDefinition = {
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
};

export const BENEFITS: WidgetDefinition = {
  type: 'BENEFITS',
  label: 'Beneficios (Cards)',
  icon: Gift,
  defaultProps: {
    items: [
        { title: 'Envío Gratis', desc: 'En pedidos superiores a $50.000', icon: 'truck' },
        { title: 'Garantía 30 Días', desc: 'Devolución sin preguntas.', icon: 'shield' },
        { title: 'Pago Seguro', desc: 'Tus datos están protegidos.', icon: 'credit-card' }
    ],
    iconColor: '#4f46e5', 
    titleColor: '#111827', 
    descColor: '#6b7280',
    cardBg: '#ffffff',
    cardRadius: 12,
    showShadow: true,
    layout: 'grid', 
    ...GLOBAL_DEFAULTS,
    bgColor: '#f9fafb',
    paddingTop: '60px',
    paddingBottom: '60px'
  },
  controls: [
    { name: 'items', label: 'Beneficios', type: 'array_objects', itemLabel: 'Beneficio',
      fields: [
        { name: 'title', label: 'Título', type: 'text' },
        { name: 'desc', label: 'Descripción', type: 'textarea' },
        { name: 'icon', label: 'Icono', type: 'icon' }
      ]
    },
    { name: 'layout', label: 'Disposición', type: 'select', options: [{label:'Grilla Automática', value:'grid'}, {label:'Fila Centrada', value:'flex'}] },
    { name: 'cardBg', label: 'Fondo Tarjeta', type: 'color' },
    { name: 'iconColor', label: 'Color Icono', type: 'color' },
    { name: 'titleColor', label: 'Color Título', type: 'color' },
    { name: 'descColor', label: 'Color Texto', type: 'color' },
    { name: 'cardRadius', label: 'Redondeo Tarjeta', type: 'number' },
    { name: 'showShadow', label: 'Mostrar Sombra', type: 'toggle' },
    ...GLOBAL_CONTROLS
  ],
  render: (props) => (
    <div style={getWrapperStyles(props)}>
      <div style={{ 
          ...getInnerStyles(props), 
          display: props.layout === 'flex' ? 'flex' : 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '30px' 
      }}>
        {props.items?.map((item: any, i: number) => (
          <div key={i} style={{ 
              textAlign: 'left', 
              backgroundColor: props.cardBg,
              padding: '30px',
              borderRadius: `${props.cardRadius}px`,
              boxShadow: props.showShadow ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' : 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              flex: props.layout === 'flex' ? '1 1 250px' : 'auto',
              border: props.showShadow ? 'none' : '1px solid #e5e7eb'
          }}>
            <div style={{ 
                marginBottom: '20px', 
                color: props.iconColor,
                backgroundColor: `${props.iconColor}15`,
                padding: '12px',
                borderRadius: '12px',
                display: 'inline-block'
            }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={getIconPath(item.icon)} /></svg>
            </div>
            <h3 style={{ fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '8px', color: props.titleColor, lineHeight: 1.2 }}>{item.title}</h3>
            <p style={{ fontSize: '0.95rem', opacity: 0.9, color: props.descColor, lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  ),
  exportHTML: (props, id) => `
    <div style="${getWrapperStyleString(props)}">
      <div style="${getInnerStyleString(props)}display:${props.layout === 'flex' ? 'flex' : 'grid'};grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));flex-wrap:wrap;justify-content:center;gap:30px;">
        ${props.items?.map((item: any, i: number) => `
          <div style="text-align:left;background-color:${props.cardBg};padding:30px;border-radius:${props.cardRadius}px;box-shadow:${props.showShadow ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' : 'none'};display:flex;flex-direction:column;align-items:flex-start;flex:${props.layout === 'flex' ? '1 1 250px' : 'auto'};border:${props.showShadow ? 'none' : '1px solid #e5e7eb'};">
             <div id="${id}-icon-${i}" style="margin-bottom:20px;color:${props.iconColor};background-color:${props.iconColor}15;padding:12px;border-radius:12px;display:inline-block;line-height:0;min-width:32px;min-height:32px;"></div>
             <h3 style="font-weight:bold;font-size:1.25rem;margin-bottom:8px;color:${props.titleColor};line-height:1.2;">${item.title}</h3>
             <p style="font-size:0.95rem;opacity:0.9;color:${props.descColor};line-height:1.5;margin:0;">${item.desc}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `,
  exportJS: (props, id) => {
    const iconsData = props.items?.map((item: any, i: number) => ({
        id: `${id}-icon-${i}`,
        path: getIconPath(item.icon)
    })) || [];
    return `
    (function(){
        var icons = ${JSON.stringify(iconsData)};
        icons.forEach(function(item) {
            var el = document.getElementById(item.id);
            if(el) {
                el.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="' + item.path + '" /></svg>';
            }
        });
    })();
    `;
  }
};

export const BEFORE_AFTER: WidgetDefinition = {
    type: 'BEFORE_AFTER',
    label: 'Antes / Después',
    icon: FlipHorizontal,
    defaultProps: {
        layoutMode: 'slider',
        imageBefore: 'https://picsum.photos/400/400?grayscale',
        imageAfter: 'https://picsum.photos/400/400',
        labelBefore: 'ANTES',
        labelAfter: 'DESPUÉS',
        title: 'Resultados Increíbles',
        titleTag: 'h2',
        subtitle: 'Desliza para ver la diferencia',
        textColor: '#000000',
        gap: 15,
        cardBg: '#ffffff',
        cardRadius: 12,
        cardShadow: true,
        cardPadding: 15,
        badgePosition: 'overlay',
        badgeBgBefore: '#ef4444',
        badgeTextBefore: '#ffffff',
        badgeBgAfter: '#10b981',
        badgeTextAfter: '#ffffff',
        iconColorBefore: '#ef4444',
        iconColorAfter: '#10b981',
        showDividers: false,
        dividerColor: '#f3f4f6',
        beforePoints: [{ text: 'Piel apagada' }, { text: 'Manchas visibles' }],
        afterPoints: [{ text: 'Piel radiante' }, { text: 'Tono uniforme' }],
        ...GLOBAL_DEFAULTS
    },
    controls: [
        { name: 'layoutMode', label: 'Modo de Diseño', type: 'select', options: [{label: 'Deslizador (Slider)', value: 'slider'}, {label: 'Doble Columna (Fijo)', value: 'twoColumn'}] },
        { name: 'title', label: 'Título Principal', type: 'richText' },
        { name: 'titleTag', label: 'Etiqueta Título', type: 'select', options: [{label: 'H1', value: 'h1'}, {label: 'H2', value: 'h2'}, {label: 'H3', value: 'h3'}, {label: 'H4', value: 'h4'}] },
        { name: 'subtitle', label: 'Subtítulo', type: 'richText' },
        { name: 'imageBefore', label: 'Imagen Antes', type: 'image' },
        { name: 'labelBefore', label: 'Etiqueta Antes', type: 'text' },
        { name: 'beforePoints', label: 'Puntos Antes', type: 'array_objects', itemLabel: 'Punto', fields: [{ name: 'text', label: 'Texto', type: 'text' }], condition: (p) => p.layoutMode === 'twoColumn' },
        { name: 'imageAfter', label: 'Imagen Después', type: 'image' },
        { name: 'labelAfter', label: 'Etiqueta Después', type: 'text' },
        { name: 'afterPoints', label: 'Puntos Después', type: 'array_objects', itemLabel: 'Punto', fields: [{ name: 'text', label: 'Texto', type: 'text' }], condition: (p) => p.layoutMode === 'twoColumn' },
        { name: 'textColor', label: 'Color Texto', type: 'color' },
        { name: 'badgePosition', label: 'Posición Etiquetas', type: 'select', options: [{label: 'Sobre Imagen (Abajo)', value: 'overlay'}, {label: 'Sobre Imagen (Arriba)', value: 'top'}, {label: 'Debajo Imagen', value: 'below'}], condition: (p) => p.layoutMode === 'twoColumn' },
        { name: 'cardBg', label: 'Fondo Tarjeta', type: 'color', condition: (p) => p.layoutMode === 'twoColumn' },
        { name: 'cardRadius', label: 'Redondeo Tarjeta', type: 'number', condition: (p) => p.layoutMode === 'twoColumn' },
        { name: 'cardPadding', label: 'Relleno Interno', type: 'number', condition: (p) => p.layoutMode === 'twoColumn' },
        { name: 'gap', label: 'Espacio entre columnas', type: 'number', condition: (p) => p.layoutMode === 'twoColumn' },
        { name: 'cardShadow', label: 'Sombra Tarjeta', type: 'toggle', condition: (p) => p.layoutMode === 'twoColumn' },
        { name: 'badgeBgBefore', label: 'Fondo Badge Antes', type: 'color', condition: (p) => p.layoutMode === 'twoColumn' },
        { name: 'badgeTextBefore', label: 'Texto Badge Antes', type: 'color', condition: (p) => p.layoutMode === 'twoColumn' },
        { name: 'iconColorBefore', label: 'Color Iconos Antes', type: 'color', condition: (p) => p.layoutMode === 'twoColumn' },
        { name: 'badgeBgAfter', label: 'Fondo Badge Después', type: 'color', condition: (p) => p.layoutMode === 'twoColumn' },
        { name: 'badgeTextAfter', label: 'Texto Badge Después', type: 'color', condition: (p) => p.layoutMode === 'twoColumn' },
        { name: 'iconColorAfter', label: 'Color Iconos Después', type: 'color', condition: (p) => p.layoutMode === 'twoColumn' },
        { name: 'showDividers', label: 'Mostrar Divisores', type: 'toggle', condition: (p) => p.layoutMode === 'twoColumn' },
        { name: 'dividerColor', label: 'Color Divisor', type: 'color', condition: (p) => p.layoutMode === 'twoColumn' },
        ...GLOBAL_CONTROLS
    ],
    render: (props) => <BeforeAfterComponent props={props} />,
    exportHTML: (props, id) => {
        const tag = props.titleTag || 'h2';
        if (props.layoutMode === 'twoColumn') {
             const pointsBefore = props.beforePoints?.map ? props.beforePoints : [];
             const pointsAfter = props.afterPoints?.map ? props.afterPoints : [];
             const cardStyle = `flex:1;min-width:0;display:flex;flex-direction:column;background-color:${props.cardBg};border-radius:${props.cardRadius}px;overflow:hidden;box-shadow:${props.cardShadow ? '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)' : 'none'};border:${props.cardShadow ? 'none' : '1px solid #e5e7eb'};`;
             const iconColorBefore = props.iconColorBefore || '#ef4444';
             const iconColorAfter = props.iconColorAfter || '#10b981';
             const renderPoints = (points: any[], isBefore: boolean) => {
                 const iconColor = isBefore ? iconColorBefore : iconColorAfter;
                 const listGap = props.showDividers ? '0' : '8px';
                 return `
                    <div style="padding:${props.cardPadding}px;display:flex;flex-direction:column;gap:${listGap};">
                        ${points.length > 0 ? points.map((p, idx) => {
                             const isLast = idx === points.length - 1;
                             const dividerStyle = (props.showDividers && !isLast) ? `border-bottom:1px solid ${props.dividerColor};padding-bottom:8px;margin-bottom:8px;` : '';
                             return `
                            <div style="display:flex;align-items:start;gap:6px;font-size:0.85rem;color:${props.textColor};line-height:1.3;word-break:break-word;${dividerStyle}">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-top:2px;flex-shrink:0;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                <span>${p.text || p}</span>
                            </div>
                        `}).join('') : ''}
                    </div>
                 `;
             };
             const badgeStyle = `padding:4px 8px;border-radius:20px;font-size:11px;font-weight:bold;text-transform:uppercase;box-shadow:0 2px 4px rgba(0,0,0,0.2);white-space:nowrap;`;
             const badgeOverlay = `position:absolute;left:50%;transform:translateX(-50%);${props.badgePosition === 'top' ? 'top:10px;' : 'bottom:10px;'}`;
             const badgeBelow = `text-align:center;margin-top:-12px;position:relative;z-index:3;`;
             const renderBadge = (label: string, isBefore: boolean, pos: string) => {
                 if (pos === 'below') return '';
                 const bg = isBefore ? props.badgeBgBefore : props.badgeBgAfter;
                 const txt = isBefore ? props.badgeTextBefore : props.badgeTextAfter;
                 return `<span style="background-color:${bg};color:${txt};${badgeStyle}${badgeOverlay}">${label}</span>`;
             };
             const renderBadgeBelow = (label: string, isBefore: boolean) => {
                 if (props.badgePosition !== 'below') return '';
                 const bg = isBefore ? props.badgeBgBefore : props.badgeBgAfter;
                 const txt = isBefore ? props.badgeTextBefore : props.badgeTextAfter;
                 return `<div style="${badgeBelow}"><span style="background-color:${bg};color:${txt};${badgeStyle}display:inline-block;">${label}</span></div>`;
             };
             return `
             <div style="${getWrapperStyleString(props)}">
                <div style="${getInnerStyleString(props)}">
                    ${props.title ? `<div style="text-align:center;margin-bottom:32px;color:${props.textColor};"><${tag} style="font-size:${getTitleFontSize(props.titleTag)};font-weight:bold;margin-bottom:8px;line-height:1.2;margin-top:0;color:inherit;">${props.title}</${tag}>${props.subtitle ? `<div style="font-size:1rem;opacity:0.9;">${props.subtitle}</div>` : ''}</div>` : ''}
                    <div style="display:flex;gap:${props.gap}px;justify-content:center;">
                        <div style="${cardStyle}"><div style="position:relative;width:100%;"><img src="${props.imageBefore}" style="width:100%;aspect-ratio:4/3;object-fit:cover;display:block;">${renderBadge(props.labelBefore, true, props.badgePosition)}</div>${renderBadgeBelow(props.labelBefore, true)}${renderPoints(pointsBefore, true)}</div>
                        <div style="${cardStyle}"><div style="position:relative;width:100%;"><img src="${props.imageAfter}" style="width:100%;aspect-ratio:4/3;object-fit:cover;display:block;">${renderBadge(props.labelAfter, false, props.badgePosition)}</div>${renderBadgeBelow(props.labelAfter, false)}${renderPoints(pointsAfter, false)}</div>
                    </div>
                </div>
             </div>
             `;
        }
        return `
        <div style="${getWrapperStyleString(props)}">
            <div style="${getInnerStyleString(props)}">
                ${props.title ? `<${tag} style="text-align:center;font-size:${getTitleFontSize(props.titleTag)};margin-bottom:1rem;color:${props.textColor};line-height:1.2;margin-top:0;">${props.title}</${tag}>` : ''}
                ${props.subtitle ? `<div style="text-align:center;font-size:1rem;margin-bottom:1.5rem;color:${props.textColor};opacity:0.9;">${props.subtitle}</div>` : ''}
                <div id="ba-${id}" style="position:relative;width:100%;aspect-ratio:1/1;overflow:hidden;cursor:ew-resize;border-radius:8px;">
                   <img src="${props.imageAfter}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;display:block;">
                   <span style="position:absolute;top:10px;right:10px;background:rgba(0,0,0,0.7);color:white;padding:4px 8px;font-size:12px;font-weight:bold;border-radius:4px;z-index:5;pointer-events:none;">${props.labelAfter}</span>
                   <div class="ba-overlay" style="position:absolute;top:0;left:0;width:50%;height:100%;overflow:hidden;border-right:2px solid white;z-index:10;">
                      <img src="${props.imageBefore}" style="position:absolute;top:0;left:0;width:100%;height:100%;max-width:none;object-fit:cover;display:block;">
                      <span style="position:absolute;top:10px;left:10px;background:rgba(0,0,0,0.7);color:white;padding:4px 8px;font-size:12px;font-weight:bold;border-radius:4px;z-index:15;pointer-events:none;">${props.labelBefore}</span>
                   </div>
                   <div class="ba-handle" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:40px;height:40px;background:white;border-radius:50%;display:flex;align-items:center;justify-content:center;z-index:20;box-shadow:0 0 10px rgba(0,0,0,0.5);pointer-events:none;"></div>
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
            var imgBefore = overlay.querySelector('img');
            if(handle) handle.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7M12 5l7 7-7 7"/></svg>';
            function update(x) {
                var rect = container.getBoundingClientRect();
                var pos = Math.max(0, Math.min(x - rect.left, rect.width));
                var percent = (pos / rect.width) * 100;
                overlay.style.width = percent + '%';
                handle.style.left = percent + '%';
                imgBefore.style.width = rect.width + 'px';
            }
            container.addEventListener('mousemove', function(e){ update(e.clientX); });
            container.addEventListener('touchmove', function(e){ update(e.touches[0].clientX); });
            var rect = container.getBoundingClientRect();
            if(rect.width) imgBefore.style.width = rect.width + 'px';
            window.addEventListener('resize', function(){
                var r = container.getBoundingClientRect();
                imgBefore.style.width = r.width + 'px';
            });
        })();
    `;
    }
};

export const BUNDLE_SKINNER: WidgetDefinition = {
    type: 'BUNDLE_SKINNER',
    label: 'Bundle Skinner PRO',
    icon: Layers,
    defaultProps: {
        containerSelector: '.js-product-variants-group', 
        selectSelector: 'select.js-variation-option', 
        hideSelector: '.js-insta-variant', 
        defaultSelectedIndex: 0,
        activeBorderColor: '#000000',
        borderColor: '#e5e7eb',
        activeBgColor: '#f9fafb',
        cardBgColor: '#ffffff',
        activeTextColor: '#000000',
        textColor: '#374151',
        activeSubtitleColor: '#4b5563',
        subtitleColor: '#6b7280',
        subtitleFontWeight: 'normal',
        subtitleFontStyle: 'normal',
        activePriceColor: '#000000',
        priceColor: '#374151',
        priceFontSize: '16px',
        comparePriceFontSize: '12px',
        borderWidth: 2,
        borderRadius: 8,
        paddingX: 16,
        paddingY: 12,
        gap: 12,
        shadow: false,
        titleSize: '16px',
        globalSubtitle: '',
        hideQuantity: false,
        buyBtnText: 'COMPRAR AHORA',
        buyBtnBgColor: '#000000',
        buyBtnBgGradient: '', 
        buyBtnTextColor: '#ffffff',
        buyBtnPaddingX: 20,
        buyBtnPaddingY: 15,
        buyBtnFontSize: '18px',
        buyBtnBorderRadius: 8,
        buyBtnShadow: true,
        buyBtnTransform: 'uppercase',
        bundles: [
            { 
                titleOverride: '', price: '$15.000', comparePrice: '', subtitle: 'Opción Básica',
                inlineBadgeText: '', inlineBadgeBg: '#000', inlineBadgeColor: '#fff',
                topBadge1Text: '', topBadge1Bg: '#ef4444', topBadge1Color: '#fff',
                triggerText: '', triggerColor: '#ef4444' 
            },
            { 
                titleOverride: '', price: '$27.000', comparePrice: '$30.000', subtitle: 'Recomendado',
                inlineBadgeText: '20% OFF', inlineBadgeBg: '#000', inlineBadgeColor: '#fff',
                topBadge1Text: 'MÁS VENDIDO', topBadge1Bg: '#ef4444', topBadge1Color: '#ffffff',
                triggerText: '🔥 ¡Se agota rápido!', triggerIcon: 'fire', triggerColor: '#ef4444', triggerPulse: true 
            },
            { 
                titleOverride: '', price: '$36.000', comparePrice: '$45.000', subtitle: 'Mayor Ahorro',
                inlineBadgeText: '',
                topBadge1Text: 'Mayor Descuento', topBadge1Bg: '#8B4513', topBadge1Color: '#ffffff',
                triggerText: '', triggerColor: '#ef4444'
            }
        ]
    },
    controls: [
        { name: 'containerSelector', label: 'Selector Contenedor', type: 'text', section: 'bundles' },
        { name: 'selectSelector', label: 'Selector SELECT', type: 'text', section: 'bundles' },
        { name: 'hideSelector', label: 'Ocultar Elementos', type: 'text', section: 'bundles' },
        { name: 'defaultSelectedIndex', label: 'Índice Preseleccionado', type: 'number', section: 'bundles' },
        { name: 'activeBorderColor', label: 'Borde Activo', type: 'color', section: 'bundles' },
        { name: 'borderColor', label: 'Borde Inactivo', type: 'color', section: 'bundles' },
        { name: 'activeBgColor', label: 'Fondo Activo', type: 'color', section: 'bundles' },
        { name: 'cardBgColor', label: 'Fondo Inactivo', type: 'color', section: 'bundles' },
        { name: 'activeTextColor', label: 'Texto Principal (Activo)', type: 'color', section: 'bundles' },
        { name: 'textColor', label: 'Texto Principal (Inactivo)', type: 'color', section: 'bundles' },
        { name: 'titleSize', label: 'Tamaño Título', type: 'text', section: 'bundles' },
        { name: 'activeSubtitleColor', label: 'Subtítulo (Activo)', type: 'color', section: 'bundles' },
        { name: 'subtitleColor', label: 'Subtítulo (Inactivo)', type: 'color', section: 'bundles' },
        { name: 'subtitleFontWeight', label: 'Peso Subtítulo', type: 'select', options: [{label: 'Normal', value: 'normal'}, {label: 'Negrita', value: 'bold'}], section: 'bundles' },
        { name: 'subtitleFontStyle', label: 'Estilo Subtítulo', type: 'select', options: [{label: 'Normal', value: 'normal'}, {label: 'Itálica', value: 'italic'}], section: 'bundles' },
        { name: 'activePriceColor', label: 'Precio (Activo)', type: 'color', section: 'bundles' },
        { name: 'priceColor', label: 'Precio (Inactivo)', type: 'color', section: 'bundles' },
        { name: 'priceFontSize', label: 'Tamaño Precio', type: 'text', section: 'bundles' },
        { name: 'comparePriceFontSize', label: 'Tamaño Precio Tachado', type: 'text', section: 'bundles' },
        { name: 'borderWidth', label: 'Grosor Borde (px)', type: 'number', section: 'bundles' },
        { name: 'borderRadius', label: 'Redondeo (px)', type: 'number', section: 'bundles' },
        { name: 'paddingX', label: 'Relleno X (px)', type: 'number', section: 'bundles' },
        { name: 'paddingY', label: 'Relleno Y (px)', type: 'number', section: 'bundles' },
        { name: 'gap', label: 'Espacio (px)', type: 'number', section: 'bundles' },
        { name: 'shadow', label: 'Sombra suave', type: 'toggle', section: 'bundles' },
        { name: 'globalSubtitle', label: 'Subtítulo Global', type: 'text', section: 'bundles' },
        { 
            name: 'bundles', label: 'Configuración de Bundles', type: 'array_objects', section: 'bundles', itemLabel: 'Opción',
            fields: [
                { name: 'titleOverride', label: 'Título Override', type: 'text' },
                { name: 'price', label: 'Precio', type: 'text' },
                { name: 'comparePrice', label: 'Precio Tachado', type: 'text' },
                { name: 'subtitle', label: 'Subtítulo', type: 'text' },
                { name: 'inlineBadgeText', label: 'Badge (Junto al título)', type: 'text' },
                { name: 'inlineBadgeBg', label: 'Fondo Inline Badge', type: 'color' },
                { name: 'inlineBadgeColor', label: 'Color Inline Badge', type: 'color' },
                { name: 'topBadge1Text', label: 'Badge Sup. 1 Texto', type: 'text' },
                { name: 'topBadge1Bg', label: 'Badge Sup. 1 Fondo', type: 'color' },
                { name: 'topBadge1Color', label: 'Badge Sup. 1 Color', type: 'color' },
                { name: 'topBadge2Text', label: 'Badge Sup. 2 Texto', type: 'text' },
                { name: 'topBadge2Bg', label: 'Badge Sup. 2 Fondo', type: 'color' },
                { name: 'topBadge2Color', label: 'Badge Sup. 2 Color', type: 'color' },
                { name: 'topBadge3Text', label: 'Badge Sup. 3 Texto', type: 'text' },
                { name: 'topBadge3Bg', label: 'Badge Sup. 3 Fondo', type: 'color' },
                { name: 'topBadge3Color', label: 'Badge Sup. 3 Color', type: 'color' },
                { name: 'triggerText', label: 'Texto Urgencia', type: 'text' },
                { name: 'triggerIcon', label: 'Icono Urgencia', type: 'select', options: [{label: 'Ninguno', value: 'none'}, {label: 'Fuego', value: 'fire'}, {label: 'Reloj', value: 'clock'}, {label: 'Alerta', value: 'alert'}, {label: 'Ojo', value: 'eye'}] },
                { name: 'triggerColor', label: 'Color Urgencia', type: 'color' },
                { name: 'triggerPulse', label: 'Animar Urgencia', type: 'toggle' }
            ]
        },
        { name: 'hideQuantity', label: 'Ocultar Selector Cantidad', type: 'toggle', section: 'button' },
        { name: 'buyBtnText', label: 'Texto Botón Compra', type: 'text', section: 'button' },
        { name: 'buyBtnBgColor', label: 'Fondo Botón (Superior/Sólido)', type: 'color', section: 'button' },
        { name: 'buyBtnBgGradient', label: 'Fondo Botón (Inferior - Gradiente)', type: 'color', section: 'button' },
        { name: 'buyBtnTextColor', label: 'Color Texto Botón', type: 'color', section: 'button' },
        { name: 'buyBtnFontSize', label: 'Tamaño Fuente Botón', type: 'text', section: 'button' },
        { name: 'buyBtnTransform', label: 'Transformación Texto', type: 'select', options: [{label: 'Mayúsculas', value: 'uppercase'}, {label: 'Normal', value: 'none'}], section: 'button' },
        { name: 'buyBtnPaddingX', label: 'Relleno X Botón', type: 'number', section: 'button' },
        { name: 'buyBtnPaddingY', label: 'Relleno Y Botón', type: 'number', section: 'button' },
        { name: 'buyBtnBorderRadius', label: 'Radio Borde Botón', type: 'number', section: 'button' },
        { name: 'buyBtnShadow', label: 'Sombra Botón', type: 'toggle', section: 'button' },
    ],
    render: (props) => <BundleSkinnerMock props={props} />,
    exportHTML: () => '', 
    exportJS: (props) => `
        (function() {
            /* AM LANDING BUILDER - BUNDLE SKINNER PRO v3.6 */
            var CONFIG = {
                containerSelector: "${props.containerSelector || '.js-product-variants-group'}",
                selectSelector: "${props.selectSelector || 'select.js-variation-option'}",
                hideSelector: "${props.hideSelector || '.js-insta-variant'}",
                defaultIndex: ${props.defaultSelectedIndex || 0},
                hideQuantity: ${props.hideQuantity},
                buyBtn: {
                    text: "${props.buyBtnText || ''}",
                    bg: "${props.buyBtnBgColor || '#2c3e50'}",
                    bgGradient: "${props.buyBtnBgGradient || ''}",
                    color: "${props.buyBtnTextColor || '#ffffff'}",
                    padding: "${props.buyBtnPaddingY}px ${props.buyBtnPaddingX}px",
                    fontSize: "${props.buyBtnFontSize || '18px'}",
                    radius: "${props.buyBtnBorderRadius || 4}px",
                    transform: "${props.buyBtnTransform || 'none'}",
                    shadow: ${props.buyBtnShadow ? '"0 4px 6px rgba(0,0,0,0.15)"' : '"none"'}
                },
                styles: {
                    activeBorder: "${props.activeBorderColor}",
                    border: "${props.borderColor}",
                    activeBg: "${props.activeBgColor}",
                    bg: "${props.cardBgColor}",
                    activeText: "${props.activeTextColor}",
                    text: "${props.textColor}",
                    activeSubText: "${props.activeSubtitleColor}",
                    subText: "${props.subtitleColor}",
                    subWeight: "${props.subtitleFontWeight || 'normal'}",
                    subStyle: "${props.subtitleFontStyle || 'normal'}",
                    activePrice: "${props.activePriceColor}",
                    price: "${props.priceColor}",
                    priceSize: "${props.priceFontSize || '16px'}",
                    compareSize: "${props.comparePriceFontSize || '12px'}",
                    borderWidth: "${props.borderWidth}px",
                    radius: "${props.borderRadius}px",
                    padding: "${props.paddingY}px ${props.paddingX}px",
                    gap: "${props.gap}px",
                    shadow: "${props.shadow ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'}",
                    titleSize: "${props.titleSize || '16px'}"
                },
                bundles: ${JSON.stringify(props.bundles || [])},
                globalSubtitle: "${props.globalSubtitle || ''}"
            };
            function getIconSVG(name, color) {
                if(name === 'fire') return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="'+color+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>';
                if(name === 'clock') return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="'+color+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>';
                if(name === 'alert') return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="'+color+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
                if(name === 'eye') return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="'+color+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8-11-8-11-8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
                return '';
            }
            function applyNativeStyles() {
                if (CONFIG.hideQuantity) {
                    var qtyContainer = document.querySelector('.js-product-quantity-container');
                    if (qtyContainer) qtyContainer.style.display = 'none';
                    var buyBtnContainer = document.querySelector('.js-buy-button-container');
                    if (buyBtnContainer) {
                        buyBtnContainer.classList.remove('col-8'); buyBtnContainer.classList.add('col-12');
                        buyBtnContainer.style.flex = '0 0 100%'; buyBtnContainer.style.maxWidth = '100%'; buyBtnContainer.style.paddingLeft = '15px';
                    }
                }
                var buyBtns = document.querySelectorAll('.js-addtocart');
                if (buyBtns.length > 0) {
                    buyBtns.forEach(function(btn) {
                        var bgStyle = CONFIG.buyBtn.bg;
                        if (CONFIG.buyBtn.bgGradient) bgStyle = 'linear-gradient(180deg, ' + CONFIG.buyBtn.bg + ', ' + CONFIG.buyBtn.bgGradient + ')';
                        var cssText = 'background: ' + bgStyle + ' !important; border: none !important; color: ' + CONFIG.buyBtn.color + ' !important; padding: ' + CONFIG.buyBtn.padding + ' !important; font-size: ' + CONFIG.buyBtn.fontSize + ' !important; border-radius: ' + CONFIG.buyBtn.radius + ' !important; text-transform: ' + CONFIG.buyBtn.transform + ' !important; box-shadow: ' + CONFIG.buyBtn.shadow + ' !important;';
                        btn.style.cssText += cssText;
                        if (CONFIG.buyBtn.text) {
                            if (btn.tagName === 'INPUT') btn.value = CONFIG.buyBtn.text;
                            else { var textSpan = btn.querySelector('.js-addtocart-text'); if (textSpan) textSpan.innerText = CONFIG.buyBtn.text; }
                        }
                    });
                }
            }
            function initSkinner() {
                var container = document.querySelector(CONFIG.containerSelector);
                if (!container) return;
                var select = container.querySelector(CONFIG.selectSelector);
                if (!select) return;
                if (CONFIG.hideSelector) { var toHide = container.querySelectorAll(CONFIG.hideSelector); toHide.forEach(function(el) { el.style.display = 'none'; }); }
                var wrapperId = 'am-skinner-wrapper'; var wrapper = document.getElementById(wrapperId);
                if (!wrapper) {
                    wrapper = document.createElement('div'); wrapper.id = wrapperId;
                    var hiddenGroup = select.closest('.form-group');
                    if (hiddenGroup && (hiddenGroup.classList.contains('d-none') || hiddenGroup.style.display === 'none')) hiddenGroup.insertAdjacentElement('afterend', wrapper);
                    else if(select.nextSibling) select.parentNode.insertBefore(wrapper, select.nextSibling);
                    else select.parentNode.appendChild(wrapper);
                } else { wrapper.innerHTML = ''; }
                wrapper.style.display = 'flex'; wrapper.style.flexDirection = 'column'; wrapper.style.gap = CONFIG.styles.gap; wrapper.style.marginTop = '10px';
                if (!document.getElementById('am-pulse-style')) {
                    var style = document.createElement('style'); style.id = 'am-pulse-style';
                    style.innerHTML = '@keyframes amPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } } .am-pulse-fast { animation: amPulse 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; }';
                    document.head.appendChild(style);
                }
                Array.from(select.options).forEach(function(option, index) {
                    if (option.value === '') return;
                    var bundleConfig = CONFIG.bundles[index] || {};
                    var title = bundleConfig.titleOverride || option.text || option.value;
                    var subtitle = bundleConfig.subtitle || CONFIG.globalSubtitle;
                    var card = document.createElement('div'); card.className = 'am-bundle-card'; card.setAttribute('data-value', option.value);
                    var hasBadge = bundleConfig.topBadge1Text || bundleConfig.topBadge2Text || bundleConfig.topBadge3Text;
                    var marginTop = hasBadge ? '12px' : '0px';
                    card.style.cssText = 'display: flex; align-items: center; justify-content: space-between; border: ' + CONFIG.styles.borderWidth + ' solid ' + CONFIG.styles.border + '; border-radius: ' + CONFIG.styles.radius + '; padding: ' + CONFIG.styles.padding + '; background-color: ' + CONFIG.styles.bg + '; cursor: pointer; position: relative; box-shadow: ' + CONFIG.styles.shadow + '; transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1); width: 100%; box-sizing: border-box; margin-top: ' + marginTop + ';';
                    var badgesHTML = ''; var hasBadges = false;
                    [1, 2, 3].forEach(function(num) {
                        var txt = bundleConfig['topBadge'+num+'Text']; var bg = bundleConfig['topBadge'+num+'Bg'] || '#7a4a12'; var col = bundleConfig['topBadge'+num+'Color'] || '#fff';
                        if (txt) {
                            hasBadges = true;
                            var fold = '<div style="position:absolute;top:6px;left:-8px;width:0;height:0;border-right:8px solid ' + bg + ';border-top:8px solid transparent;filter:brightness(0.6);z-index:-1;"></div>';
                            badgesHTML += '<div style="position:relative;background-color:' + bg + ';color:' + col + ';font-weight:700;font-size:12.5px;line-height:1;padding:6px 10px;border-radius:4px;box-shadow:0 4px 10px rgba(0,0,0,0.15);white-space:nowrap;margin-left:8px;">' + fold + txt + '</div>';
                        }
                    });
                    if (hasBadges) card.innerHTML += '<div style="position: absolute; top: -15px; right: 12px; display: flex; flex-direction: row; justify-content: flex-end; gap: 10px; z-index: 3;">' + badgesHTML + '</div>';
                    var inlineBadgeHTML = ''; if (bundleConfig.inlineBadgeText) inlineBadgeHTML = '<span style="background-color: ' + (bundleConfig.inlineBadgeBg || '#333') + '; color: ' + (bundleConfig.inlineBadgeColor || '#fff') + '; font-size: 0.65rem; font-weight: bold; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; margin-left: 8px; letter-spacing: 0.5px;">' + bundleConfig.inlineBadgeText + '</span>';
                    var triggerHTML = '';
                    if (bundleConfig.triggerText) {
                        var icon = getIconSVG(bundleConfig.triggerIcon || 'none', bundleConfig.triggerColor || '#ef4444');
                        var animClass = bundleConfig.triggerPulse ? 'am-pulse-fast' : '';
                        triggerHTML = '<div class="' + animClass + '" style="display: flex; align-items: center; gap: 4px; font-size: 0.75rem; font-weight: bold; margin-top: 6px; color: ' + (bundleConfig.triggerColor || '#ef4444') + ';">' + icon + '<span>' + bundleConfig.triggerText + '</span></div>';
                    }
                    var pricesHTML = '';
                    if (bundleConfig.price || bundleConfig.comparePrice) pricesHTML = '<div style="display: flex; flex-direction: column; align-items: flex-end; margin-left: 10px;">' + (bundleConfig.comparePrice ? '<span style="font-size: ' + CONFIG.styles.compareSize + '; text-decoration: line-through; color: #9ca3af; margin-bottom: 2px;">' + bundleConfig.comparePrice + '</span>' : '') + '<span class="am-price-text" style="font-weight: 800; color: ' + CONFIG.styles.price + '; font-size: ' + CONFIG.styles.priceSize + ';">' + (bundleConfig.price || '') + '</span></div>';
                    card.innerHTML += '<div style="display: flex; align-items: center; width: 100%;"><div style="display: flex; align-items: flex-start; gap: 12px; flex: 1;"><div class="am-radio-circle" style="width: 20px; height: 20px; border-radius: 50%; border: 2px solid #d1d5db; display: flex; align-items: center; justify-content: center; background-color: white; flex-shrink: 0; margin-top: 3px; transition: border-color 0.2s ease;"><div class="am-radio-dot" style="width: 10px; height: 10px; border-radius: 50%; background-color: ' + CONFIG.styles.activeBorder + '; transform: scale(0); transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);"></div></div><div style="display: flex; flex-direction: column; text-align: left;"><div style="display: flex; align-items: center; flex-wrap: wrap;"><span class="am-main-text" style="font-weight: 700; color: ' + CONFIG.styles.text + '; font-size: ' + CONFIG.styles.titleSize + '; line-height: 1.2;">' + title + '</span>' + inlineBadgeHTML + '</div>' + (subtitle ? '<span class="am-sub-text" style="font-size: 0.85rem; color: ' + CONFIG.styles.subText + '; font-weight: ' + CONFIG.styles.subWeight + '; font-style: ' + CONFIG.styles.subStyle + '; margin-top: 4px; line-height: 1.4;">' + subtitle + '</span>' : '') + triggerHTML + '</div></div>' + pricesHTML + '</div>';
                    card.onclick = function() { select.value = option.value; select.dispatchEvent(new Event('change', { bubbles: true })); updateVisuals(wrapper, select); };
                    wrapper.appendChild(card);
                });
                select.addEventListener('change', function() { updateVisuals(wrapper, select); });
                updateVisuals(wrapper, select); applyNativeStyles();
            }
            function updateVisuals(wrapper, select) {
                if (!wrapper || !select) return;
                var cards = wrapper.querySelectorAll('.am-bundle-card');
                cards.forEach(function(c) {
                    var isActive = c.getAttribute('data-value') === select.value;
                    var mainText = c.querySelector('.am-main-text'); var subText = c.querySelector('.am-sub-text'); var priceText = c.querySelector('.am-price-text'); var circle = c.querySelector('.am-radio-circle'); var dot = c.querySelector('.am-radio-dot');
                    if (isActive) {
                        c.style.borderColor = CONFIG.styles.activeBorder; c.style.backgroundColor = CONFIG.styles.activeBg; c.style.transform = 'translateY(-1px)'; c.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; c.style.zIndex = '2';
                        if(mainText) mainText.style.color = CONFIG.styles.activeText; if(subText) subText.style.color = CONFIG.styles.activeSubText; if(priceText) priceText.style.color = CONFIG.styles.activePrice; if(circle) circle.style.borderColor = CONFIG.styles.activeBorder; if(dot) dot.style.transform = 'scale(1)';
                    } else {
                        c.style.borderColor = CONFIG.styles.border; c.style.backgroundColor = CONFIG.styles.bg; c.style.transform = 'none'; c.style.boxShadow = CONFIG.styles.shadow; c.style.zIndex = '1';
                        if(mainText) mainText.style.color = CONFIG.styles.text; if(subText) subText.style.color = CONFIG.styles.subText; if(priceText) priceText.style.color = CONFIG.styles.price; if(circle) circle.style.borderColor = '#d1d5db'; if(dot) dot.style.transform = 'scale(0)';
                    }
                });
            }
            if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initSkinner);
            else initSkinner();
            var timeout;
            var observer = new MutationObserver(function(mutations) {
                if (timeout) clearTimeout(timeout);
                timeout = setTimeout(function() {
                    var wrapper = document.getElementById('am-skinner-wrapper');
                    if (!wrapper) initSkinner();
                    else { var select = document.querySelector(CONFIG.selectSelector); if(select) updateVisuals(wrapper, select); }
                    applyNativeStyles();
                }, 100);
            });
            observer.observe(document.body, { childList: true, subtree: true });
        })();
    `
};

export const WIDGET_REGISTRY: WidgetDefinition[] = [
  HERO,
  BENEFITS,
  BEFORE_AFTER,
  BUNDLE_SKINNER
];
