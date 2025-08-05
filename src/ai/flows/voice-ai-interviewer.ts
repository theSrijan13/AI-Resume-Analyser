// This is a server-side file.
'use server';

/**
 * @fileOverview Voice AI Agent for conducting preliminary interviews with candidates.
 *
 * - voiceAiInterviewer - A function to initiate and manage the voice AI interview process.
 * - VoiceAiInterviewerInput - The input type for the voiceAiInterviewer function.
 * - VoiceAiInterviewerOutput - The return type for the voiceAiInterviewer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VoiceAiInterviewerInputSchema = z.object({
  candidateName: z.string().describe('The name of the candidate being interviewed.'),
  jobDescription: z.string().describe('The description of the job for which the candidate is being interviewed.'),
  resumeText: z.string().describe('The text content of the candidate\'s resume.'),
});
export type VoiceAiInterviewerInput = z.infer<typeof VoiceAiInterviewerInputSchema>;

const VoiceAiInterviewerOutputSchema = z.object({
  interviewSummary: z.string().describe('A summary of the interview, including the candidate\'s strengths and weaknesses.'),
  suitabilityScore: z.number().describe('A score indicating the candidate\'s suitability for the job (0-100).'),
  suggestedNextSteps: z.string().describe('Suggested next steps for the candidate, such as further interviews or training.'),
});
export type VoiceAiInterviewerOutput = z.infer<typeof VoiceAiInterviewerOutputSchema>;

export async function voiceAiInterviewer(input: VoiceAiInterviewerInput): Promise<VoiceAiInterviewerOutput> {
  return voiceAiInterviewerFlow(input);
}

const questionSchema = z.object({
  question: z.string().describe('The question to ask the candidate.'),
});

const answerSchema = z.object({
  answer: z.string().describe('The candidate\'s answer to the question.'),
});

const prompt = ai.definePrompt({
  name: 'voiceAiInterviewerPrompt',
  input: {schema: VoiceAiInterviewerInputSchema},
  output: {schema: VoiceAiInterviewerOutputSchema},
  prompt: `You are an AI recruiter conducting a preliminary interview with {{candidateName}} for the job described below.

Job Description: {{jobDescription}}

Resume Text: {{resumeText}}

Your goal is to assess the candidate's soft skills and overall suitability for the job.

Based on the job description and resume, ask relevant questions to evaluate the candidate.

After the interview, provide a summary of the candidate's strengths and weaknesses, a suitability score (0-100), and suggested next steps.

Make sure to format the final output correctly.

Final Answer: {
  "interviewSummary": "...",
  "suitabilityScore": 0,
  "suggestedNextSteps": "..."
}`,
});

const questionPrompt = ai.definePrompt({
  name: 'voiceAiInterviewerQuestionPrompt',
  input: {schema: VoiceAiInterviewerInputSchema},
  output: {schema: questionSchema},
  prompt: `Given the following candidate information and job description, what is the next best question to ask to assess their suitability for the role? Only output the question. Do not include any other text.

Candidate Name: {{candidateName}}
Job Description: {{jobDescription}}
Resume Text: {{resumeText}}`
});

const answerPrompt = ai.definePrompt({
  name: 'voiceAiInterviewerAnswerPrompt',
  input: {schema: z.object({
    question: z.string(),
    answer: z.string()
  })},
  output: {schema: answerSchema},
  prompt: `The question was "{{question}}" and the answer was "{{answer}}"`
});

const voiceAiInterviewerFlow = ai.defineFlow(
  {
    name: 'voiceAiInterviewerFlow',
    inputSchema: VoiceAiInterviewerInputSchema,
    outputSchema: VoiceAiInterviewerOutputSchema,
  },
  async input => {
    // For simplicity, let's just call the prompt once for now. In a real
    // implementation, we'd want to have a conversation with the candidate.

    let conversationHistory = '';
    let nextQuestion = (await questionPrompt(input)).output?.question;

    //ask 3 questions
    for (let i = 0; i < 3; ++i) {
        //here a real implementation would use a TTS and speech to text model to orchestrate a real conversation
        const fakeAnswer = `This is the candidate\'s answer to the question: ${nextQuestion}`;

        conversationHistory += `Question: ${nextQuestion}\nAnswer: ${fakeAnswer}\n`;

        nextQuestion = (await questionPrompt(input)).output?.question;
    }


    const {output} = await prompt(input);
    return output!;
  }
);
