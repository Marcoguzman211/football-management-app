import type { TeamStanding } from "@/lib/tournament/types";
import { StandingsTable } from "./StandingsTable";

interface GroupStandingsPanelProps {
  groupName: string;
  standings: TeamStanding[];
  teamsAdvancing?: number;
}

export function GroupStandingsPanel({
  groupName,
  standings,
  teamsAdvancing,
}: GroupStandingsPanelProps) {
  return (
    <div>
      <h3 className="mb-3 text-base font-semibold text-gray-900">Group {groupName}</h3>
      <StandingsTable
        standings={standings}
        highlightTop={teamsAdvancing}
        caption={`Group ${groupName} standings`}
      />
    </div>
  );
}
