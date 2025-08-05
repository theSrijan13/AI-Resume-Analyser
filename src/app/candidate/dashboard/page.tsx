import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CandidateDashboard() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">
        Candidate Dashboard
      </h2>
      <Card>
        <CardHeader>
          <CardTitle>Welcome!</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is the candidate dashboard. Features for candidates will be shown here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
