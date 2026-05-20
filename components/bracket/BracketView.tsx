import type { BracketNode } from "@/lib/tournament/types";
import { BracketMatch } from "./BracketMatch";

interface Round {
  label: string;
  nodes: BracketNode[];
}

function collectRounds(root: BracketNode): Round[] {
  const map = new Map<string, BracketNode[]>();

  function walk(node: BracketNode) {
    if (!map.has(node.round)) map.set(node.round, []);
    map.get(node.round)!.push(node);
    if (node.children[0]) walk(node.children[0]);
    if (node.children[1]) walk(node.children[1]);
  }
  walk(root);

  // Sort: more matches = earlier round (further from the final)
  return Array.from(map.entries())
    .map(([label, nodes]) => ({ label, nodes }))
    .sort((a, b) => b.nodes.length - a.nodes.length);
}

export function BracketView({
  node,
  teamNames,
}: {
  node: BracketNode;
  teamNames: Record<string, string>;
}) {
  const rounds = collectRounds(node);

  if (rounds.length === 0) return null;

  return (
    <div className="overflow-x-auto pb-6">
      <div className="inline-flex gap-6 min-w-max items-start">
        {rounds.map((round, ri) => {
          // Vertical gap increases as we approach the final
          const gapClass = ri === 0 ? "gap-3" : ri === 1 ? "gap-10" : ri === 2 ? "gap-24" : "gap-48";
          const topPad = ri === 0 ? "pt-0" : ri === 1 ? "pt-8" : ri === 2 ? "pt-16" : "pt-28";

          return (
            <div key={round.label} className="flex flex-col items-center">
              {/* Round label */}
              <div className="mb-3 text-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-3 py-1 bg-gray-50 rounded-full border border-gray-200">
                  {round.label}
                </span>
              </div>
              {/* Matches */}
              <div className={`flex flex-col ${gapClass} ${topPad}`}>
                {round.nodes.map((match, mi) => (
                  <BracketMatch
                    key={match.matchId ?? `${round.label}-${mi}`}
                    homeTeamName={
                      match.homeTeamId ? (teamNames[match.homeTeamId] ?? "TBD") : null
                    }
                    awayTeamName={
                      match.awayTeamId ? (teamNames[match.awayTeamId] ?? "TBD") : null
                    }
                    homeScore={match.homeScore}
                    awayScore={match.awayScore}
                    winnerId={match.winnerId}
                    homeTeamId={match.homeTeamId}
                    isScheduled={match.homeScore === null}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
