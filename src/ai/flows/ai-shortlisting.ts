'use server';

/**
 * @fileOverview An AI agent for automated resume shortlisting.
 *
 * - aiShortlisting - A function that handles the resume shortlisting process.
 * - AiShortlistingInput - The input type for the aiShortlisting function.
 * - AiShortlistingOutput - The return type for the aiShortlisting function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiShortlistingInputSchema = z.object({
  resumeData: z.string().describe('The resume data as text.'),
  jobRequirements: z.string().describe('The job requirements as text.'),
});
export type AiShortlistingInput = z.infer<typeof AiShortlistingInputSchema>;

const AiShortlistingOutputSchema = z.object({
  suitabilityScore: z
    .number()
    .describe('A score indicating the suitability of the candidate for the job.'),
  reasons: z
    .string()
    .describe('Reasons for the suitability score, highlighting strengths and weaknesses.'),
  isRecommended: z.boolean().describe('Whether the candidate is recommended for the job.'),
});
export type AiShortlistingOutput = z.infer<typeof AiShortlistingOutputSchema>;

export async function aiShortlisting(input: AiShortlistingInput): Promise<AiShortlistingOutput> {
  return aiShortlistingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiShortlistingPrompt',
  input: {schema: AiShortlistingInputSchema},
  output: {schema: AiShortlistingOutputSchema},
  prompt: `You are an AI recruiter tasked with evaluating candidate resumes based on job requirements.\n\nGiven the following resume data:\n\n{{{resumeData}}}\n\nAnd the following job requirements:\n\n{{{jobRequirements}}}\n\nEvaluate the candidate's suitability for the job and provide a suitability score (0-100), reasons for the score, and a recommendation (true/false).`,
});

const aiShortlistingFlow = ai.defineFlow(
  {
    name: 'aiShortlistingFlow',
    inputSchema: AiShortlistingInputSchema,
    outputSchema: AiShortlistingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
