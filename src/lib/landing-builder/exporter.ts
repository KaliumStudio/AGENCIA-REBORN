
import { WidgetInstance } from '@/types/landing-builder';
import { WIDGET_REGISTRY } from './registry';

export function generateExport(widgets: WidgetInstance[]): string {
  let html = `<div id="am-landing-container" style="font-family: sans-serif; overflow: hidden; width: 100%;">`;
  let scripts = ``;

  widgets.forEach((w) => {
    const def = WIDGET_REGISTRY.find(d => d.type === w.type);
    if (def) {
      html += def.exportHTML(w.props, w.id);
      if (def.exportJS) {
        scripts += `\n/* ${w.type} JS */\n${def.exportJS(w.props, w.id)}\n`;
      }
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

  return `${html}\n<script>${iconScript}${scripts}</script>`;
}
