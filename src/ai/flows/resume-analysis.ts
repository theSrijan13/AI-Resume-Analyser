'use server';

/**
 * @fileOverview A comprehensive resume analysis AI agent for candidates.
 *
 * - analyzeResume - A function that handles the resume analysis process.
 * - AnalyzeResumeInput - The input type for the analyzeResume function.
 * - AnalyzeResumeOutput - The return type for the analyzeResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeResumeInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      "A resume file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeResumeInput = z.infer<typeof AnalyzeResumeInputSchema>;

const ResumeSectionSchema = z.object({
  name: z.string().describe('The name of the candidate.'),
  email: z.string().describe('The email address of the candidate.'),
  phone: z.string().describe('The phone number of the candidate.'),
  summary: z.string().describe('The professional summary or objective.'),
  experience: z.array(z.string()).describe('The work experience of the candidate.'),
  education: z.array(z.string()).describe('The education history of the candidate.'),
  skills: z.array(z.string()).describe('The skills of the candidate.'),
});

const AnalysisSchema = z.object({
    strengths: z.array(z.string()).describe('Bulleted list of strengths of the resume.'),
    areasForImprovement: z.array(z.string()).describe('Bulleted list of areas for improvement.'),
    suggestions: z.array(z.string()).describe('Actionable suggestions to make the resume better.'),
    anomalyDetection: z.object({
        hasGaps: z.boolean().describe('Whether the resume has significant employment gaps.'),
        missingInfo: z.array(z.string()).describe('List of potentially missing key information (e.g., contact info, dates).'),
    }).describe('Detection of anomalies in the resume.'),
});


const AnalyzeResumeOutputSchema = z.object({
  extractedData: ResumeSectionSchema,
  analysis: AnalysisSchema,
  overallScore: z.number().min(0).max(100).describe('An overall score for the resume from 0 to 100.'),
});
export type AnalyzeResumeOutput = z.infer<typeof AnalyzeResumeOutputSchema>;


export async function analyzeResume(input: AnalyzeResumeInput): Promise<AnalyzeResumeOutput> {
  return analyzeResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeResumePrompt',
  input: {schema: AnalyzeResumeInputSchema},
  output: {schema: AnalyzeResumeOutputSchema},
  model: 'googleai/gemini-2.5-flash',
  prompt: `You are an expert career coach and resume analyst. Your task is to conduct a complete, comprehensive, and exhaustive analysis of the provided resume.

First, extract all key information from the resume. Be as thorough as possible.

Second, perform a detailed analysis covering the following:
- **Strengths**: What makes this resume strong? (e.g., clear impact metrics, strong action verbs).
- **Areas for Improvement**: What are the weaknesses? (e.g., vague descriptions, formatting issues).
- **Actionable Suggestions**: Provide specific, bullet-pointed advice on how to improve the resume.
- **Anomaly Detection**: Identify any potential red flags, such as unexplained gaps in employment or missing contact information.

Finally, provide an overall score for the resume from 0 to 100 based on its clarity, impact, and completeness.

Resume: {{media url=resumeDataUri}}`,
});

const analyzeResumeFlow = ai.defineFlow(
  {
    name: 'analyzeResumeFlow',
    inputSchema: AnalyzeResumeInputSchema,
    outputSchema: AnalyzeResumeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
