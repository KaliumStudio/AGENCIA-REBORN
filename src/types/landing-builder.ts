
import React from 'react';

export type WidgetType = 
  | 'HERO' 
  | 'BENEFITS' 
  | 'STEPS' 
  | 'FAQ' 
  | 'SOCIAL_PROOF' 
  | 'WARRANTY' 
  | 'CTA' 
  | 'TIMER' 
  | 'IMAGE' 
  | 'IMAGE_WITH_TEXT'
  | 'BEFORE_AFTER'
  | 'VIDEO_CAROUSEL' 
  | 'IMAGE_CAROUSEL'
  | 'COMPARISON_TABLE'
  | 'HORIZONTAL_TICKER'
  | 'MULTICOLUMN'
  | 'WAVES'
  | 'RESULTS'
  | 'RICH_TEXT'
  | 'TESTIMONIALS'
  | 'CUSTOM_CODE'
  | 'BUNDLE_SKINNER'
  | 'WHATSAPP_BUTTON'
  | 'FEATURE_HOTSPOTS'
  | 'TABS_PRO'
  | 'TIMELINE_PRO';

export interface WidgetInstance {
  id: string;
  type: WidgetType;
  props: Record<string, any>;
}

export type ControlType = 'text' | 'textarea' | 'richText' | 'color' | 'number' | 'select' | 'image' | 'toggle' | 'slider' | 'array_objects' | 'datetime-local' | 'icon';

export interface ControlDefinition {
  name: string;
  label: string;
  type: ControlType;
  section?: string; 
  options?: { label: string; value: string }[];
  placeholder?: string;
  min?: number;
  max?: number;
  itemLabel?: string; 
  fields?: ControlDefinition[]; 
  condition?: (props: any) => boolean;
}

export interface WidgetDefinition {
  type: WidgetType;
  label: string;
  icon: any;
  category?: 'layout' | 'global' | 'hero' | 'benefits' | 'social' | 'faq' | 'cta' | 'content';
  defaultProps: Record<string, any>;
  render: (props: any, isEditor: boolean) => React.ReactNode;
  exportHTML: (props: any, id: string) => string;
  exportJS?: (props: any, id: string) => string;
  controls: ControlDefinition[];
}
