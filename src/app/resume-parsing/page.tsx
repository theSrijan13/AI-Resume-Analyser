'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileText, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { ParseResumeOutput } from '@/ai/flows/resume-parsing';
import { Badge } from '@/components/ui/badge';
import { handleParseResume } from './actions';

const formSchema = z.object({
  resume: z.instanceof(File, { message: 'Please upload a resume.' }),
});

export default function ResumeParsingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ParseResumeOutput | null>(null);
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
      const parsedData = await handleParseResume(formData);
      setResult(parsedData);
      toast({
        title: 'Success',
        description: 'Resume parsed successfully.',
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
          <FileText /> Resume Parsing
        </h2>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <Card className="underglow">
          <CardHeader>
            <CardTitle>Upload Resume</CardTitle>
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
                      Parsing...
                    </>
                  ) : (
                    'Parse Resume'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="underglow">
          <CardHeader>
            <CardTitle>Parsed Information</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            {!isLoading && !result && (
              <div className="text-center text-muted-foreground">
                Upload a resume to see the parsed results.
              </div>
            )}
            {result && (
              <div className="space-y-4">
                <InfoItem label="Name" value={result.name} />
                <InfoItem label="Email" value={result.email} />
                <InfoItem label="Phone" value={result.phone} />
                <InfoList label="Skills" items={result.skills} />
                <InfoList label="Experience" items={result.experience} />
                <InfoList label="Education" items={result.education} />
                <InfoList label="Certifications" items={result.certifications} />
              </div>
            )}
          </CardContent>
        </Card>
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
