"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

interface TournamentFormProps {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: {
    name?: string;
    season?: number;
    format?: string;
    settings?: Record<string, unknown>;
  };
  submitLabel?: string;
}

export function TournamentForm({
  action,
  defaultValues,
  submitLabel = "Create Tournament",
}: TournamentFormProps) {
  const [format, setFormat] = useState(defaultValues?.format ?? "LEAGUE");
  const s = defaultValues?.settings ?? {};

  return (
    <form action={action} className="space-y-5">
      <Input
        label="Tournament name"
        name="name"
        defaultValue={defaultValues?.name}
        placeholder="Premier League 2025"
        required
      />
      <Input
        label="Season (year)"
        name="season"
        type="number"
        defaultValue={defaultValues?.season ?? new Date().getFullYear()}
        min={2000}
        max={2100}
        required
      />
      <Select
        label="Format"
        name="format"
        value={format}
        onChange={(e) => setFormat(e.target.value)}
      >
        <option value="LEAGUE">League (round-robin)</option>
        <option value="KNOCKOUT">Knockout bracket</option>
        <option value="GROUP_KNOCKOUT">Group stage + Knockout</option>
      </Select>

      {format !== "KNOCKOUT" && (
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Points — Win"
            name="pointsWin"
            type="number"
            defaultValue={(s.pointsWin as number) ?? 3}
            min={0}
            max={10}
          />
          <Input
            label="Points — Draw"
            name="pointsDraw"
            type="number"
            defaultValue={(s.pointsDraw as number) ?? 1}
            min={0}
            max={10}
          />
          <Input
            label="Points — Loss"
            name="pointsLoss"
            type="number"
            defaultValue={(s.pointsLoss as number) ?? 0}
            min={0}
            max={10}
          />
        </div>
      )}

      {format !== "KNOCKOUT" && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="doubleLegged"
            name="doubleLegged"
            value="true"
            defaultChecked={(s.doubleLegged as boolean) ?? false}
            className="h-4 w-4 rounded border-gray-300 text-blue-600"
          />
          <label htmlFor="doubleLegged" className="text-sm text-gray-700">
            Double-legged (home & away)
          </label>
        </div>
      )}

      {format === "GROUP_KNOCKOUT" && (
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Number of groups"
            name="numberOfGroups"
            type="number"
            defaultValue={(s.numberOfGroups as number) ?? 2}
            min={2}
            max={8}
          />
          <Input
            label="Teams advancing per group"
            name="teamsAdvancingPerGroup"
            type="number"
            defaultValue={(s.teamsAdvancingPerGroup as number) ?? 2}
            min={1}
            max={4}
          />
        </div>
      )}

      <div className="pt-2">
        <Button type="submit" size="lg">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
