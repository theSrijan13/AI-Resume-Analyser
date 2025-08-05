'use server';
/**
 * @fileOverview This file defines a Genkit flow for AI skill gap analysis.
 *
 * - aiSkillGapAnalysis - A function that identifies skill gaps from resume and voice AI data and suggests personalized courses.
 * - AiSkillGapAnalysisInput - The input type for the aiSkillGapAnalysis function.
 * - AiSkillGapAnalysisOutput - The return type for the aiSkillGapAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiSkillGapAnalysisInputSchema = z.object({
  resumeData: z
    .string()
    .describe('The text extracted from the candidate\'s resume.'),
  voiceAiTranscript: z
    .string()
    .describe('The transcript from the voice AI interview.'),
});
export type AiSkillGapAnalysisInput = z.infer<typeof AiSkillGapAnalysisInputSchema>;

const AiSkillGapAnalysisOutputSchema = z.object({
  skillGaps: z
    .string()
    .describe('A summary of the identified skill gaps.'),
  recommendedCourses: z
    .string()
    .describe('A list of recommended courses to address the skill gaps.'),
});
export type AiSkillGapAnalysisOutput = z.infer<typeof AiSkillGapAnalysisOutputSchema>;

export async function aiSkillGapAnalysis(
  input: AiSkillGapAnalysisInput
): Promise<AiSkillGapAnalysisOutput> {
  return aiSkillGapAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiSkillGapAnalysisPrompt',
  input: {schema: AiSkillGapAnalysisInputSchema},
  output: {schema: AiSkillGapAnalysisOutputSchema},
  prompt: `You are an AI assistant designed to identify skill gaps in candidates based on their resume data and voice AI interview transcripts, and then recommend personalized courses to bridge those gaps.

  Analyze the following information:

  Resume Data: {{{resumeData}}}

  Voice AI Interview Transcript: {{{voiceAiTranscript}}}

  Based on this analysis, identify the key skill gaps and suggest specific courses or learning resources that could help the candidate improve their qualifications.  Make the response specific to the candidate and the data provided.

  Skill Gaps: 

  Recommended Courses: `,
});

const aiSkillGapAnalysisFlow = ai.defineFlow(
  {
    name: 'aiSkillGapAnalysisFlow',
    inputSchema: AiSkillGapAnalysisInputSchema,
    outputSchema: AiSkillGapAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
