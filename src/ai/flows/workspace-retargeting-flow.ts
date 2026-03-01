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
});
export type GenerateRetargetingInput = z.infer<typeof GenerateRetargetingInputSchema>;

const GenerateRetargetingOutputSchema = z.object({
  imageUrl: z.string().describe('Data URI of the generated ad image.'),
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
    const { media } = await ai.generate({
      model: 'googleai/gemini-3-pro-image-preview',
      prompt: [
        { text: `Generate a high-conversion retargeting advertisement image for ${input.productName}. 
                 Offer: ${input.offerDetails}. 
                 Style: ${input.style}. 
                 The image should be professional, clean, and optimized for social media ads (Instagram/Facebook).` }
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media) {
      throw new Error('Failed to generate ad image');
    }

    return { imageUrl: media.url };
  }
);
