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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, PolarGrid, PolarAngleAxis, RadarChart, Radar } from 'recharts';
import { handleAnalyzeResume } from './actions';

const formSchema = z.object({
  resume: z
    .instanceof(File, { message: 'Please upload a resume.' })
    .refine((file) => file.size < 5 * 1024 * 1024, 'File size must be less than 5MB.'),
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
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('resume', values.resume);

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

  const skillsChartData = result?.extractedData.skills.map(skill => ({
    subject: skill,
    score: Math.floor(Math.random() * (95 - 70 + 1)) + 70, // Placeholder score
  })) || [];


  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles /> Resume Analyzer
        </h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="underglow sticky top-4">
            <CardHeader>
              <CardTitle>Upload Your Resume</CardTitle>
              <CardDescription>
                Get instant AI-powered feedback.
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
                    render={({ field: { onChange, value, ...rest } }) => (
                      <FormItem>
                        <FormLabel>Resume File</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Upload className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                              type="file"
                              className="pl-10"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => {
                                if (e.target.files) {
                                  onChange(e.target.files[0]);
                                }
                              }}
                              {...rest}
                            />
                          </div>
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
                      'Analyze Resume'
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
            {isLoading && (
              <div className="flex justify-center items-center h-96">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            )}
            {!isLoading && !result && (
              <Card className="underglow h-96 flex justify-center items-center">
                <div className="text-center text-muted-foreground">
                    <FileText size={48} className="mx-auto mb-4" />
                    <p>Upload a resume to see the AI analysis.</p>
                </div>
              </Card>
            )}
            {result && (
                <div className="space-y-8">
                    <Card className="underglow">
                        <CardHeader>
                             <CardTitle>Overall Score: {result.overallScore} / 100</CardTitle>
                             <CardDescription>This score reflects the overall quality of your resume.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Progress value={result.overallScore} className="w-full" />
                        </CardContent>
                    </Card>

                    <Card className="underglow">
                        <CardHeader>
                            <CardTitle>Extracted Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <InfoItem label="Name" value={result.extractedData.name} />
                            <InfoItem label="Email" value={result.extractedData.email} />
                            <InfoItem label="Phone" value={result.extractedData.phone} />
                            <InfoList label="Skills" items={result.extractedData.skills} />
                            <InfoList label="Experience" items={result.extractedData.experience} />
                            <InfoList label="Education" items={result.extractedData.education} />
                        </CardContent>
                    </Card>

                    <Card className="underglow">
                        <CardHeader>
                             <CardTitle>AI Analysis & Suggestions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <AnalysisSection icon={<CheckCircle className="text-green-500" />} title="Strengths" items={result.analysis.strengths} />
                            <Separator />
                            <AnalysisSection icon={<XCircle className="text-destructive" />} title="Areas for Improvement" items={result.analysis.areasForImprovement} />
                            <Separator />
                            <AnalysisSection icon={<Lightbulb className="text-yellow-500" />} title="Actionable Suggestions" items={result.analysis.suggestions} />
                        </CardContent>
                    </Card>

                    {skillsChartData.length > 0 && (
                        <Card className="underglow">
                            <CardHeader>
                                <CardTitle>Skills Visualization</CardTitle>
                                <CardDescription>A visual representation of your key skills.</CardDescription>
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
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <h3 className="text-sm font-semibold text-muted-foreground">{label}</h3>
    <p className="text-base">{value || 'Not found'}</p>
  </div>
);

const InfoList = ({ label, items }: { label:string; items: string[] }) => (
    <div>
        <h3 className="text-sm font-semibold text-muted-foreground">{label}</h3>
        {items && items.length > 0 ? (
            <div className="flex flex-wrap gap-2 mt-1">
                {items.map((item, index) => (
                    <Badge key={index} variant="secondary">{item}</Badge>
                ))}
            </div>
        ) : (
            <p className="text-base">Not found</p>
        )}
    </div>
);

const AnalysisSection = ({ icon, title, items }: { icon: React.ReactNode, title: string, items: string[] }) => (
    <div>
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">{icon} {title}</h3>
      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );

    