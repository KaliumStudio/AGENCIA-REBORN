'use server';
/**
 * @fileOverview A Genkit flow for analyzing client feedback from chat messages.
 *
 * - analyzeClientFeedback - A function that processes chat messages to summarize key revision requests.
 * - ClientFeedbackAnalysisInput - The input type for the analyzeClientFeedback function.
 * - ClientFeedbackAnalysisOutput - The return type for the analyzeClientFeedback function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ClientFeedbackAnalysisInputSchema = z.object({
  messages: z.array(
    z.object({
      senderAlias: z.string().describe('The alias of the sender (e.g., "Client", "Editor #A1B2").'),
      text: z.string().describe('The content of the chat message.'),
    })
  ).describe('A list of chat messages containing client feedback or correction requests.'),
});
export type ClientFeedbackAnalysisInput = z.infer<typeof ClientFeedbackAnalysisInputSchema>;

const ClientFeedbackAnalysisOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the key changes and revisions requested by the client.'),
});
export type ClientFeedbackAnalysisOutput = z.infer<typeof ClientFeedbackAnalysisOutputSchema>;

export async function analyzeClientFeedback(input: ClientFeedbackAnalysisInput): Promise<ClientFeedbackAnalysisOutput> {
  return clientFeedbackAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'clientFeedbackAnalysisPrompt',
  input: { schema: ClientFeedbackAnalysisInputSchema },
  output: { schema: ClientFeedbackAnalysisOutputSchema },
  prompt: `You are an AI assistant tasked with summarizing client feedback from chat messages.
Read the following chat messages and identify the key changes, corrections, or feedback requested by the client.
Consolidate these requests into a concise, actionable summary.
Focus on identifying specific actions or modifications needed for the creative assets.

Chat Messages:
{{#each messages}}
  {{{senderAlias}}}: {{{text}}}
{{/each}}`,
});

const clientFeedbackAnalysisFlow = ai.defineFlow(
  {
    name: 'clientFeedbackAnalysisFlow',
    inputSchema: ClientFeedbackAnalysisInputSchema,
    outputSchema: ClientFeedbackAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
