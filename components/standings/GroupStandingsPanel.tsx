import type { TeamStanding } from "@/lib/tournament/types";
import { StandingsTable } from "./StandingsTable";

interface GroupStandingsPanelProps {
  groupName: string;
  standings: TeamStanding[];
  teamsAdvancing?: number;
  teamLinks?: Record<string, string>;
}

export function GroupStandingsPanel({
  groupName,
  standings,
  teamsAdvancing,
  teamLinks,
}: GroupStandingsPanelProps) {
  return (
    <div>
      <StandingsTable
        standings={standings}
        highlightTop={teamsAdvancing}
        caption={`Group ${groupName} standings`}
        teamLinks={teamLinks}
      />
      {teamsAdvancing !== undefined && standings.length > teamsAdvancing && (
        <p className="mt-2 text-xs text-gray-400">
          Top {teamsAdvancing} advance · highlighted in green
        </p>
      )}
    </div>
  );
}
