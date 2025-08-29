export type Address = string;

export interface AgentPolicy {
  commercialUseAllowed: boolean;
  monthlyQuota: number; // number of synth requests allowed per calendar month
  usageCountThisMonth: number; // mock counter used by the agent
  terms: string; // free-form human-readable policy
}

export interface VoiceMetadata {
  title: string;
  description?: string;
}

export interface DATMetadata {
  voiceTitle: string;
  usageTerms: string;
}

export interface VoiceAsset {
  id: string;
  ownerAddress: Address;
  createdAt: number;
  royaltyBps: number; // 1% = 100 bps
  datId: string;
  usagePolicy: AgentPolicy;
  metadata: VoiceMetadata;
  sampleFileName?: string;
  sampleObjectUrl?: string; // browser object URL for quick preview (mock)
}

export interface DATToken {
  id: string;
  ownerAddress: Address;
  voiceId: string;
  royaltyBps: number;
  usagePolicy: AgentPolicy;
  metadata: DATMetadata;
}

export interface RoyaltyEvent {
  id: string;
  voiceId: string;
  datId: string;
  requesterAddress: Address;
  amountTokens: number; // mock LazAI token amount
  timestamp: number;
  usageTextLength: number;
}

export interface MintVoiceInput {
  ownerAddress: Address;
  file: File | Blob;
  title: string;
  description?: string;
  royaltyBps: number;
  policy: AgentPolicy;
}

export interface SynthesizeInput {
  voiceId: string;
  requesterAddress: Address;
  text: string;
  commercialUse: boolean;
}


