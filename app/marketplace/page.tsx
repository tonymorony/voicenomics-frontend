"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiListVoices, type ApiVoice } from "@/lib/api";
import { MARKETPLACE_REFRESH_MS } from "@/lib/config";

function short(addr: string) {
  if (!addr) return "";
  return addr.length > 10 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;
}

export default function MarketplacePage() {
  const [voices, setVoices] = useState<ApiVoice[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try { const data = await apiListVoices(); if (!cancelled) setVoices(data); } catch {}
    };
    load();
    const id = setInterval(load, MARKETPLACE_REFRESH_MS);
    const onUpdated = () => { load(); };
    window.addEventListener("voices-updated", onUpdated);
    return () => { cancelled = true; clearInterval(id); window.removeEventListener("voices-updated", onUpdated); };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Voice Marketplace (mock)</h1>
        <p className="text-sm text-black/60 mt-1">Discover tokenized voices and use them for TTS via DAT policies.</p>
      </div>

      {voices.length === 0 && (
        <div className="text-sm text-black/60">No voices yet. Mint one on the Upload page.</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {voices.map((v) => (
          <div key={v.id} className="app-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-medium">{v.metadata.title}</div>
                <div className="text-xs text-black/50">Owner: {short(v.owner_address)}</div>
              </div>
              {(v.sample_url || v.sample_file_path) && (
                <audio controls src={`${process.env.NEXT_PUBLIC_API_BASE || ""}/voices/${v.id}/preview`} className="h-9" />
              )}
            </div>

            {v.metadata.description && (
              <div className="text-sm text-black/70 mt-2 line-clamp-3">{v.metadata.description}</div>
            )}

            <div className="mt-3 text-xs text-black/60">
              <div>Royalty: {(v.royalty_bps / 100).toFixed(2)}%</div>
              <div>Quota: {v.usage_policy.usage_count_this_month}/{v.usage_policy.monthly_quota} this month</div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <Link href={`/synthesize?voiceId=${v.id}`} className="app-btn-primary text-sm">Use</Link>
              {v.tx_hash ? (
                <a className="text-xs text-blue-600 hover:underline" href={`https://testnet-explorer.lazai.network/tx/${v.tx_hash}`} target="_blank" rel="noreferrer">View tx</a>
              ) : (
                <span className="text-xs text-black/50">DAT {v.dat_id}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


