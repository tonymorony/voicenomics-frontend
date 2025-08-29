"use client";

import { useEffect, useMemo, useState } from "react";
import { apiListRoyalties, apiListVoices, type ApiRoyalty, type ApiVoice } from "@/lib/api";
import { useWallet } from "@/lib/wallet";

function formatTs(ts: number) {
  return new Date(ts).toLocaleString();
}

export default function ActivityPage() {
  const { address } = useWallet();
  const [events, setEvents] = useState<ApiRoyalty[]>([]);
  const [voices, setVoices] = useState<ApiVoice[]>([]);

  useEffect(() => {
    Promise.all([apiListRoyalties(), apiListVoices()]).then(([e, v]) => {
      setEvents(e);
      setVoices(v);
    });
  }, []);

  const voiceById = useMemo(() => Object.fromEntries(voices.map((v) => [v.id, v])), [voices]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Activity & Royalties</h1>
        <p className="text-sm text-black/60 mt-1">Your DAT uploads and usage events.</p>
      </div>

      <div className="app-card p-4">
        <div className="font-medium mb-3">Uploaded DATs</div>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-4">Time</th>
              <th className="py-2 pr-4">Title</th>
              <th className="py-2 pr-4">DAT</th>
              <th className="py-2 pr-4">Tx</th>
            </tr>
          </thead>
          <tbody>
            {(address ? voices.filter(v => v.owner_address.toLowerCase() === address.toLowerCase()) : voices).map((v) => (
              <tr key={v.id} className="border-b">
                <td className="py-2 pr-4 whitespace-nowrap">{formatTs(v.created_at_ms)}</td>
                <td className="py-2 pr-4">{v.metadata.title}</td>
                <td className="py-2 pr-4 text-black/60">{v.dat_id}</td>
                <td className="py-2 pr-4">
                  {v.tx_hash ? (
                    <a className="text-blue-600 hover:underline" href={`https://testnet-explorer.lazai.network/tx/${v.tx_hash}`} target="_blank" rel="noreferrer">View tx</a>
                  ) : (
                    <span className="text-black/50">—</span>
                  )}
                </td>
              </tr>
            ))}
            {(address ? voices.filter(v => v.owner_address.toLowerCase() === address.toLowerCase()) : voices).length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-black/60">No uploads yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="overflow-x-auto app-card p-4">
        <div className="font-medium mb-3">Royalties</div>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-4">Time</th>
              <th className="py-2 pr-4">Voice</th>
              <th className="py-2 pr-4">DAT</th>
              <th className="py-2 pr-4">Requester</th>
              <th className="py-2 pr-4">Tokens</th>
              <th className="py-2 pr-4">Text chars</th>
            </tr>
          </thead>
          <tbody>
            {events
              .filter((ev) => !address || ev.requester_address.toLowerCase() === address.toLowerCase() || voices.find((v) => v.id === ev.voice_id)?.owner_address.toLowerCase() === address?.toLowerCase())
              .map((ev) => {
              const v = voiceById[ev.voice_id];
              return (
                <tr key={ev.id} className="border-b">
                  <td className="py-2 pr-4 whitespace-nowrap">{formatTs(ev.timestamp_ms)}</td>
                  <td className="py-2 pr-4">{v?.metadata.title ?? ev.voice_id}</td>
                  <td className="py-2 pr-4 text-black/60">{ev.dat_id}</td>
                  <td className="py-2 pr-4 text-black/60">{ev.requester_address}</td>
                  <td className="py-2 pr-4 font-medium">{ev.amount_tokens}</td>
                  <td className="py-2 pr-4">{ev.usage_text_length}</td>
                </tr>
              );
            })}
            {events.filter((ev) => !address || ev.requester_address.toLowerCase() === address.toLowerCase() || voices.find((v) => v.id === ev.voice_id)?.owner_address.toLowerCase() === address?.toLowerCase()).length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-black/60">No events yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


