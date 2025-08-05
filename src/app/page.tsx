'use client';
import { useEffect, useMemo, useState } from 'react';
import { MoveRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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

  return (
    <div className="w-full bg-background">
      <div className="container mx-auto">
        <header className="flex justify-between items-center py-4">
          <h1 className="text-2xl font-bold text-primary">TalentFlow AI</h1>
        </header>
        <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col text-center">
          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-7xl max-w-3xl tracking-tighter font-bold">
              The Future of{' '}
              <span className="relative inline-block h-[1.2em]">
                {titles.map((title, index) => (
                  <span
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      titleNumber === index ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    {title}
                  </span>
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
      </div>
    </div>
  );
}
