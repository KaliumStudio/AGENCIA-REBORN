'use server';
/**
 * @fileOverview Flow para el asistente de IA del Landing Builder.
 * Genera estructuras de widgets basadas en descripciones de negocio.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const LandingAIInputSchema = z.object({
  prompt: z.string().describe('Descripción de lo que el usuario quiere construir.'),
});

const LandingAIOutputSchema = z.object({
  widgets: z.array(z.object({
    type: z.string(),
    props: z.any()
  })).describe('Lista de instancias de widgets generadas por la IA.'),
});

export async function generateLandingStructure(input: { prompt: string }) {
  return landingAIFlow(input);
}

const landingAIFlow = ai.defineFlow(
  {
    name: 'landingAIFlow',
    inputSchema: LandingAIInputSchema,
    outputSchema: LandingAIOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      prompt: `Actúa como un experto en CRO y diseño de Tienda Nube. 
      Basado en el siguiente requerimiento del usuario: "${input.prompt}", genera una estructura lógica de widgets para una landing page de alta conversión.
      
      Los tipos de widgets disponibles son:
      - hero: { title, subtitle, buttonText, bgColor, textColor }
      - benefits: { items: [{ title, desc, icon }], columns }
      - testimonials: { items: [{ name, text, rating }] }
      - timer: { label, endTime, bgColor }
      - cta: { text, subtext, url, bgColor }
      - custom_code: { html }
      
      Responde EXCLUSIVAMENTE con un objeto JSON que contenga un array llamado "widgets" con las configuraciones.`,
      output: { schema: LandingAIOutputSchema }
    });
    return output!;
  }
);
