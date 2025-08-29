import { API_BASE } from "./config";

export interface ApiVoice {
  id: string;
  owner_address: string;
  created_at_ms: number;
  royalty_bps: number;
  dat_id: string;
  usage_policy: {
    commercial_use_allowed: boolean;
    monthly_quota: number;
    usage_count_this_month: number;
    terms: string;
  };
  metadata: { title: string; description?: string };
  sample_file_name?: string;
  sample_file_path?: string;
  sample_url?: string | null;
}

export interface ApiMintResponse { voice: ApiVoice; dat: { id: string } }

export interface ApiRoyalty {
  id: string;
  voice_id: string;
  dat_id: string;
  requester_address: string;
  amount_tokens: number;
  timestamp_ms: number;
  usage_text_length: number;
}

export async function apiListVoices(): Promise<ApiVoice[]> {
  const res = await fetch(`${API_BASE}/voices`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to list voices: ${res.status}`);
  return res.json();
}

export async function apiMintVoice(form: {
  owner_address: string;
  title: string;
  description?: string;
  royalty_bps: number;
  commercial_use_allowed: boolean;
  monthly_quota: number;
  terms: string;
  sample?: File | null;
}): Promise<ApiMintResponse> {
  const fd = new FormData();
  fd.set("owner_address", form.owner_address);
  fd.set("title", form.title);
  if (form.description) fd.set("description", form.description);
  fd.set("royalty_bps", String(form.royalty_bps));
  fd.set("commercial_use_allowed", String(form.commercial_use_allowed));
  fd.set("monthly_quota", String(form.monthly_quota));
  fd.set("terms", form.terms);
  if (form.sample) fd.set("sample", form.sample);
  const res = await fetch(`${API_BASE}/voices/mint`, { method: "POST", body: fd });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiSynthesize(payload: {
  voice_id: string;
  requester_address: string;
  text: string;
  commercial_use: boolean;
}): Promise<{ royalty: ApiRoyalty; audio_url?: string | null }> {
  const res = await fetch(`${API_BASE}/synthesize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiListRoyalties(): Promise<ApiRoyalty[]> {
  const res = await fetch(`${API_BASE}/royalties`, { cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiCreateChallenge(text: string): Promise<{ challenge: { id: string; text: string } }>{
  const res = await fetch(`${API_BASE}/agent/challenges`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiValidateChallenge(id: string, transcript: string, threshold: number): Promise<{ score: number; passed: boolean }>{
  const res = await fetch(`${API_BASE}/agent/challenges/${id}/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript, threshold }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}


