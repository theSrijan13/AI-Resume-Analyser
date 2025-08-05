'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  FileText,
  Loader2,
  Upload,
  Sparkles,
  CheckCircle,
  XCircle,
  Lightbulb,
  Target,
  FileUp,
  RotateCcw,
  Link,
} from 'lucide-react';
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
import { AnalyzeResumeOutput } from '@/ai/flows/resume-analysis';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis } from 'recharts';
import { handleAnalyzeResume } from './actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  resume: z
    .instanceof(File, { message: 'Please upload a resume.' })
    .refine((file) => file.size > 0, 'Please upload a resume.')
    .refine((file) => file.size < 5 * 1024 * 1024, 'File size must be less than 5MB.'),
  jobDescription: z.string().optional(),
  jobUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
});

const chartConfig = {
    score: {
      label: "Score",
      color: "hsl(var(--primary))",
    },
};

export default function ResumeAnalyzerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResumeOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        resume: undefined,
        jobDescription: '',
        jobUrl: '',
    }
  });

  function handleReset() {
    form.reset();
    setResult(null);
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('resume', values.resume);
    if (values.jobDescription) {
        formData.append('jobDescription', values.jobDescription);
    }
    if(values.jobUrl) {
        formData.append('jobUrl', values.jobUrl);
    }

    try {
      const analysisData = await handleAnalyzeResume(formData);
      setResult(analysisData);
      toast({
        title: 'Success',
        description: 'Resume analysis complete.',
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

  const skillsChartData = result?.extractedData.skills.slice(0, 7).map(skill => ({
    subject: skill,
    score: Math.floor(Math.random() * (95 - 70 + 1)) + 70, // Placeholder score
  })) || [];


  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles /> AI Resume Analyzer
        </h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="underglow sticky top-4">
            <CardHeader>
              <CardTitle>Analyze Your Resume</CardTitle>
              <CardDescription>
                Get instant, AI-powered feedback. Add a job description or URL for tailored analysis.
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
                    name="resume"
                    render={({ field: { onChange, ...rest } }) => (
                      <FormItem>
                        <FormLabel>Resume File</FormLabel>
                        <FormControl>
                            <label className="relative flex items-center justify-center h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer hover:bg-accent hover:text-accent-foreground">
                                <FileUp className="h-5 w-5 text-muted-foreground mr-2" />
                                <span className="text-muted-foreground">{form.getValues('resume')?.name || 'Choose a file'}</span>
                                <Input
                                    type="file"
                                    className="sr-only"
                                    accept=".pdf,.doc,.docx,.txt"
                                    onChange={(e) => {
                                        if (e.target.files) {
                                        onChange(e.target.files[0]);
                                        }
                                    }}
                                />
                           </label>
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
                        <FormLabel>Job Description (Optional)</FormLabel>
                        <FormControl>
                            <Textarea 
                                placeholder="Paste the job description here..."
                                className="min-h-[150px]"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        Or
                      </span>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="jobUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Post URL (Optional)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input placeholder="https://example.com/job/posting" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={handleReset} className="w-full" disabled={isLoading}>
                      <RotateCcw className="mr-2" /> Clear
                    </Button>
                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                        </>
                        ) : (
                        'Analyze Resume'
                        )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
            {isLoading && (
              <div className="flex justify-center items-center h-96">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground">Our AI is analyzing your resume... this may take a moment.</p>
                </div>
              </div>
            )}
            {!isLoading && !result && (
              <Card className="underglow h-96 flex justify-center items-center">
                <div className="text-center text-muted-foreground p-4">
                    <FileText size={48} className="mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground">Awaiting Your Resume</h3>
                    <p className="mt-1">Upload your resume and optionally a job description to see your personalized AI analysis.</p>
                </div>
              </Card>
            )}
            {result && (
                <div className="space-y-8">
                    <Card className="underglow">
                        <CardHeader>
                             <CardTitle>Overall Score: {result.overallScore} / 100</CardTitle>
                             <CardDescription>This score reflects the general quality of your resume's content, structure, and clarity.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Progress value={result.overallScore} className="w-full" />
                        </CardContent>
                    </Card>
                    
                    {result.jobMatchAnalysis.isApplicable && (
                        <Card className="underglow">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Target /> Job Match Analysis</CardTitle>
                                <CardDescription>How well your resume aligns with the provided job description.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="text-base font-semibold mb-2">Match Score: {result.jobMatchAnalysis.matchScore} / 100</h3>
                                    <Progress value={result.jobMatchAnalysis.matchScore} className="w-full" />
                                </div>
                                <div>
                                    <h4 className="font-semibold">Alignment Summary</h4>
                                    <p className="text-muted-foreground text-sm">{result.jobMatchAnalysis.alignmentSummary}</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InfoList icon={<CheckCircle className="text-green-500" />} label="Matching Keywords" items={result.jobMatchAnalysis.matchingKeywords} />
                                    <InfoList icon={<XCircle className="text-destructive" />} label="Missing Keywords" items={result.jobMatchAnalysis.missingKeywords} />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                     <Card className="underglow">
                        <CardHeader>
                             <CardTitle>General AI Analysis</CardTitle>
                             <CardDescription>General feedback on your resume, independent of a specific job.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <AnalysisSection icon={<CheckCircle className="text-green-500" />} title="Strengths" items={result.generalAnalysis.strengths} />
                            <Separator />
                            <AnalysisSection icon={<XCircle className="text-destructive" />} title="Areas for Improvement" items={result.generalAnalysis.areasForImprovement} />
                            <Separator />
                            <AnalysisSection icon={<Lightbulb className="text-yellow-500" />} title="Actionable Suggestions" items={result.generalAnalysis.suggestions} />
                        </CardContent>
                    </Card>

                    {skillsChartData.length > 0 && (
                        <Card className="underglow">
                            <CardHeader>
                                <CardTitle>Skills Visualization</CardTitle>
                                <CardDescription>A visual representation of your key skills (top 7 shown).</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={chartConfig} className="h-[350px] w-full">
                                    <RadarChart data={skillsChartData}>
                                        <PolarGrid />
                                        <PolarAngleAxis dataKey="subject" />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Radar name="Skill Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                                    </RadarChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    )}

                    <Card className="underglow">
                        <CardHeader>
                            <CardTitle>Extracted Information</CardTitle>
                            <CardDescription>The key details our AI extracted from your document.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <InfoItem label="Name" value={result.extractedData.name} />
                                <InfoItem label="Email" value={result.extractedData.email} />
                                <InfoItem label="Phone" value={result.extractedData.phone} />
                            </div>
                             <Separator/>
                             <InfoList label="Skills" items={result.extractedData.skills} />
                             <Separator/>
                             <Alert>
                                <AlertTitle>Summary</AlertTitle>
                                <AlertDescription>{result.extractedData.summary || 'No summary found.'}</AlertDescription>
                             </Alert>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <AnalysisSection title="Experience" items={result.extractedData.experience} icon={<FileText />} />
                                <AnalysisSection title="Education" items={result.extractedData.education} icon={<FileText />} />
                            </div>
                        </CardContent>
                    </Card>

                </div>
            )}
        </div>
      </div>
    </div>
  );
}

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-1">
    <h3 className="text-sm font-semibold text-muted-foreground">{label}</h3>
    <p className="text-base">{value || 'Not found'}</p>
  </div>
);

const InfoList = ({ label, items, icon }: { label:string; items: string[]; icon?: React.ReactNode }) => (
    <div>
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2 mb-2">{icon} {label}</h3>
        {items && items.length > 0 ? (
            <div className="flex flex-wrap gap-2 mt-1">
                {items.map((item, index) => (
                    <Badge key={index} variant="secondary">{item}</Badge>
                ))}
            </div>
        ) : (
            <p className="text-sm text-muted-foreground">Not found</p>
        )}
    </div>
);

const AnalysisSection = ({ icon, title, items }: { icon: React.ReactNode, title: string, items: string[] }) => (
    <div>
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">{icon} {title}</h3>
      <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
        {items.length === 0 && <p>None found.</p>}
      </ul>
    </div>
  );
