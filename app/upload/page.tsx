"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { apiMintVoice } from "@/lib/api";
import dynamic from "next/dynamic";
const RecorderWidget = dynamic(() => import("@/app/components/RecorderWidget"), { ssr: false });

export default function UploadPage() {
  const [owner, setOwner] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [royaltyBps, setRoyaltyBps] = useState(1000); // 10%
  // Recording state
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const recordedBlobRef = useRef<Blob | null>(null);
  const [commercial, setCommercial] = useState(true);
  const [quota, setQuota] = useState(100);
  const [terms, setTerms] = useState("Non-exclusive TTS inference only. No retraining.");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ voiceId: string; datId: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const policy = useMemo(() => ({ commercial_use_allowed: commercial, monthly_quota: quota, terms }), [commercial, quota, terms]);

  const onSubmit = useCallback(async () => {
    setError(null);
    if (!owner || !title || !recordedBlobRef.current) {
      setError("Please provide owner address, title and record a voice sample.");
      return;
    }
    setLoading(true);
    try {
      const sampleFile = new File([recordedBlobRef.current], "recording.webm", { type: recordedBlobRef.current.type || "audio/webm" });
      const { voice, dat } = await apiMintVoice({
        owner_address: owner,
        title,
        description,
        royalty_bps: Number(royaltyBps),
        commercial_use_allowed: policy.commercial_use_allowed,
        monthly_quota: policy.monthly_quota,
        terms: policy.terms,
        sample: sampleFile,
      });
      setResult({ voiceId: voice.id, datId: dat.id });
      // Notify marketplace to refresh immediately
      try { window.dispatchEvent(new Event("voices-updated")); } catch {}
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to mint DAT";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [owner, title, description, royaltyBps, policy]);

  const onRecorded = useCallback((blob: Blob) => {
    recordedBlobRef.current = blob;
    const url = URL.createObjectURL(blob);
    setAudioUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return url; });
    setRecording(false);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Upload your voice & mint a DAT</h1>
        <p className="mt-2 text-sm text-black/60">
          Voice → DAT → Voice-as-a-Service. Your DAT encodes ownership, usage rights, and royalty share.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4 app-card p-4">
          <label className="block">
            <span className="text-sm">Owner address</span>
            <input className="mt-1 w-full app-input" placeholder="0x..." value={owner} onChange={(e) => setOwner(e.target.value)} />
          </label>

          <label className="block">
            <span className="text-sm">Title</span>
            <input className="mt-1 w-full app-input" placeholder="My Voice" value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>

          <label className="block">
            <span className="text-sm">Description</span>
            <textarea className="mt-1 w-full app-input" placeholder="Short description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>

          <label className="block">
            <span className="text-sm">Royalty (bps)</span>
            <input type="number" className="mt-1 w-full app-input" value={royaltyBps} onChange={(e) => setRoyaltyBps(Number(e.target.value))} />
          </label>

          <div className="space-y-2">
            <div className="text-sm">Record voice sample</div>
            <RecorderWidget onBlob={onRecorded} />
            {audioUrl && <audio controls src={audioUrl} className="h-9" />}
            <div className="text-xs text-black/60">Record 5–10 seconds for best results.</div>
          </div>
        </div>

        <div className="space-y-4 app-card p-4">
          <div className="flex items-center gap-2">
            <input id="commercial" type="checkbox" checked={commercial} onChange={(e) => setCommercial(e.target.checked)} />
            <label htmlFor="commercial">Allow commercial use</label>
          </div>
          <label className="block">
            <span className="text-sm">Monthly quota (requests)</span>
            <input type="number" className="mt-1 w-full app-input" value={quota} onChange={(e) => setQuota(Number(e.target.value))} />
          </label>
          <label className="block">
            <span className="text-sm">Usage terms</span>
            <textarea className="mt-1 w-full app-input" value={terms} onChange={(e) => setTerms(e.target.value)} />
          </label>

          <button onClick={onSubmit} disabled={loading} className="mt-2 app-btn-primary text-sm">
            {loading ? "Minting…" : "Create DAT"}
          </button>

          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
          {result && (
            <div className="text-sm mt-3">
              <div>DAT minted!</div>
              <div className="text-black/60">voiceId: {result.voiceId}</div>
              <div className="text-black/60">datId: {result.datId}</div>
            </div>
          )}
        </div>
      </div>

      <div className="text-xs text-black/50">
        DAT mint uses Alith SDK when PRIVATE_KEY and IPFS_JWT are set on backend. See docs for details.
      </div>
    </div>
  );
}


