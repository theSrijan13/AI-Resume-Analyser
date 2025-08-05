'use server';

import { z } from 'zod';
import { aiShortlisting } from '@/ai/flows/ai-shortlisting';

const formSchema = z.object({
  resumeData: z.string().min(100, 'Resume data must be at least 100 characters.'),
  jobRequirements: z.string().min(50, 'Job requirements must be at least 50 characters.'),
});


export async function handleShortlisting(data: z.infer<typeof formSchema>) {
  return await aiShortlisting(data);
}
