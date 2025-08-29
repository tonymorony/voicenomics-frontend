"use client";

import { useEffect, useMemo, useState } from "react";
import { useWallet, formatAddress } from "@/lib/wallet";
import { apiListRoyalties, apiListVoices, type ApiRoyalty, type ApiVoice } from "@/lib/api";

export default function ProfilePage() {
  const { address, isMetaMaskAvailable, connect, addLazaiNetwork } = useWallet();
  const [voices, setVoices] = useState<ApiVoice[]>([]);
  const [events, setEvents] = useState<ApiRoyalty[]>([]);

  useEffect(() => {
    if (!address) return;
    Promise.all([apiListVoices(), apiListRoyalties()]).then(([v, e]) => {
      setVoices(v);
      setEvents(e);
    });
  }, [address]);

  const myVoices = useMemo(() => voices.filter((v) => v.owner_address.toLowerCase() === address?.toLowerCase()), [voices, address]);
  const myEvents = useMemo(() => events.filter((e) => myVoices.some((v) => v.id === e.voice_id)), [events, myVoices]);

  if (!isMetaMaskAvailable) {
    return <div className="text-sm text-black/60">MetaMask is not available. Please install it to access your profile.</div>;
  }

  if (!address) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-black/60">Connect your wallet to see your voices, DATs and royalties.</p>
        <div className="flex gap-2">
          <button className="rounded-md bg-black text-white text-sm px-3 py-1.5" onClick={connect}>Connect MetaMask</button>
          <button className="rounded-md border text-sm px-3 py-1.5" onClick={addLazaiNetwork}>Add LazAI Network</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Profile</h1>
          <div className="text-sm text-black/60">Address: {formatAddress(address)}</div>
        </div>
        <button className="rounded-md border text-sm px-3 py-1.5" onClick={addLazaiNetwork}>Add LazAI Network</button>
      </div>

      <section>
        <h2 className="text-lg font-medium mb-2">My Voices / DATs</h2>
        {myVoices.length === 0 && <div className="text-sm text-black/60">No voices yet. Mint one on the Upload page.</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myVoices.map((v) => (
            <div key={v.id} className="rounded-xl border p-4">
              <div className="font-medium">{v.metadata.title}</div>
              <div className="text-xs text-black/60">DAT: {v.dat_id}</div>
              <div className="text-xs text-black/60">Royalty: {(v.royalty_bps / 100).toFixed(2)}%</div>
              <div className="text-xs text-black/60">Quota: {v.usage_policy.usage_count_this_month}/{v.usage_policy.monthly_quota}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-2">Royalties</h2>
        {myEvents.length === 0 && <div className="text-sm text-black/60">No royalties yet.</div>}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">Time</th>
                <th className="py-2 pr-4">Voice</th>
                <th className="py-2 pr-4">DAT</th>
                <th className="py-2 pr-4">Requester</th>
                <th className="py-2 pr-4">Tokens</th>
              </tr>
            </thead>
            <tbody>
              {myEvents.map((ev) => (
                <tr key={ev.id} className="border-b">
                  <td className="py-2 pr-4 whitespace-nowrap">{new Date(ev.timestamp_ms).toLocaleString()}</td>
                  <td className="py-2 pr-4">{voices.find((v) => v.id === ev.voice_id)?.metadata.title ?? ev.voice_id}</td>
                  <td className="py-2 pr-4 text-black/60">{ev.dat_id}</td>
                  <td className="py-2 pr-4 text-black/60">{ev.requester_address}</td>
                  <td className="py-2 pr-4 font-medium">{ev.amount_tokens}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}


