'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ScanSearch, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { AiShortlistingOutput } from '@/ai/flows/ai-shortlisting';
import { Progress } from '@/components/ui/progress';
import { handleShortlisting } from './actions';

const formSchema = z.object({
  resumeData: z.string().min(100, 'Resume data must be at least 100 characters.'),
  jobRequirements: z.string().min(50, 'Job requirements must be at least 50 characters.'),
});

export default function ShortlistingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AiShortlistingOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      resumeData: '',
      jobRequirements: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);

    try {
      const shortlistingResult = await handleShortlisting(values);
      setResult(shortlistingResult);
      toast({
        title: 'Analysis Complete',
        description: 'AI shortlisting analysis finished successfully.',
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
          <ScanSearch /> AI Shortlisting
        </h2>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <Card className="underglow">
          <CardHeader>
            <CardTitle>Candidate & Job Details</CardTitle>
            <CardDescription>
              Paste the resume text and job requirements to get an AI-powered evaluation.
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
                  name="resumeData"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resume Text</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Paste the full text of the candidate's resume here..."
                          className="min-h-[200px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="jobRequirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Requirements</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Paste the key job requirements and responsibilities..."
                          className="min-h-[150px]"
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
                      Analyzing...
                    </>
                  ) : (
                    'Run AI Shortlisting'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="underglow">
          <CardHeader>
            <CardTitle>AI Analysis Result</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            {!isLoading && !result && (
              <div className="text-center text-muted-foreground">
                The AI analysis will appear here.
              </div>
            )}
            {result && (
              <div className="space-y-6">
                 <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    Recommendation:
                    {result.isRecommended ? (
                      <span className="text-green-500 flex items-center gap-1"><ThumbsUp size={20} /> Recommended</span>
                    ) : (
                      <span className="text-red-500 flex items-center gap-1"><ThumbsDown size={20} /> Not Recommended</span>
                    )}
                  </h3>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Suitability Score: {result.suitabilityScore} / 100</h3>
                  <Progress value={result.suitabilityScore} className="w-full" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Reasons</h3>
                  <p className="text-base text-muted-foreground whitespace-pre-wrap">{result.reasons}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}