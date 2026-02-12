'use server';
/**
 * @fileOverview A Genkit flow for summarizing batch briefs.
 *
 * - summarizeBrief - A function that generates an AI-powered summary of a batch brief.
 * - BriefSummarizationInput - The input type for the summarizeBrief function.
 * - BriefSummarizationOutput - The return type for the summarizeBrief function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const BriefSummarizationInputSchema = z.object({
  brief: z.string().describe('The detailed brief content to be summarized.'),
});
export type BriefSummarizationInput = z.infer<typeof BriefSummarizationInputSchema>;

const BriefSummarizationOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the brief, highlighting key requirements and project essence.'),
});
export type BriefSummarizationOutput = z.infer<typeof BriefSummarizationOutputSchema>;

export async function summarizeBrief(input: BriefSummarizationInput): Promise<BriefSummarizationOutput> {
  return briefSummarizationFlow(input);
}

const briefSummarizationPrompt = ai.definePrompt({
  name: 'briefSummarizationPrompt',
  input: { schema: BriefSummarizationInputSchema },
  output: { schema: BriefSummarizationOutputSchema },
  prompt: `You are an expert summarization AI. Your task is to provide a concise summary of the following project brief. Focus on identifying the key requirements, the core essence of the project, and any critical details that an editor or administrator would need to quickly understand the task and assign it.

Brief:
{{{brief}}}`,
});

const briefSummarizationFlow = ai.defineFlow(
  {
    name: 'briefSummarizationFlow',
    inputSchema: BriefSummarizationInputSchema,
    outputSchema: BriefSummarizationOutputSchema,
  },
  async (input) => {
    const { output } = await briefSummarizationPrompt(input);
    return output!;
  }
);
