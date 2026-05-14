import type { PublicClient, WalletClient } from "viem";
import { skillRegistryAbi } from "./abis/skill-registry.js";

export interface SkillRegistryContext {
  address: `0x${string}`;
  client: PublicClient;
}

export interface SkillRegistryWriteContext {
  address: `0x${string}`;
  wallet: WalletClient;
  account: `0x${string}`;
}

export interface SkillRegistryEntry {
  publisher: `0x${string}`;
  id: string;
  version: string;
  publishedAt: bigint;
}

/**
 * Look up a registered skill manifest by its content hash.
 */
export async function readManifest(
  ctx: SkillRegistryContext,
  manifestHash: `0x${string}`,
): Promise<SkillRegistryEntry> {
  const [publisher, id, version, publishedAt] = (await ctx.client.readContract({
    address: ctx.address,
    abi: skillRegistryAbi,
    functionName: "manifest",
    args: [manifestHash],
  })) as readonly [`0x${string}`, string, string, bigint];

  return { publisher, id, version, publishedAt };
}

/**
 * Resolve the latest published manifest hash for a skill id.
 * Returns the zero hash if the id has never been published.
 */
export async function readLatest(ctx: SkillRegistryContext, id: string): Promise<`0x${string}`> {
  return (await ctx.client.readContract({
    address: ctx.address,
    abi: skillRegistryAbi,
    functionName: "latest",
    args: [id],
  })) as `0x${string}`;
}

/**
 * Publish a skill manifest to the registry. Caller is responsible for having
 * pinned the manifest content off-chain (IPFS or equivalent) prior to calling.
 */
export async function publishSkill(
  ctx: SkillRegistryWriteContext,
  params: {
    manifestHash: `0x${string}`;
    id: string;
    version: string;
    category: string;
    riskClass: number;
  },
): Promise<`0x${string}`> {
  return ctx.wallet.writeContract({
    address: ctx.address,
    abi: skillRegistryAbi,
    functionName: "publish",
    args: [params.manifestHash, params.id, params.version, params.category, params.riskClass],
    account: ctx.account,
    chain: null,
  });
}
