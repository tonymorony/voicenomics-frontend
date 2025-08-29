"use client";
import type {
  AgentPolicy,
  DATToken,
  MintVoiceInput,
  RoyaltyEvent,
  SynthesizeInput,
  VoiceAsset,
} from "./types";

// In-browser mock persistence via localStorage with module-level fallback for SSR
const memoryStore: Record<string, string> = {};

function getStore(): Storage | typeof memoryStore {
  if (typeof window === "undefined") return memoryStore;
  return window.localStorage;
}

function readJson<T>(key: string, fallback: T): T {
  const store = getStore();
  try {
    const hasWeb = typeof (store as Storage).getItem === "function";
    const raw = hasWeb
      ? (store as Storage).getItem(key)
      : (store as Record<string, string>)[key];
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  const store = getStore();
  const raw = JSON.stringify(value);
  const hasWeb = typeof (store as Storage).setItem === "function";
  if (hasWeb) (store as Storage).setItem(key, raw);
  else (store as Record<string, string>)[key] = raw;
}

const VOICES_KEY = "vn_mock_voices";
const DATS_KEY = "vn_mock_dats";
const ROYALTIES_KEY = "vn_mock_royalties";

function now(): number {
  return Date.now();
}

function genId(): string {
  const g = globalThis as unknown as { crypto?: { randomUUID?: () => string } };
  if (typeof g.crypto?.randomUUID === "function") return g.crypto.randomUUID();
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export async function listVoices(): Promise<VoiceAsset[]> {
  return readJson<VoiceAsset[]>(VOICES_KEY, []);
}

export async function getVoiceById(id: string): Promise<VoiceAsset | undefined> {
  return (await listVoices()).find((v) => v.id === id);
}

export async function listDATs(): Promise<DATToken[]> {
  return readJson<DATToken[]>(DATS_KEY, []);
}

export async function listRoyalties(): Promise<RoyaltyEvent[]> {
  const items = readJson<RoyaltyEvent[]>(ROYALTIES_KEY, []);
  // Most recent first
  return items.sort((a, b) => b.timestamp - a.timestamp);
}

export async function mintVoiceAndDAT(input: MintVoiceInput): Promise<{
  voice: VoiceAsset;
  dat: DATToken;
}> {
  // Create object URL for quick preview (mock). Works only in browser.
  let objectUrl: string | undefined;
  if (typeof window !== "undefined" && input.file) {
    try {
      objectUrl = URL.createObjectURL(input.file);
    } catch {
      // ignore
    }
  }

  const datId = genId();
  const voiceId = genId();
  const policy: AgentPolicy = { ...input.policy };

  const sampleFileName = (typeof File !== "undefined" && input.file instanceof File) ? input.file.name : undefined;

  const voice: VoiceAsset = {
    id: voiceId,
    ownerAddress: input.ownerAddress,
    createdAt: now(),
    royaltyBps: input.royaltyBps,
    datId,
    usagePolicy: policy,
    metadata: { title: input.title, description: input.description },
    sampleFileName,
    sampleObjectUrl: objectUrl,
  };

  const dat: DATToken = {
    id: datId,
    ownerAddress: input.ownerAddress,
    voiceId,
    royaltyBps: input.royaltyBps,
    usagePolicy: policy,
    metadata: {
      voiceTitle: input.title,
      usageTerms: policy.terms,
    },
  };

  const voices = await listVoices();
  const dats = await listDATs();
  voices.push(voice);
  dats.push(dat);
  writeJson(VOICES_KEY, voices);
  writeJson(DATS_KEY, dats);

  return { voice, dat };
}

export async function synthesizeWithPolicy(
  args: SynthesizeInput
): Promise<{ royalty: RoyaltyEvent }> {
  const voices = await listVoices();
  const dats = await listDATs();
  const voice = voices.find((v) => v.id === args.voiceId);
  if (!voice) throw new Error("Voice not found");
  const dat = dats.find((d) => d.id === voice.datId);
  if (!dat) throw new Error("DAT not found for voice");

  // Agent policy checks (mock)
  if (args.commercialUse && !voice.usagePolicy.commercialUseAllowed) {
    throw new Error("Commercial use is not allowed by the DAT policy");
  }

  if (voice.usagePolicy.usageCountThisMonth >= voice.usagePolicy.monthlyQuota) {
    throw new Error("Monthly quota exceeded for this voice");
  }

  // Update quota usage
  voice.usagePolicy.usageCountThisMonth += 1;
  dat.usagePolicy.usageCountThisMonth = voice.usagePolicy.usageCountThisMonth;
  writeJson(VOICES_KEY, voices);
  writeJson(DATS_KEY, dats);

  // Compute mock royalty: 0.2 token per 100 chars, split by royaltyBps
  const base = Math.max(1, Math.ceil(args.text.length / 100)) * 0.2;
  const share = (voice.royaltyBps / 10_000) * base;

  const event: RoyaltyEvent = {
    id: genId(),
    voiceId: voice.id,
    datId: dat.id,
    requesterAddress: args.requesterAddress,
    amountTokens: Number(share.toFixed(4)),
    timestamp: now(),
    usageTextLength: args.text.length,
  };

  const royalties = await listRoyalties();
  royalties.unshift(event);
  writeJson(ROYALTIES_KEY, royalties);

  return { royalty: event };
}

export function resetMocks(): void {
  writeJson(VOICES_KEY, []);
  writeJson(DATS_KEY, []);
  writeJson(ROYALTIES_KEY, []);
}


