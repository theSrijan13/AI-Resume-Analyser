import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, Users } from 'lucide-react';
import Link from 'next/link';

// This would typically come from a database
const candidates = [
  {
    id: 1,
    name: 'Elena Rodriguez',
    email: 'elena.r@example.com',
    position: 'Senior Frontend Developer',
    status: 'Interview',
    score: 92,
  },
  {
    id: 2,
    name: 'Benjamin Carter',
    email: 'ben.c@example.com',
    position: 'UX/UI Designer',
    status: 'Screened',
    score: 88,
  },
  {
    id: 3,
    name: 'Olivia Martinez',
    email: 'olivia.m@example.com',
    position: 'Product Manager',
    status: 'Offered',
    score: 95,
  },
  {
    id: 4,
    name: 'Liam Goldberg',
    email: 'liam.g@example.com',
    position: 'Data Scientist',
    status: 'Applied',
    score: 75,
  },
  {
    id: 5,
    name: 'Sophia Chen',
    email: 'sophia.c@example.com',
    position: 'DevOps Engineer',
    status: 'Hired',
    score: 98,
  },
  {
    id: 6,
    name: 'Noah Patel',
    email: 'noah.p@example.com',
    position: 'Backend Developer',
    status: 'Rejected',
    score: 65,
  },
];

const getBadgeVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'hired':
    case 'offered':
      return 'default';
    case 'interview':
      return 'secondary';
    case 'rejected':
      return 'destructive';
    default:
      return 'outline';
  }
};

export default function CandidatesPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Users /> Candidates
        </h2>
        <div className="flex items-center space-x-2">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Candidate
          </Button>
        </div>
      </div>
      <Card className="underglow">
        <CardHeader>
          <CardTitle>Candidate Pipeline</CardTitle>
          <CardDescription>
            Manage and track all candidates in one place.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell text-right">
                  AI Score
                </TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell className="font-medium">
                    <Link href={`/candidates/${candidate.id}`} className="hover:underline">
                      {candidate.name}
                    </Link>
                    <div className="text-sm text-muted-foreground md:hidden">
                      {candidate.position}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {candidate.position}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(candidate.status)}>
                      {candidate.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-right font-mono">
                    {candidate.score}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Schedule Interview</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
