'use server';

import { z } from 'zod';
import { voiceAiInterviewer } from '@/ai/flows/voice-ai-interviewer';

const formSchema = z.object({
  candidateName: z.string().min(2, 'Candidate name is required.'),
  jobDescription: z.string().min(50, 'Job description must be at least 50 characters.'),
  resumeText: z.string().min(100, 'Resume text must be at least 100 characters.'),
});


export async function handleVoiceInterview(data: z.infer<typeof formSchema>) {
  return await voiceAiInterviewer(data);
}
