"use client";

import { useEffect, useMemo, useState } from "react";
import { apiListRoyalties, apiListVoices, type ApiRoyalty, type ApiVoice } from "@/lib/api";

function formatTs(ts: number) {
  return new Date(ts).toLocaleString();
}

export default function ActivityPage() {
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
        <h1 className="text-2xl font-semibold">Activity & Royalties (mock)</h1>
        <p className="text-sm text-black/60 mt-1">Every synthesis accrues royalties according to the DAT royalty share.</p>
      </div>

      <div className="overflow-x-auto app-card p-4">
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
            {events.map((ev) => {
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
            {events.length === 0 && (
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


