import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface TeamFormProps {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: { name?: string; logoUrl?: string | null };
  submitLabel?: string;
}

export function TeamForm({ action, defaultValues, submitLabel = "Save" }: TeamFormProps) {
  return (
    <form action={action} className="space-y-4">
      <Input
        label="Team name"
        name="name"
        defaultValue={defaultValues?.name}
        placeholder="FC Alpha"
        required
      />
      <Input
        label="Logo URL (optional)"
        name="logoUrl"
        type="url"
        defaultValue={defaultValues?.logoUrl ?? ""}
        placeholder="https://example.com/logo.png"
      />
      <div className="pt-2">
        <Button type="submit" size="lg">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
