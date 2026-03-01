
export type WidgetType = 'hero' | 'benefits' | 'faq' | 'whatsapp' | 'timer' | 'cta' | 'image_text' | 'spacer';

export interface WidgetInstance {
  id: string;
  type: WidgetType;
  props: any;
}

export interface WidgetDefinition {
  type: WidgetType;
  label: string;
  icon: any;
  defaultProps: any;
}
