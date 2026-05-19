import { Badge } from "@/components/ui/Badge";

export function TournamentStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: "success" | "info" | "default" }> = {
    ACTIVE: { label: "Active", variant: "success" },
    DRAFT: { label: "Draft", variant: "default" },
    FINISHED: { label: "Finished", variant: "info" },
  };
  const { label, variant } = map[status] ?? { label: status, variant: "default" };
  return <Badge variant={variant}>{label}</Badge>;
}
