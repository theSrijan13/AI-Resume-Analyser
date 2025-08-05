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
  Users,
  FileText,
  ScanSearch,
  Bot,
  Sparkles,
  Github
} from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';

const menuItems = [
  {
    href: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/candidates',
    label: 'Candidates',
    icon: Users,
  },
  {
    href: '/resume-parsing',
    label: 'Resume Parsing',
    icon: FileText,
  },
  {
    href: '/shortlisting',
    label: 'AI Shortlisting',
    icon: ScanSearch,
  },
  {
    href: '/voice-interviewer',
    label: 'Voice AI',
    icon: Bot,
  },
  {
    href: '/skill-gap-analysis',
    label: 'Skill Gap Analysis',
    icon: Sparkles,
  },
];

export function AppSidebar() {
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
