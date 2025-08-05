'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  FileText,
  Loader2,
  Sparkles,
  CheckCircle,
  XCircle,
  Lightbulb,
  Target,
  FileUp,
  RotateCcw,
  Link,
  Briefcase,
  GraduationCap,
  ListChecks,
  Book,
  Eye,
  ChevronDown,
  CalendarDays,
  Palette,
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
import { Bar, BarChart, Cell, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { handleAnalyzeResume } from './actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const formSchema = z.object({
  resume: z
    .instanceof(File, { message: 'Please upload a resume.' })
    .refine((file) => file.size > 0, 'Please upload a resume.')
    .refine((file) => file.size < 5 * 1024 * 1024, 'File size must be less than 5MB.'),
  jobDescription: z.string().optional(),
  jobUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
});

const chartConfig = {
    count: {
        label: 'Count',
        color: 'hsl(var(--chart-1))',
    },
     strength: {
      label: "Strength",
      color: "hsl(var(--chart-1))",
    },
};

const parseDate = (dateStr: string): Date | null => {
    if (!dateStr || dateStr.trim().toLowerCase() === 'present') return new Date();
    
    // Attempt to parse various formats
    const cleanedDateStr = dateStr.trim().replace(/(\w{3})\s/, '$1 1, ');
    
    // Handles "Month YYYY", "Mon YYYY", "YYYY"
    let date = new Date(cleanedDateStr);
    if (!isNaN(date.getTime())) return date;

    // Handles "YYYY" alone if previous failed
    if (/^\d{4}$/.test(cleanedDateStr)) {
        date = new Date(`${cleanedDateStr}-01-01`);
        if (!isNaN(date.getTime())) return date;
    }
    
    return null;
}

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
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error Analyzing Resume',
        description:
          error instanceof Error ? error.message : 'An unexpected error occurred. The AI service may be busy. Please try again in a moment.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const skillCategoryData = [
    { category: 'Languages', count: result?.extractedData.skills.filter(s => ['javascript', 'python', 'java', 'c++', 'typescript', 'go', 'ruby', 'php'].includes(s.toLowerCase())).length || 0 },
    { category: 'Frameworks', count: result?.extractedData.skills.filter(s => ['react', 'next.js', 'vue', 'angular', 'django', 'flask', 'spring', 'express'].includes(s.toLowerCase())).length || 0 },
    { category: 'Databases', count: result?.extractedData.skills.filter(s => ['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'firebase'].includes(s.toLowerCase())).length || 0 },
    { category: 'Tools', count: result?.extractedData.skills.filter(s => ['git', 'docker', 'kubernetes', 'jenkins', 'aws', 'gcp', 'azure'].includes(s.toLowerCase())).length || 0 }
  ].filter(d => d.count > 0);
  
  const timelineData = result ? [
    ...result.extractedData.experience.map(exp => {
        const [start, end] = (exp.dates || " ").split(' - ');
        return { name: exp.role, company: exp.company, start: parseDate(start), end: parseDate(end), type: 'Experience' };
    }),
    ...result.extractedData.education.map(edu => {
        const [start, end] = (edu.dates || " ").split(' - ');
        return { name: edu.degree, company: edu.institution, start: parseDate(start), end: parseDate(end), type: 'Education' };
    }),
     ...result.extractedData.projects.map(proj => {
        const [start, end] = (proj.dates || " ").split(' - ');
        return { name: proj.name, company: "Project", start: parseDate(start), end: parseDate(end || start), type: 'Project' };
    }),
  ]
  .filter(item => item.start && item.end)
  .sort((a,b) => a.start!.getTime() - b.start!.getTime())
  .map(item => ({...item, range: [item.start!.getTime(), item.end!.getTime()]}))
  : [];

  const topSkills = result 
    ? (() => {
        const allSkills = result.extractedData.skills || [];
        const matchingKeywords = result.jobMatchAnalysis.isApplicable 
          ? (result.jobMatchAnalysis.matchingKeywords || []) 
          : [];
        
        const keywordSet = new Set(matchingKeywords.map(k => k.toLowerCase()));
        
        const prioritizedSkills = allSkills
          .filter(skill => keywordSet.has(skill.toLowerCase()))
          .slice(0, 7);

        const remainingSkills = allSkills
          .filter(skill => !keywordSet.has(skill.toLowerCase()));

        const combinedSkills = [...prioritizedSkills, ...remainingSkills].slice(0, 7);
        
        return combinedSkills.map((skill) => ({ subject: skill, strength: 100, fullMark: 100 }));
      })() 
    : [];


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
                    render={({ field: { onChange } }) => (
                      <FormItem>
                        <FormLabel>Resume File</FormLabel>
                        <FormControl>
                            <label className="relative flex items-center justify-center h-10 w-full rounded-md border border-dashed border-accent bg-accent/20 px-3 py-2 text-sm ring-offset-background cursor-pointer hover:bg-accent/30 hover:text-accent-foreground">
                                <FileUp className="h-5 w-5 text-accent-foreground mr-2" />
                                <span className="text-accent-foreground font-medium">{form.getValues('resume')?.name || 'Choose a file'}</span>
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
                             <CardDescription>This score reflects your resume's clarity, impact, and completeness.</CardDescription>
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
                             <CardTitle>Comprehensive AI Analysis</CardTitle>
                             <CardDescription>In-depth feedback from our AI career coach.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Alert>
                                <Lightbulb className="h-4 w-4" />
                                <AlertTitle>First Impressions</AlertTitle>
                                <AlertDescription>{result.generalAnalysis.firstImpressions}</AlertDescription>
                            </Alert>
                            <Tabs defaultValue="strengths" className="w-full">
                               <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="strengths">Strengths</TabsTrigger>
                                    <TabsTrigger value="improvements">Improvements</TabsTrigger>
                                    <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                                </TabsList>
                                <TabsContent value="strengths" className="mt-4">
                                     <AnalysisSection icon={<CheckCircle className="text-green-500" />} items={result.generalAnalysis.strengths} />
                                </TabsContent>
                                <TabsContent value="improvements" className="mt-4">
                                    <AnalysisSection icon={<XCircle className="text-destructive" />} items={result.generalAnalysis.areasForImprovement} />
                                </TabsContent>
                                <TabsContent value="suggestions" className="mt-4">
                                    <AnalysisSection icon={<Lightbulb className="text-yellow-500" />} items={result.generalAnalysis.suggestions} />
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>

                    <Card className="underglow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Palette /> Visual & Formatting Analysis</CardTitle>
                            <CardDescription>How your resume looks to a recruiter.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <VisualInfoItem label="Formatting Consistency" value={result.visualAnalysis.formattingConsistency} />
                             <VisualInfoItem label="Layout Clarity" value={result.visualAnalysis.layoutClarity} />
                             <VisualInfoItem label="Font Choice" value={result.visualAnalysis.fontChoice} />
                             <AnalysisSection icon={<Eye className="text-primary" />} items={result.visualAnalysis.visualIssues} />
                        </CardContent>
                    </Card>

                     <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
                      <AccordionItem value="item-1">
                        <AccordionTrigger>
                           <h3 className="text-lg font-semibold flex items-center gap-2">
                            <FileText /> Extracted Resume Details
                          </h3>
                        </AccordionTrigger>
                        <AccordionContent>
                           <Card className="border-0 shadow-none">
                                <CardContent className="space-y-6 pt-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <InfoItem label="Name" value={result.extractedData.name} />
                                        <InfoItem label="Email" value={result.extractedData.email} />
                                        <InfoItem label="Phone" value={result.extractedData.phone} />
                                    </div>
                                    <Separator/>
                                    <Alert>
                                        <AlertTitle>Summary</AlertTitle>
                                        <AlertDescription>{result.extractedData.summary || 'No summary found.'}</AlertDescription>
                                    </Alert>
                                    
                                    <SectionWrapper icon={<Briefcase />} title="Experience">
                                        {result.extractedData.experience.map((exp, i) => (
                                            <DetailCard key={i} title={exp.role} subtitle={exp.company} dates={exp.dates} items={exp.description} />
                                        ))}
                                    </SectionWrapper>
                                    <Separator />
                                     <SectionWrapper icon={<GraduationCap />} title="Education">
                                        {result.extractedData.education.map((edu, i) => (
                                            <DetailCard key={i} title={edu.degree} subtitle={edu.institution} dates={edu.dates} items={edu.details || []} />
                                        ))}
                                    </SectionWrapper>
                                    <Separator />
                                    <SectionWrapper icon={<Book />} title="Projects">
                                        {result.extractedData.projects.map((proj, i) => (
                                            <DetailCard key={i} title={proj.name} subtitle={proj.technologies.join(', ')} dates={proj.dates} items={proj.description} />
                                        ))}
                                    </SectionWrapper>
                                    <Separator />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InfoList label="Skills" items={result.extractedData.skills} icon={<Sparkles />} />
                                        <InfoList label="Certifications" items={result.extractedData.certifications} icon={<ListChecks />} />
                                    </div>
                                    <Separator />
                                    <InfoList label="Links" items={result.extractedData.links} icon={<Link />} />
                                </CardContent>
                            </Card>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>


                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                       {timelineData.length > 0 && (
                            <Card className="underglow col-span-1 lg:col-span-2">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><CalendarDays /> Career Timeline</CardTitle>
                                    <CardDescription>A visual timeline of your experience, education, and projects.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={timelineData.length * 60 + 40}>
                                        <BarChart
                                          layout="vertical"
                                          data={timelineData}
                                          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis type="number" scale="time" domain={['dataMin', 'dataMax']} tickFormatter={(d) => new Date(d).getFullYear().toString()}/>
                                            <YAxis dataKey="name" type="category" width={100} style={{ fontSize: '12px' }}/>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="range" barSize={20} radius={4}>
                                                {timelineData.map((entry, index) => {
                                                    const colors = {
                                                        'Experience': 'hsl(var(--chart-1))',
                                                        'Education': 'hsl(var(--chart-2))',
                                                        'Project': 'hsl(var(--chart-3))',
                                                    }
                                                    return <Cell key={`cell-${index}`} fill={colors[entry.type as keyof typeof colors] || '#8884d8'} />;
                                                })}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        )}
                         {topSkills.length > 0 && (
                          <Card className="underglow">
                            <CardHeader>
                              <CardTitle>Top Skills</CardTitle>
                              <CardDescription>
                                A radar chart of your top skills.
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <ChartContainer
                                config={chartConfig}
                                className="mx-auto aspect-square h-full w-full"
                              >
                                <RadarChart data={topSkills}>
                                  <ChartTooltip
                                    content={<ChartTooltipContent hideLabel />}
                                  />
                                  <PolarGrid />
                                  <PolarAngleAxis dataKey="subject" />
                                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                  <Radar
                                    name="strength"
                                    dataKey="strength"
                                    stroke="var(--color-strength)"
                                    fill="var(--color-strength)"
                                    fillOpacity={0.6}
                                  />
                                </RadarChart>
                              </ChartContainer>
                            </CardContent>
                          </Card>
                        )}
                        {skillCategoryData.length > 0 && (
                            <Card className="underglow">
                                <CardHeader>
                                    <CardTitle>Skill Categories</CardTitle>
                                    <CardDescription>Breakdown of your skills by category.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer config={chartConfig} className="h-[300px] w-full">
                                        <BarChart data={skillCategoryData} accessibilityLayer layout="vertical" margin={{ left: 20 }}>
                                            <YAxis dataKey="category" type="category" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} width={80} />
                                            <XAxis type="number" hide />
                                            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                            <Bar dataKey="count" fill="var(--color-count)" radius={8} />
                                        </BarChart>
                                    </ChartContainer>
                                </CardContent>
                            </Card>
                        )}
                    </div>
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

const VisualInfoItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <h4 className="font-semibold text-foreground">{label}</h4>
    <p className="text-muted-foreground text-sm">{value}</p>
  </div>
);


const InfoList = ({ label, items, icon }: { label:string; items: string[]; icon?: React.ReactNode }) => (
    <div>
        <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">{icon} {label}</h3>
        </div>
        {items && items.length > 0 ? (
            <div className="flex flex-wrap gap-2 mt-1">
                {items.map((item, index) => (
                     <a href={item.startsWith('http') ? item : undefined} target="_blank" rel="noopener noreferrer" key={index} className="break-all">
                        <Badge variant="secondary" className={item.startsWith('http') ? 'hover:bg-primary/20 cursor-pointer' : ''}>{item}</Badge>
                    </a>
                ))}
            </div>
        ) : (
            <p className="text-sm text-muted-foreground">Not found</p>
        )}
    </div>
);

const AnalysisSection = ({ icon, items }: { icon: React.ReactNode, items: string[] }) => (
    <div>
      <ul className="list-disc list-inside space-y-2 text-muted-foreground text-sm">
        {items && items.length > 0 ? (
            items.map((item, index) => (
              <li key={index} className="pl-2 flex items-start gap-2">
                <span className="mt-1">{icon}</span>
                <span>{item}</span>
              </li>
            ))
        ) : (
            <li className="pl-2">None found.</li>
        )}
      </ul>
    </div>
  );

const SectionWrapper = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
    <div>
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">{icon} {title}</h3>
        <div className="space-y-4">{children}</div>
    </div>
)

const DetailCard = ({ title, subtitle, dates, items }: { title: string; subtitle: string; dates?: string; items: string[] }) => (
    <Card className="bg-muted/30">
        <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <CardDescription>{subtitle}</CardDescription>
                </div>
                <Badge variant="outline" className="text-xs shrink-0">{dates}</Badge>
            </div>
        </CardHeader>
        <CardContent>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                {items.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
        </CardContent>
    </Card>
)

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const startDate = data.range[0] ? new Date(data.range[0]).toLocaleDateString() : 'N/A';
    const endDate = data.range[1] ? new Date(data.range[1]).toLocaleDateString() : 'N/A';
    return (
      <div className="bg-background border p-2 rounded-md shadow-lg text-sm">
        <p className="font-bold">{data.name}</p>
        <p className="text-muted-foreground">{data.company}</p>
        <p className="text-xs">{`${startDate} - ${endDate}`}</p>
      </div>
    );
  }

  return null;
};
