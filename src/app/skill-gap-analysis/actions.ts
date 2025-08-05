'use server';

import { z } from 'zod';
import { aiSkillGapAnalysis } from '@/ai/flows/ai-skill-gap-analysis';

const formSchema = z.object({
  resumeData: z.string().min(100, 'Resume data must be at least 100 characters.'),
  voiceAiTranscript: z.string().min(50, 'Voice AI transcript must be at least 50 characters.'),
});

export async function handleSkillGapAnalysis(data: z.infer<typeof formSchema>) {
  return await aiSkillGapAnalysis(data);
}
