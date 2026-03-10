'use server';
/**
 * @fileOverview A flow for generating retargeting ad images using Nano Banana Pro (Gemini 3 Pro Image).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateRetargetingInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  offerDetails: z.string().describe('Special offer details (e.g., 20% OFF).'),
  style: z.string().describe('Visual style (e.g., minimalist, vibrant, dark).'),
  productImageDataUri: z.string().optional().describe('Data URI of the product image to incorporate.'),
  count: z.number().min(1).max(4).optional().default(1).describe('Number of ad variants to generate.'),
});
export type GenerateRetargetingInput = z.infer<typeof GenerateRetargetingInputSchema>;

const GenerateRetargetingOutputSchema = z.object({
  images: z.array(z.string()).describe('Array of Data URIs of the generated ad images.'),
});
export type GenerateRetargetingOutput = z.infer<typeof GenerateRetargetingOutputSchema>;

export async function generateRetargetingImage(input: GenerateRetargetingInput): Promise<GenerateRetargetingOutput> {
  return generateRetargetingFlow(input);
}

const generateRetargetingFlow = ai.defineFlow(
  {
    name: 'generateRetargetingFlow',
    inputSchema: GenerateRetargetingInputSchema,
    outputSchema: GenerateRetargetingOutputSchema,
  },
  async (input) => {
    const results: string[] = [];
    const count = input.count || 1;

    for (let i = 0; i < count; i++) {
      const promptParts: any[] = [];

      if (input.productImageDataUri) {
        promptParts.push({ media: { url: input.productImageDataUri } });
      }

      promptParts.push({ 
        text: `Generate a high-conversion retargeting advertisement image for ${input.productName}. 
               Offer: ${input.offerDetails}. 
               Visual Style: ${input.style}. 
               ${input.productImageDataUri ? 'Incorporate the product shown in the reference image naturally.' : ''}
               The image should be professional, clean, optimized for social media (Instagram/Facebook) and look like a premium studio shot or a high-end lifestyle product photo.
               Variant number: ${i + 1} of ${count}. Provide a slightly different composition for each variant.` 
      });

      const { media } = await ai.generate({
        model: 'googleai/gemini-3-pro-image-preview',
        prompt: promptParts,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });

      if (media && media.url) {
        results.push(media.url);
      }
    }

    if (results.length === 0) {
      throw new Error('Failed to generate any ad images');
    }

    return { images: results };
  }
);
