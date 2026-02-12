'use server';
/**
 * @fileOverview A Genkit flow for generating creative concept suggestions based on a brief and references.
 *
 * - generateCreativeConcepts - A function that handles the creative concept generation process.
 * - CreativeConceptGenerationInput - The input type for the generateCreativeConcepts function.
 * - CreativeConceptGenerationOutput - The return type for the generateCreativeConcepts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreativeConceptGenerationInputSchema = z.object({
  brief: z.string().describe('The creative brief for which to generate concepts.'),
  references: z.string().describe('Detailed references and inspiration for the creative task.'),
});
export type CreativeConceptGenerationInput = z.infer<typeof CreativeConceptGenerationInputSchema>;

const CreativeConceptGenerationOutputSchema = z.object({
  concepts: z.array(z.string()).describe('A list of creative concept suggestions.'),
});
export type CreativeConceptGenerationOutput = z.infer<
  typeof CreativeConceptGenerationOutputSchema
>;

const creativeConceptPrompt = ai.definePrompt({
  name: 'creativeConceptPrompt',
  input: {schema: CreativeConceptGenerationInputSchema},
  output: {schema: CreativeConceptGenerationOutputSchema},
  prompt: `You are an expert creative director and ideation assistant. Your goal is to help an editor overcome creative blocks by generating innovative and relevant creative concepts based on a provided brief and references.

Brief:
{{{brief}}}

References:
{{{references}}}

Generate a list of distinct and actionable creative concepts that address the brief and incorporate elements from the references. Each concept should be concise but descriptive enough to serve as a starting point for further development.`,
});

const creativeConceptGenerationFlow = ai.defineFlow(
  {
    name: 'creativeConceptGenerationFlow',
    inputSchema: CreativeConceptGenerationInputSchema,
    outputSchema: CreativeConceptGenerationOutputSchema,
  },
  async input => {
    const {output} = await creativeConceptPrompt(input);
    return output!;
  }
);

export async function generateCreativeConcepts(
  input: CreativeConceptGenerationInput
): Promise<CreativeConceptGenerationOutput> {
  return creativeConceptGenerationFlow(input);
}
