'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sparkles, Loader2, Lightbulb } from 'lucide-react';
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
import { AiSkillGapAnalysisOutput } from '@/ai/flows/ai-skill-gap-analysis';
import { Badge } from '@/components/ui/badge';
import { handleSkillGapAnalysis } from './actions';

const formSchema = z.object({
  resumeData: z.string().min(100, 'Resume data must be at least 100 characters.'),
  voiceAiTranscript: z.string().min(50, 'Voice AI transcript must be at least 50 characters.'),
});

export default function SkillGapAnalysisPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AiSkillGapAnalysisOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      resumeData: '',
      voiceAiTranscript: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);

    try {
      const analysisResult = await handleSkillGapAnalysis(values);
      setResult(analysisResult);
      toast({
        title: 'Analysis Complete',
        description: 'Skill gap analysis is ready.',
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
          <Sparkles /> AI Skill Gap Analysis
        </h2>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <Card className="underglow">
          <CardHeader>
            <CardTitle>Candidate Data</CardTitle>
            <CardDescription>
              Provide the candidate's data to identify skill gaps and get training recommendations.
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
                  name="voiceAiTranscript"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Voice AI Interview Transcript/Summary</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Paste the transcript or summary from the Voice AI interview..."
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
                    <>
                      <Lightbulb className="mr-2 h-4 w-4" />
                      Generate Analysis
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="underglow">
          <CardHeader>
            <CardTitle>Analysis & Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            {!isLoading && !result && (
              <div className="text-center text-muted-foreground">
                The analysis and course recommendations will appear here.
              </div>
            )}
            {result && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold">Identified Skill Gaps</h3>
                  <p className="text-base text-muted-foreground whitespace-pre-wrap">{result.skillGaps}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Recommended Courses</h3>
                  <div className="text-base text-muted-foreground whitespace-pre-wrap">
                    {result.recommendedCourses.split(',').map((course, index) => (
                      <Badge key={index} variant="default" className="mr-2 mb-2 bg-accent text-accent-foreground">
                        {course.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
