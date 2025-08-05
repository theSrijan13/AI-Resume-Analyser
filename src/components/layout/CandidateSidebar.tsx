'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  FileSearch,
  Briefcase,
  Bot,
  Github,
  Sparkles,
} from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';

const menuItems = [
  {
    href: '/candidate/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/candidate/resume-analyzer',
    label: 'Resume Analyzer',
    icon: Sparkles,
  },
  {
    href: '/candidate/jobs',
    label: 'Find Jobs',
    icon: FileSearch,
  },
  {
    href: '/candidate/applications',
    label: 'My Applications',
    icon: Briefcase,
  },
];

export function CandidateSidebar() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2">
          <Bot className="h-8 w-8 text-primary" />
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold tracking-tight font-headline">
              TalentFlow AI
            </h2>
            <span className="text-xs text-muted-foreground">Candidate</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <div className="flex items-center justify-between">
          <Link href="https://github.com/firebase/genkit/tree/main/studio/samples/recruiter" target='_blank' rel='noopener noreferrer'>
            <SidebarMenuButton size="sm" variant="ghost" tooltip="View on Github">
              <Github />
              <span>Github</span>
            </SidebarMenuButton>
          </Link>
          <ThemeToggle />
        </div>
      </SidebarFooter>
    </>
  );
}
