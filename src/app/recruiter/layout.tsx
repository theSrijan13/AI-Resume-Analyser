import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { RecruiterSidebar } from '@/components/layout/RecruiterSidebar';

export default function RecruiterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        <RecruiterSidebar />
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
