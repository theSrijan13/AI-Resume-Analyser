'use server';

import { parseResume } from '@/ai/flows/resume-parsing';

export async function handleParseResume(formData: FormData) {
  const file = formData.get('resume') as File;
  if (!file) {
    throw new Error('No resume file provided');
  }
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const dataUri = `data:${file.type};base64,${base64}`;

  return await parseResume({ resumeDataUri: dataUri });
}
