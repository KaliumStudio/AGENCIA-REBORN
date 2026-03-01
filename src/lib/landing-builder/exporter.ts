
import { WidgetInstance } from '@/types/landing-builder';

/**
 * Convierte la lista de widgets en un código HTML/JS autocontenido
 * optimizado para las restricciones de Tienda Nube.
 */
export function exportToTiendaNube(widgets: WidgetInstance[]): string {
  let html = `<div id="am-landing-container" style="font-family: sans-serif; overflow: hidden; width: 100%;">`;
  let scripts = ``;

  widgets.forEach((w, idx) => {
    switch (w.type) {
      case 'hero':
        html += `
          <section style="background-color: ${w.props.bgColor}; color: ${w.props.textColor}; padding: 60px 20px; text-align: center; min-height: ${w.props.height}; display: flex; flex-direction: column; justify-content: center; align-items: center;">
            <h1 style="font-size: 2.5rem; font-weight: 800; margin-bottom: 10px; line-height: 1.2;">${w.props.title}</h1>
            <p style="font-size: 1.2rem; opacity: 0.9; max-width: 600px; margin-bottom: 30px;">${w.props.subtitle}</p>
            <a href="#" style="background-color: ${w.props.textColor}; color: ${w.props.bgColor}; padding: 15px 40px; border-radius: 50px; text-decoration: none; font-weight: bold; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">${w.props.buttonText}</a>
          </section>
        `;
        break;

      case 'benefits':
        html += `<div style="display: flex; flex-wrap: wrap; padding: 40px 10px; justify-content: center; background: #f9f9f9;">`;
        w.props.items.forEach((item: any) => {
          html += `
            <div style="flex: 1; min-width: 250px; padding: 20px; text-align: center;">
              <div class="am-icon" data-icon="${item.icon}" style="width: 48px; height: 48px; margin: 0 auto 15px; color: #2962FF;"></div>
              <h3 style="font-size: 1.1rem; font-weight: bold; margin-bottom: 5px;">${item.title}</h3>
              <p style="font-size: 0.9rem; color: #666;">${item.desc}</p>
            </div>
          `;
        });
        html += `</div>`;
        break;

      case 'timer':
        const timerId = `am-timer-${idx}`;
        html += `
          <div id="${timerId}" style="background: ${w.props.bgColor}; color: ${w.props.textColor}; padding: 20px; text-align: center; font-weight: bold;">
            <div style="font-size: 0.8rem; margin-bottom: 5px; letter-spacing: 1px;">${w.props.label}</div>
            <div style="font-size: 1.5rem; display: flex; justify-content: center; gap: 15px;">
              <div><span class="days">00</span><small style="display:block; font-size: 0.6rem;">DÍAS</small></div>
              <div><span class="hours">00</span><small style="display:block; font-size: 0.6rem;">HS</small></div>
              <div><span class="minutes">00</span><small style="display:block; font-size: 0.6rem;">MIN</small></div>
              <div><span class="seconds">00</span><small style="display:block; font-size: 0.6rem;">SEG</small></div>
            </div>
          </div>
        `;
        scripts += `
          (function() {
            const target = new Date("${w.props.endTime}").getTime();
            const el = document.getElementById("${timerId}");
            function update() {
              const now = new Date().getTime();
              const diff = target - now;
              if (diff < 0) return;
              el.querySelector('.days').innerText = Math.floor(diff / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');
              el.querySelector('.hours').innerText = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
              el.querySelector('.minutes').innerText = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
              el.querySelector('.seconds').innerText = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
            }
            setInterval(update, 1000);
            update();
          })();
        `;
        break;

      case 'whatsapp':
        html += `
          <a id="am-wa-float" href="https://wa.me/${w.props.phone}?text=${encodeURIComponent(w.props.message)}" target="_blank" style="position: fixed; bottom: 20px; right: 20px; background: #25d366; color: white; padding: 12px 20px; border-radius: 50px; text-decoration: none; display: flex; align-items: center; gap: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); z-index: 9999; font-weight: bold; font-size: 14px;">
            <div class="am-icon" data-icon="MessageCircle" style="width: 20px; height: 20px;"></div>
            ${w.props.label}
          </a>
        `;
        break;
    }
  });

  html += `</div>`;

  // Script para inyectar iconos de Lucide (Tienda Nube borra etiquetas SVG)
  const iconScript = `
    (function() {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/lucide@latest';
      script.onload = () => {
        lucide.createIcons({
          attrs: {
            'stroke-width': 2,
            'stroke': 'currentColor',
            'fill': 'none'
          }
        });
      };
      document.head.appendChild(script);
    })();
  `;

  return `${html}
<script>
${iconScript}
${scripts}
</script>`;
}
