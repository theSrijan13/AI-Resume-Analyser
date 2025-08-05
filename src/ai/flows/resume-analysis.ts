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
  jobDescription: z.string().optional().describe('The job description to compare the resume against.'),
  jobUrl: z.string().optional().describe('A URL to the job posting.'),
});
export type AnalyzeResumeInput = z.infer<typeof AnalyzeResumeInputSchema>;

const ExperienceSchema = z.object({
    role: z.string().describe('The job title or role.'),
    company: z.string().describe('The name of the company.'),
    dates: z.string().describe('The start and end dates of the employment (e.g., "Jan 2020 - Present").'),
    description: z.array(z.string()).describe('A list of bullet points describing responsibilities and achievements.')
});

const EducationSchema = z.object({
    institution: z.string().describe('The name of the educational institution.'),
    degree: z.string().describe('The degree or field of study.'),
    dates: z.string().describe('The start and end dates of the education (e.g., "Aug 2016 - May 2020").'),
    details: z.array(z.string()).optional().describe('Any additional details like GPA, honors, or relevant coursework.')
});

const ProjectSchema = z.object({
    name: z.string().describe('The name of the project.'),
    dates: z.string().optional().describe('The dates or timeframe of the project.'),
    technologies: z.array(z.string()).describe('A list of technologies used in the project.'),
    description: z.array(z.string()).describe('A list of bullet points describing the project and its outcomes.')
});

const ResumeSectionSchema = z.object({
  name: z.string().describe('The name of the candidate.'),
  email: z.string().describe('The email address of the candidate.'),
  phone: z.string().describe('The phone number of the candidate.'),
  summary: z.string().describe('The professional summary or objective.'),
  experience: z.array(ExperienceSchema).describe('The work experience of the candidate, including company, role, and dates.'),
  education: z.array(EducationSchema).describe('The education history of the candidate, including institution, degree, and dates.'),
  skills: z.array(z.string()).describe('The skills of the candidate.'),
  projects: z.array(ProjectSchema).describe('A list of projects mentioned in the resume.'),
  certifications: z.array(z.string()).describe('A list of certifications mentioned in the resume.'),
  links: z.array(z.string()).describe('A list of URLs or links to portfolios, GitHub, LinkedIn, etc.'),
});

const GeneralAnalysisSchema = z.object({
    firstImpressions: z.string().describe("The AI's immediate, high-level feedback on the resume upon first glance."),
    strengths: z.array(z.string()).describe('Bulleted list of strengths of the resume.'),
    areasForImprovement: z.array(z.string()).describe('Bulleted list of areas for improvement.'),
    suggestions: z.array(z.string()).describe('Actionable suggestions to make the resume better.'),
    anomalyDetection: z.object({
        hasGaps: z.boolean().describe('Whether the resume has significant employment gaps.'),
        missingInfo: z.array(z.string()).describe('List of potentially missing key information (e.g., contact info, dates).'),
    }).describe('Detection of anomalies in the resume.'),
});

const VisualAnalysisSchema = z.object({
    formattingConsistency: z.string().describe("Comments on the consistency of formatting (e.g., dates, bullet points, spacing)."),
    layoutClarity: z.string().describe("Feedback on the overall layout, readability, and use of white space."),
    fontChoice: z.string().describe("Comments on the font choice and size for readability and professionalism."),
    visualIssues: z.array(z.string()).describe("A list of specific visual or formatting issues found (e.g., 'Inconsistent date format in Experience section')."),
});

const JobMatchAnalysisSchema = z.object({
    isApplicable: z.boolean().describe('Whether a job description or URL was provided for analysis.'),
    matchScore: z.number().min(0).max(100).describe('A score from 0 to 100 indicating how well the resume matches the job description.'),
    matchingKeywords: z.array(z.string()).describe('Keywords from the job description found in the resume.'),
    missingKeywords: z.array(z.string()).describe('Important keywords from the job description missing from the resume.'),
    alignmentSummary: z.string().describe('A summary of how well the resume aligns with the job description.'),
}).describe('Analysis of the resume against a specific job description.');


const AnalyzeResumeOutputSchema = z.object({
  extractedData: ResumeSectionSchema,
  generalAnalysis: GeneralAnalysisSchema,
  jobMatchAnalysis: JobMatchAnalysisSchema,
  visualAnalysis: VisualAnalysisSchema,
  overallScore: z.number().min(0).max(100).describe('An overall score for the resume from 0 to 100 based on its clarity, impact, and completeness.'),
});
export type AnalyzeResumeOutput = z.infer<typeof AnalyzeResumeOutputSchema>;


export async function analyzeResume(input: AnalyzeResumeInput): Promise<AnalyzeResumeOutput> {
  return analyzeResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeResumePrompt',
  input: {schema: AnalyzeResumeInputSchema},
  output: {schema: AnalyzeResumeOutputSchema},
  prompt: `You are a world-class expert career coach and senior resume analyst with 20 years of experience. Your task is to conduct a complete, comprehensive, and exhaustive analysis of the provided resume. Be critical, detailed, and provide actionable, professional advice.

First, extract all key information from the resume. Be as thorough as possible. For experience, education, and projects, extract full, detailed, multi-point descriptions. For links, extract the full URL.

Second, perform a detailed general analysis covering the following:
- **First Impressions**: Give your immediate, high-level feedback as if you were a recruiter seeing this for the first time. Comment on readability, layout, and initial impact.
- **Strengths**: What makes this resume strong? Be specific (e.g., "Quantifiable achievements in the 'Software Engineer at Acme' role show clear impact.").
- **Areas for Improvement**: What are the weaknesses? Be critical (e.g., "The summary is generic," "Bullet points under the 'Intern' role are task-based, not achievement-oriented," "Inconsistent date formatting.").
- **Actionable Suggestions**: Provide specific, bullet-pointed advice on how to improve the resume. These should be concrete steps the user can take.
- **Anomaly Detection**: Identify any potential red flags, such as unexplained gaps in employment, missing contact information, or typos.

Third, perform a visual and formatting analysis.
- **Formatting Consistency**: Is the formatting for dates, titles, and bullet points consistent throughout?
- **Layout and Clarity**: Is the layout clean, easy to scan, and does it use white space effectively?
- **Font Choice**: Is the font professional and readable?
- **Visual Issues**: List any specific formatting errors you find.

{{#if jobDescription}}
Fourth, because a job description has been provided, perform a job match analysis.
- **Job Match Score**: Score the resume's match to the job description from 0-100.
- **Keyword Analysis**: Identify matching and missing keywords between the resume and the job description.
- **Alignment Summary**: Explain in detail how well the candidate's experience and skills align with the role's requirements and responsibilities. Point out specific projects or experiences that are highly relevant.
Job Description for analysis:
{{{jobDescription}}}
{{else}}
{{#if jobUrl}}
Fourth, because a job URL has been provided, perform a job match analysis. You will act as if you can access the content of this URL.
- **Job Match Score**: Score the resume's match to the job description from 0-100.
- **Keyword Analysis**: Identify matching and missing keywords between the resume and the job description.
- **Alignment Summary**: Explain in detail how well the candidate's experience and skills align with the role's requirements and responsibilities. Point out specific projects or experiences that are highly relevant.
Job URL for analysis:
{{{jobUrl}}}
{{/if}}
{{/if}}

Finally, provide an overall score for the resume from 0 to 100 based on its general clarity, impact, and completeness.

Resume to analyze: {{media url=resumeDataUri}}`,
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
