import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { CandidateSidebar } from '@/components/layout/CandidateSidebar';

export default function CandidateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        <CandidateSidebar />
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
