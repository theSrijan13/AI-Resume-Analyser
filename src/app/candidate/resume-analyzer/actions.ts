'use server';

import { analyzeResume } from '@/ai/flows/resume-analysis';

export async function handleAnalyzeResume(formData: FormData) {
  const file = formData.get('resume') as File;
  const jobDescription = formData.get('jobDescription') as string;
  const jobUrl = formData.get('jobUrl') as string;

  if (!file) {
    throw new Error('No resume file provided');
  }
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const dataUri = `data:${file.type};base64,${base64}`;

  return await analyzeResume({ 
    resumeDataUri: dataUri,
    jobDescription: jobDescription || undefined,
    jobUrl: jobUrl || undefined,
  });
}
