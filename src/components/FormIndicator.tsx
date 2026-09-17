import type { FormResult } from "@/lib/form";

export default function FormIndicator({ form, size = "sm" }: { form?: FormResult[]; size?: "sm" | "md" }) {
  if (!form || form.length === 0) return null;
  const dot = size === "md" ? "w-5 h-5 text-[10px]" : "w-3.5 h-3.5 text-[8px]";

  return (
    <span className="inline-flex items-center gap-0.5" title={`Last ${form.length}: ${form.join(", ")}`}>
      {form.map((r, i) => (
        <span
          key={i}
          className={`${dot} rounded-full grid place-items-center font-bold`}
          style={{
            background: r === "W" ? "rgba(204,255,51,0.18)" : "rgba(255,59,92,0.15)",
            color: r === "W" ? "var(--accent)" : "var(--live)",
          }}
        >
          {r}
        </span>
      ))}
    </span>
  );
}
