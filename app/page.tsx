import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="pt-6">
        <h1 className="text-3xl font-semibold">Voicenomics</h1>
        <p className="mt-2 text-black/70 max-w-2xl">
          Voice → DAT → Voice-as-a-Service. Tokenize voice samples as Data Anchoring Tokens (DAT) to encode ownership,
          usage rights, and royalty share. Run TTS via an agent that enforces policy (commercial use, quotas) and logs royalties.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="app-card p-4">
          <div className="font-medium">1) Upload & Mint DAT</div>
          <p className="text-sm text-black/60">Create a DAT with usage terms and royalty share.</p>
          <Link href="/upload" className="inline-block mt-3 app-btn-primary text-sm">Start</Link>
        </div>
        <div className="app-card p-4">
          <div className="font-medium">2) Use a Voice</div>
          <p className="text-sm text-black/60">Pick a tokenized voice and synthesize text.</p>
          <Link href="/synthesize" className="inline-block mt-3 app-btn-primary text-sm">Synthesize</Link>
        </div>
        <div className="app-card p-4">
          <div className="font-medium">3) Track Royalties</div>
          <p className="text-sm text-black/60">See accrued token amounts per usage.</p>
          <Link href="/activity" className="inline-block mt-3 app-btn-primary text-sm">View</Link>
        </div>
      </div>

      <div className="text-xs text-black/50">
      Inspired by <a className="underline" href="https://lazai.network/blog/lazai-x-duckchain-x-aws-hack-ai-unchained-bounty" target="_blank" rel="noreferrer">LazAI AI Unchained </a> Bounty track. Learn about DATs in the <a className="underline" href="https://docs.lazai.network/quick-start-docs/data-contribution-workflow/introduction" target="_blank" rel="noreferrer">LazAI docs</a>.
      </div>
    </div>
  );
}
