'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bot, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { voiceAiInterviewer, VoiceAiInterviewerOutput } from '@/ai/flows/voice-ai-interviewer';
import { Progress } from '@/components/ui/progress';

const formSchema = z.object({
  candidateName: z.string().min(2, 'Candidate name is required.'),
  jobDescription: z.string().min(50, 'Job description must be at least 50 characters.'),
  resumeText: z.string().min(100, 'Resume text must be at least 100 characters.'),
});

async function handleVoiceInterview(data: z.infer<typeof formSchema>) {
  'use server';
  return await voiceAiInterviewer(data);
}

export default function VoiceInterviewerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VoiceAiInterviewerOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      candidateName: '',
      jobDescription: '',
      resumeText: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);

    try {
      const interviewResult = await handleVoiceInterview(values);
      setResult(interviewResult);
      toast({
        title: 'Interview Complete',
        description: 'Voice AI interview analysis is ready.',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'An unknown error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Bot /> Voice AI Interviewer
        </h2>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <Card className="underglow">
          <CardHeader>
            <CardTitle>Start Interview Simulation</CardTitle>
            <CardDescription>
              Provide the details below to start the simulated Voice AI interview.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="candidateName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Candidate Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Jane Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="jobDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Paste the job description..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="resumeText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resume Text</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Paste the candidate's resume text..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Interviewing...
                    </>
                  ) : (
                    <>
                     <Send className="mr-2 h-4 w-4" /> Start Simulation
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="underglow">
          <CardHeader>
            <CardTitle>AI Interview Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            {!isLoading && !result && (
              <div className="text-center text-muted-foreground">
                The interview analysis will appear here.
              </div>
            )}
            {result && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Suitability Score: {result.suitabilityScore} / 100</h3>
                  <Progress value={result.suitabilityScore} className="w-full" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Interview Summary</h3>
                  <p className="text-base text-muted-foreground whitespace-pre-wrap">{result.interviewSummary}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Suggested Next Steps</h3>
                  <p className="text-base text-muted-foreground whitespace-pre-wrap">{result.suggestedNextSteps}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
