import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricCardsProps {
  pendingApproval: number;
  approved: number;
  applied: number;
  avgScore: number;
}

export function MetricCards({
  pendingApproval,
  approved,
  applied,
  avgScore,
}: MetricCardsProps) {
  const items = [
    {
      label: "Pending approval",
      value: pendingApproval,
      hint: "Waiting for review",
    },
    { label: "Approved", value: approved, hint: "Ready to apply" },
    { label: "Submitted", value: applied, hint: "Confirmed in ledger" },
    { label: "Avg score", value: avgScore, hint: "Across pipeline" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="border-border/70 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {item.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-3xl font-semibold tracking-tight text-foreground">
              {item.value}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{item.hint}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
