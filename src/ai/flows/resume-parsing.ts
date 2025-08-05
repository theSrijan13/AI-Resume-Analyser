'use server';

/**
 * @fileOverview Resume parsing AI agent.
 *
 * - parseResume - A function that handles the resume parsing process.
 * - ParseResumeInput - The input type for the parseResume function.
 * - ParseResumeOutput - The return type for the parseResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ParseResumeInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      "A resume file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ParseResumeInput = z.infer<typeof ParseResumeInputSchema>;

const ParseResumeOutputSchema = z.object({
  name: z.string().describe('The name of the candidate.'),
  email: z.string().describe('The email address of the candidate.'),
  phone: z.string().describe('The phone number of the candidate.'),
  education: z.array(z.string()).describe('The education history of the candidate.'),
  experience: z.array(z.string()).describe('The work experience of the candidate.'),
  skills: z.array(z.string()).describe('The skills of the candidate.'),
  certifications: z.array(z.string()).describe('The certifications of the candidate.'),
});
export type ParseResumeOutput = z.infer<typeof ParseResumeOutputSchema>;

export async function parseResume(input: ParseResumeInput): Promise<ParseResumeOutput> {
  return parseResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'parseResumePrompt',
  input: {schema: ParseResumeInputSchema},
  output: {schema: ParseResumeOutputSchema},
  prompt: `You are an expert resume parser. Extract the following information from the resume. If a field can't be found, leave it blank.

Name:
Email:
Phone:
Education:
Experience:
Skills:
Certifications:

Resume: {{media url=resumeDataUri}}`,
});

const parseResumeFlow = ai.defineFlow(
  {
    name: 'parseResumeFlow',
    inputSchema: ParseResumeInputSchema,
    outputSchema: ParseResumeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
