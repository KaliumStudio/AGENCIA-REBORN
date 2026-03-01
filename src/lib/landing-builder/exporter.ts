
import { WidgetInstance } from '@/types/landing-builder';

export function exportToTiendaNube(widgets: WidgetInstance[]): string {
  let html = `<div id="am-landing-container" style="font-family: sans-serif; overflow: hidden; width: 100%;">`;
  let scripts = ``;

  widgets.forEach((w, idx) => {
    switch (w.type) {
      case 'hero':
        html += `
          <section style="background-color: ${w.props.bgColor}; color: ${w.props.textColor}; padding: 80px 20px; text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center;">
            <h1 style="font-size: 2.8rem; font-weight: 900; margin-bottom: 15px; line-height: 1.1; max-width: 800px;">${w.props.title}</h1>
            <p style="font-size: 1.3rem; opacity: 0.9; max-width: 600px; margin-bottom: 40px;">${w.props.subtitle}</p>
            <a href="#" style="background-color: ${w.props.textColor}; color: ${w.props.bgColor}; padding: 18px 50px; border-radius: 12px; text-decoration: none; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); transition: transform 0.3s ease;">${w.props.buttonText}</a>
          </section>
        `;
        break;

      case 'benefits':
        html += `<div style="display: flex; flex-wrap: wrap; padding: 60px 10px; justify-content: center; background: #ffffff; gap: 20px;">`;
        w.props.items.forEach((item: any) => {
          html += `
            <div style="flex: 1; min-width: 280px; max-width: 350px; padding: 30px; text-align: center; border: 1px solid #eee; border-radius: 20px; background: #fafafa;">
              <div class="am-icon" data-icon="${item.icon}" style="width: 50px; height: 50px; margin: 0 auto 20px; color: #2962FF;"></div>
              <h3 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 10px; color: #111;">${item.title}</h3>
              <p style="font-size: 0.95rem; color: #555; line-height: 1.5;">${item.desc}</p>
            </div>
          `;
        });
        html += `</div>`;
        break;

      case 'testimonials':
        html += `<div style="padding: 60px 20px; background: #f0f4ff;">
          <h2 style="text-align: center; margin-bottom: 40px; font-weight: 900;">Lo que dicen nuestros clientes</h2>
          <div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center;">`;
        w.props.items.forEach((item: any) => {
          html += `
            <div style="background: white; padding: 30px; border-radius: 20px; width: 100%; max-width: 400px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
              <div style="color: #FFC107; margin-bottom: 15px;">${'★'.repeat(item.rating)}</div>
              <p style="font-style: italic; color: #444; margin-bottom: 20px; font-size: 1rem; line-height: 1.6;">"${item.text}"</p>
              <p style="font-weight: 800; font-size: 0.9rem; color: #111;">— ${item.name}</p>
            </div>
          `;
        });
        html += `</div></div>`;
        break;

      case 'timer':
        const timerId = `am-timer-${idx}`;
        html += `
          <div id="${timerId}" style="background: ${w.props.bgColor}; color: ${w.props.textColor}; padding: 30px 20px; text-align: center;">
            <div style="font-size: 0.9rem; font-weight: 900; margin-bottom: 15px; letter-spacing: 2px;">${w.props.label}</div>
            <div style="display: flex; justify-content: center; gap: 20px; font-family: monospace;">
              <div style="background: rgba(0,0,0,0.1); padding: 15px; border-radius: 10px; min-width: 70px;"><span style="font-size: 2rem; display: block;" class="days">00</span><small style="font-size: 0.7rem; opacity: 0.8;">DÍAS</small></div>
              <div style="background: rgba(0,0,0,0.1); padding: 15px; border-radius: 10px; min-width: 70px;"><span style="font-size: 2rem; display: block;" class="hours">00</span><small style="font-size: 0.7rem; opacity: 0.8;">HS</small></div>
              <div style="background: rgba(0,0,0,0.1); padding: 15px; border-radius: 10px; min-width: 70px;"><span style="font-size: 2rem; display: block;" class="minutes">00</span><small style="font-size: 0.7rem; opacity: 0.8;">MIN</small></div>
              <div style="background: rgba(0,0,0,0.1); padding: 15px; border-radius: 10px; min-width: 70px;"><span style="font-size: 2rem; display: block;" class="seconds">00</span><small style="font-size: 0.7rem; opacity: 0.8;">SEG</small></div>
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

      case 'custom_code':
        html += `<div class="am-custom-widget">${w.props.html}</div>`;
        break;
    }
  });

  html += `</div>`;

  const iconScript = `
    (function() {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/lucide@latest';
      script.onload = () => {
        lucide.createIcons({
          attrs: { 'stroke-width': 2, 'stroke': 'currentColor', 'fill': 'none' }
        });
      };
      document.head.appendChild(script);
    })();
  `;

  return `${html}<script>${iconScript}${scripts}</script>`;
}
