import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  Users,
  ClipboardCheck,
  Award,
  BarChart,
} from 'lucide-react';
import Link from 'next/link';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Bar, BarChart as RechartsBarChart, XAxis, YAxis } from 'recharts';

const chartData = [
  { stage: 'Applied', count: 120 },
  { stage: 'Screened', count: 80 },
  { stage: 'Interview', count: 45 },
  { stage: 'Offered', count: 15 },
  { stage: 'Hired', count: 8 },
];

const chartConfig = {
  count: {
    label: 'Candidates',
    color: 'hsl(var(--primary))',
  },
};

const recentCandidates = [
  { id: 1, name: 'Elena Rodriguez', position: 'Senior Frontend Developer', stage: 'Interview' },
  { id: 2, name: 'Benjamin Carter', position: 'UX/UI Designer', stage: 'Screened' },
  { id: 3, name: 'Olivia Martinez', position: 'Product Manager', stage: 'Offered' },
  { id: 4, name: 'Liam Goldberg', position: 'Data Scientist', stage: 'Applied' },
  { id: 5, name: 'Sophia Chen', position: 'DevOps Engineer', stage: 'Hired' },
];

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="underglow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Candidates
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card className="underglow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+80</div>
            <p className="text-xs text-muted-foreground">
              +18.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="underglow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hired</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12</div>
            <p className="text-xs text-muted-foreground">+5 since last month</p>
          </CardContent>
        </Card>
        <Card className="underglow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Roles</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">+2 since last week</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 underglow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Recruitment Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <RechartsBarChart data={chartData} accessibilityLayer>
                <XAxis
                  dataKey="stage"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="count" fill="var(--color-count)" radius={8} />
              </RechartsBarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="col-span-4 lg:col-span-3 underglow">
          <CardHeader>
            <CardTitle>Recent Candidates</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Stage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentCandidates.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell>
                      <div className="font-medium">{candidate.name}</div>
                      <div className="hidden text-sm text-muted-foreground md:inline">
                        {candidate.position}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="border-primary/50 bg-primary/10 text-primary"
                      >
                        {candidate.stage}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
