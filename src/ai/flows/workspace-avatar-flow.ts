
'use server';
/**
 * @fileOverview A flow for generating advanced AI Avatars using Gemini 2.5 Flash Image (Nano Banana).
 * 
 * This flow allows generating characters based on demographic data, physical traits,
 * location settings, and can incorporate reference images or product images.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateAvatarInputSchema = z.object({
  age: z.string().optional().describe('Age of the avatar.'),
  country: z.string().optional().describe('Country or ethnicity of the avatar.'),
  holdingProduct: z.boolean().optional().describe('Whether the avatar is holding a product.'),
  location: z.string().optional().describe('The environment where the avatar is (e.g., home, cafe, work).'),
  physicalTraits: z.string().optional().describe('Specific physical characteristics.'),
  archetype: z.enum(['authority', 'sports', 'common', 'creative', 'professional', 'casual']).optional().describe('The persona or role of the avatar.'),
  aspectRatio: z.enum(['1:1', '9:16', '16:9']).optional().default('1:1'),
  count: z.number().min(1).max(10).optional().default(1),
  productImageDataUri: z.string().optional().describe('Data URI of the product image.'),
  referenceImageDataUri: z.string().optional().describe('Data URI of a reference face or style image.'),
  additionalInstructions: z.string().optional().describe('Any other specific details.'),
});
export type GenerateAvatarInput = z.infer<typeof GenerateAvatarInputSchema>;

const GenerateAvatarOutputSchema = z.object({
  images: z.array(z.string()).describe('Array of Data URIs of the generated avatar images.'),
});
export type GenerateAvatarOutput = z.infer<typeof GenerateAvatarOutputSchema>;

export async function generateAvatar(input: GenerateAvatarInput): Promise<GenerateAvatarOutput> {
  return generateAvatarFlow(input);
}

const generateAvatarFlow = ai.defineFlow(
  {
    name: 'generateAvatarFlow',
    inputSchema: GenerateAvatarInputSchema,
    outputSchema: GenerateAvatarOutputSchema,
  },
  async (input) => {
    const results: string[] = [];
    
    for (let i = 0; i < (input.count || 1); i++) {
      const promptParts: any[] = [];

      // Add reference images if provided
      if (input.referenceImageDataUri) {
        promptParts.push({ media: { url: input.referenceImageDataUri } });
      }
      if (input.productImageDataUri) {
        promptParts.push({ media: { url: input.productImageDataUri } });
      }

      // Construct descriptive prompt
      let promptText = `Generate a casual, home-made style avatar portrait. The image should look like a realistic selfie or a simple photo taken with an iPhone 11, with natural lighting and NO background blur or bokeh effect. The entire background should be sharp and clear. The person MUST be standing directly in front of the camera, facing forward. `;
      
      const details = [];
      if (input.age) details.push(`Age: ${input.age}`);
      if (input.country) details.push(`Origin/Ethnicity: ${input.country}`);
      if (input.archetype) details.push(`Role/Archetype: ${input.archetype} persona`);
      if (input.physicalTraits) details.push(`Physical traits: ${input.physicalTraits}`);
      if (input.location) details.push(`Location: set in a ${input.location}`);
      
      if (input.holdingProduct) {
        promptText += `The person MUST be holding the product shown in the image naturally in their hands. `;
      }
      
      if (input.referenceImageDataUri) {
        promptText += `Maintain the facial features and style similar to the reference image provided. `;
      }

      promptText += `Details: ${details.join(', ')}. `;
      if (input.additionalInstructions) promptText += `Additional context: ${input.additionalInstructions}. `;
      
      promptText += `The output should be a single, clean, realistic image that looks like a regular consumer photo.`;

      promptParts.push({ text: promptText });

      const { media } = await ai.generate({
        model: 'googleai/gemini-2.5-flash-image',
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
      throw new Error('Failed to generate any images');
    }

    return { images: results };
  }
);
