'use server';

/**
 * @fileOverview A Genkit flow for the /config page, which displays configurations received from MT4.
 * This page includes a placeholder indicating that configurations are managed externally and is intended to eventually incorporate generative AI tools for analysis and improvement.
 *
 * - getConfigPageContent - A function that generates content for the config page.
 * - ConfigPageContentInput - The input type for the getConfigPageContent function (currently empty).
 * - ConfigPageContentOutput - The return type for the getConfigPageContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConfigPageContentInputSchema = z.object({});
export type ConfigPageContentInput = z.infer<typeof ConfigPageContentInputSchema>;

const ConfigPageContentOutputSchema = z.object({
  message: z.string().describe('A message indicating configurations are managed externally.'),
});
export type ConfigPageContentOutput = z.infer<typeof ConfigPageContentOutputSchema>;

export async function getConfigPageContent(input: ConfigPageContentInput): Promise<ConfigPageContentOutput> {
  return configPageContentFlow(input);
}

const configPageContentPrompt = ai.definePrompt({
  name: 'configPageContentPrompt',
  input: {schema: ConfigPageContentInputSchema},
  output: {schema: ConfigPageContentOutputSchema},
  prompt: 'Display a message indicating that configurations are received from MT4 and managed externally.  Also mention that this page will eventually incorporate generative AI tools to analyze and improve the configuration based on discovered data relationships.'
});

const configPageContentFlow = ai.defineFlow(
  {
    name: 'configPageContentFlow',
    inputSchema: ConfigPageContentInputSchema,
    outputSchema: ConfigPageContentOutputSchema,
  },
  async input => {
    const {output} = await configPageContentPrompt(input);
    return output!;
  }
);
