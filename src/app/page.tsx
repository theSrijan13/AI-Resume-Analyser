'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  MoveRight,
  FileText,
  ScanSearch,
  Bot,
  Sparkles,
  Users,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SplashCursor } from '@/components/ui/splash-cursor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function LandingPage() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ['Recruiting', 'Upskilling', 'Onboarding', 'Hiring', 'Screening'],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setTitleNumber((prev) => (prev + 1) % titles.length);
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  const features = [
    {
      icon: <FileText className="w-8 h-8 text-primary" />,
      title: 'Resume Parsing',
      description: 'Automatically extract key information from any resume.',
      link: '/resume-parsing',
    },
    {
      icon: <ScanSearch className="w-8 h-8 text-primary" />,
      title: 'AI Shortlisting',
      description: 'Find the best candidates for the job with AI-powered screening.',
      link: '/shortlisting',
    },
    {
      icon: <Bot className="w-8 h-8 text-primary" />,
      title: 'Voice AI Interviewer',
      description:
        'Conduct preliminary interviews with our conversational AI.',
      link: '/voice-interviewer',
    },
    {
      icon: <Sparkles className="w-8 h-8 text-primary" />,
      title: 'Skill Gap Analysis',
      description:
        'Identify skill gaps and get personalized training recommendations.',
      link: '/skill-gap-analysis',
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: 'Candidate Profiles',
      description: 'Get a unified view of every candidate in your pipeline.',
      link: '/candidates',
    },
    {
      icon: <Award className="w-8 h-8 text-primary" />,
      title: 'Recruiter Dashboard',
      description: 'Track your entire recruitment pipeline from one place.',
      link: '/recruiter/dashboard',
    },
  ];

  return (
    <div className="w-full bg-background relative">
      <SplashCursor />
      <div className="container mx-auto relative z-10 px-4">
        <header className="flex justify-between items-center py-4">
          <h1 className="text-2xl font-bold text-gradient bg-gradient-to-r from-blue-600 to-gray-900 dark:from-blue-400 dark:to-white">
            TalentFlow AI
          </h1>
          <ThemeToggle />
        </header>
        <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col text-center">
          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-7xl max-w-3xl tracking-tighter font-bold">
              The Future of{' '}
              <span className="relative inline-block h-[1.2em] overflow-hidden">
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute inset-0"
                    initial={{ y: '100%' }}
                    animate={
                      titleNumber === index
                        ? { y: 0, opacity: 1 }
                        : { y: '-100%', opacity: 0 }
                    }
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
              , <br />
              Powered by AI
            </h1>

            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl mx-auto">
              TalentFlow AI streamlines your hiring and development process.
              Choose your path to get started.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" asChild>
              <Link href="/recruiter/dashboard">
                I am a Recruiter <MoveRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/candidate/dashboard">
                I am a Candidate <MoveRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>

        <section className="py-20">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              A Complete Toolkit for Modern Talent Management
            </h2>
            <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
              From the first application to the final hire and beyond,
              TalentFlow AI provides all the tools you need.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="underglow bg-card/50 backdrop-blur-sm"
              >
                <CardHeader className="flex flex-row items-center gap-4">
                  {feature.icon}
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                  <Button variant="link" asChild className="p-0 mt-4">
                    <Link href={feature.link}>
                      Learn More <MoveRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}