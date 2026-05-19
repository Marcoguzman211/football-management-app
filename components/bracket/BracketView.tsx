import type { BracketNode } from "@/lib/tournament/types";
import { BracketMatch } from "./BracketMatch";

interface BracketViewProps {
  node: BracketNode;
  teamNames: Record<string, string>;
  depth?: number;
}

function collectRounds(node: BracketNode): BracketNode[][] {
  const rounds: BracketNode[][] = [];
  function walk(n: BracketNode, depth: number) {
    if (!rounds[depth]) rounds[depth] = [];
    rounds[depth].push(n);
    if (n.children[0]) walk(n.children[0], depth + 1);
    if (n.children[1]) walk(n.children[1], depth + 1);
  }
  walk(node, 0);
  return rounds.reverse(); // earliest round first
}

export function BracketView({ node, teamNames }: BracketViewProps) {
  const rounds = collectRounds(node);

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-8 items-start min-w-max">
        {rounds.map((round, ri) => (
          <div key={ri} className="flex flex-col gap-6 justify-around" style={{ marginTop: `${ri * 2}rem` }}>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-2 text-center">
              {round[0]?.round ?? ""}
            </p>
            {round.map((match, mi) => (
              <div key={mi} className="flex items-center">
                <BracketMatch
                  homeTeamName={match.homeTeamId ? (teamNames[match.homeTeamId] ?? "TBD") : null}
                  awayTeamName={match.awayTeamId ? (teamNames[match.awayTeamId] ?? "TBD") : null}
                  homeScore={match.homeScore}
                  awayScore={match.awayScore}
                  winnerId={match.winnerId}
                  homeTeamId={match.homeTeamId}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
