"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { apiCreateChallenge, apiListVoices, apiSynthesize, apiValidateChallenge, type ApiVoice } from "@/lib/api";
import { useWallet } from "@/lib/wallet";
import { useSearchParams } from "next/navigation";

function short(addr: string) {
  if (!addr) return "";
  return addr.length > 10 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;
}

function SynthesizeInner() {
  const { address } = useWallet();
  const search = useSearchParams();
  const initialVoiceId = search.get("voiceId") ?? undefined;
  const [voices, setVoices] = useState<ApiVoice[]>([]);
  const [voiceId, setVoiceId] = useState<string | undefined>(initialVoiceId);
  const [requester, setRequester] = useState("");
  const [text, setText] = useState("Hello from Voicenomics – LazAI DAT demo!");
  const [commercial, setCommercial] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ tokens: number; datId: string; audioUrl?: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiListVoices().then((v) => {
      setVoices(v);
      if (!initialVoiceId && v[0]) setVoiceId(v[0].id);
    });
  }, [initialVoiceId]);

  useEffect(() => {
    if (address && !requester) setRequester(address);
  }, [address, requester]);

  const selectedVoice = useMemo(() => voices.find((v) => v.id === voiceId), [voices, voiceId]);

  // Reading challenge removed

  const onRun = async () => {
    setError(null);
    setResult(null);
    if (!voiceId || !requester || !text) {
      setError("Please choose a voice, enter requester address and text.");
      return;
    }
    setLoading(true);
    try {
      const { royalty, audio_url } = await apiSynthesize({ voice_id: voiceId, requester_address: requester, text, commercial_use: commercial });
      setResult({ tokens: royalty.amount_tokens, datId: royalty.dat_id, audioUrl: audio_url });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Synthesis failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Synthesize speech</h1>
        <p className="text-sm text-black/60 mt-1">Agent enforces DAT policies: commercial usage and monthly quotas.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4 app-card p-4">
          <label className="block">
            <span className="text-sm">Select voice</span>
            <select className="mt-1 w-full app-input" value={voiceId} onChange={(e) => setVoiceId(e.target.value)}>
              {voices.map((v) => (
                <option key={v.id} value={v.id}>{v.metadata.title} — {short(v.owner_address)}</option>
              ))}
            </select>
          </label>

          {(selectedVoice?.sample_url || selectedVoice?.sample_file_path) && (
            <div>
              <div className="text-xs text-black/60">Sample:</div>
              {selectedVoice?.sample_url ? (
                <audio controls src={`${process.env.NEXT_PUBLIC_API_BASE || ""}/voices/${selectedVoice.id}/preview`} />
              ) : (
                <audio controls src={selectedVoice?.sample_file_path} />
              )}
            </div>
          )}

          {selectedVoice && (
            <div className="text-xs text-black/60">
              <div>Royalty: {(selectedVoice.royalty_bps / 100).toFixed(2)}%</div>
              <div>Quota: {selectedVoice.usage_policy.usage_count_this_month}/{selectedVoice.usage_policy.monthly_quota}</div>
              <div>Terms: {selectedVoice.usage_policy.terms}</div>
            </div>
          )}
        </div>

        <div className="space-y-4 app-card p-4">
          <label className="block">
            <span className="text-sm">Requester address</span>
            <input className="mt-1 w-full app-input" placeholder="0x..." value={requester} onChange={(e) => setRequester(e.target.value)} />
          </label>

          <label className="block">
            <span className="text-sm">Text to synthesize</span>
            <textarea className="mt-1 w-full app-input" rows={6} value={text} onChange={(e) => setText(e.target.value)} />
          </label>

          <div className="flex items-center gap-2">
            <input id="commercial" type="checkbox" checked={commercial} onChange={(e) => setCommercial(e.target.checked)} />
            <label htmlFor="commercial">Commercial usage</label>
          </div>

          <button onClick={onRun} disabled={loading} className="mt-2 app-btn-primary text-sm">
            {loading ? "Synthesizing…" : "Run"}
          </button>

          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
          {result && (
            <div className="text-sm mt-3 space-y-2">
              <div>Usage permitted by DAT. Royalty accrued:</div>
              <div className="text-black/60">+{result.tokens} LazAI tokens → DAT {result.datId}</div>
              {result.audioUrl && (
                <div className="flex items-center gap-3">
                  <audio controls src={result.audioUrl} />
                  <a className="app-btn-outline text-xs" href={result.audioUrl} download>
                    Download
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SynthesizePage() {
  return (
    <Suspense fallback={<div className="text-sm text-black/60">Loading…</div>}>
      <SynthesizeInner />
    </Suspense>
  );
}


