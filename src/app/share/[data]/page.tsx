import type { Metadata } from "next";
import Link from "next/link";
import { decodeShareData, formatSetScore } from "@/lib/shareCard";
import { formatDate } from "@/lib/dates";

function titleFor(data: NonNullable<ReturnType<typeof decodeShareData>>): string {
  if (data.w === 1) return `${data.p1} def. ${data.p2}`;
  if (data.w === 2) return `${data.p2} def. ${data.p1}`;
  return `${data.p1} vs ${data.p2}`;
}

export async function generateMetadata({ params }: { params: Promise<{ data: string }> }): Promise<Metadata> {
  const { data: encoded } = await params;
  const data = decodeShareData(encoded);
  if (!data) return { title: "MatchPoint" };

  const title = `${titleFor(data)} — MatchPoint`;
  const description = `${data.tn} · ${data.r} · ${formatSetScore(data.s1, data.s2)}`;

  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function SharePage({ params }: { params: Promise<{ data: string }> }) {
  const { data: encoded } = await params;
  const data = decodeShareData(encoded);

  if (!data) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center px-4 text-center gap-3">
        <h1 className="text-2xl">Link not recognized</h1>
        <p className="text-sm text-[var(--text-soft)]">This share link looks corrupted or incomplete.</p>
        <Link href="/" className="text-sm font-semibold mt-2" style={{ color: "var(--accent)" }}>
          Go to MatchPoint →
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-4 py-10">
      <div className="card w-full max-w-md p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className={`tour-badge ${data.t}`}>{data.t.toUpperCase()}</span>
          <span className="text-xs text-[var(--text-soft)]">{data.r}</span>
        </div>

        <h1 className="headline text-lg mb-1">{data.tn}</h1>
        <p className="text-xs text-[var(--text-soft)] mb-5">{formatDate(data.d)}</p>

        <PlayerRow name={data.p1} country={data.c1} sets={data.s1} winner={data.w === 1} />
        <PlayerRow name={data.p2} country={data.c2} sets={data.s2} winner={data.w === 2} />

        <Link
          href="/"
          className="inline-block text-sm font-semibold mt-6"
          style={{ color: "var(--accent)" }}
        >
          🎾 See more on MatchPoint →
        </Link>
      </div>
    </main>
  );
}

function PlayerRow({
  name,
  country,
  sets,
  winner,
}: {
  name: string;
  country: string | null;
  sets: number[];
  winner: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid var(--border)" }}>
      <span className={`text-sm text-left ${winner ? "font-semibold" : "text-[var(--text-soft)]"}`}>
        {name}
        {country ? <span className="text-xs text-[var(--text-soft)] ml-1">({country})</span> : null}
      </span>
      <span className={`flex gap-2 ${winner ? "font-semibold" : "text-[var(--text-soft)]"}`}>
        {sets.map((s, i) => (
          <span key={i} className="w-4 text-center text-sm">
            {s}
          </span>
        ))}
      </span>
    </div>
  );
}
