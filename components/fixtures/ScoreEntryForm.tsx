"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { enterScore } from "@/actions/match";

interface ScoreEntryFormProps {
  matchId: string;
  homeTeamName: string;
  awayTeamName: string;
  currentHomeScore: number | null;
  currentAwayScore: number | null;
  status: string;
}

export function ScoreEntryForm({
  matchId,
  homeTeamName,
  awayTeamName,
  currentHomeScore,
  currentAwayScore,
  status,
}: ScoreEntryFormProps) {
  const [home, setHome] = useState(currentHomeScore?.toString() ?? "");
  const [away, setAway] = useState(currentAwayScore?.toString() ?? "");
  const [saving, setSaving] = useState(false);

  const isPlayed = status === "PLAYED";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const h = parseInt(home);
    const a = parseInt(away);
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) return;
    setSaving(true);
    try {
      await enterScore(matchId, h, a);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-700 min-w-28 text-right">{homeTeamName}</span>
      <input
        type="number"
        min="0"
        max="99"
        value={home}
        onChange={(e) => setHome(e.target.value)}
        aria-label={`${homeTeamName} score`}
        className="w-14 rounded-lg border border-gray-300 px-2 py-1.5 text-center text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <span className="text-gray-400 font-medium">–</span>
      <input
        type="number"
        min="0"
        max="99"
        value={away}
        onChange={(e) => setAway(e.target.value)}
        aria-label={`${awayTeamName} score`}
        className="w-14 rounded-lg border border-gray-300 px-2 py-1.5 text-center text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <span className="text-sm font-medium text-gray-700 min-w-28">{awayTeamName}</span>
      <Button type="submit" variant={isPlayed ? "secondary" : "primary"} size="sm" disabled={saving}>
        {saving ? "Saving…" : isPlayed ? "Update" : "Save"}
      </Button>
    </form>
  );
}
