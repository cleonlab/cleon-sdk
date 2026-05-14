import type { PublicClient, WalletClient } from "viem";
import { compositionAbi } from "./abis/composition.js";

export interface CompositionContractContext {
  address: `0x${string}`;
  client: PublicClient;
}

export interface CompositionWriteContext {
  address: `0x${string}`;
  wallet: WalletClient;
  account: `0x${string}`;
}

export interface OnChainComposition {
  personaId: bigint;
  skillHashes: readonly `0x${string}`[];
  runtimeParamsHash: `0x${string}`;
}

export async function readComposition(
  ctx: CompositionContractContext,
  compositionId: bigint,
): Promise<OnChainComposition> {
  const [personaId, skillHashes, runtimeParamsHash] = (await ctx.client.readContract({
    address: ctx.address,
    abi: compositionAbi,
    functionName: "compositionOf",
    args: [compositionId],
  })) as readonly [bigint, readonly `0x${string}`[], `0x${string}`];

  return { personaId, skillHashes, runtimeParamsHash };
}

export async function compose(
  ctx: CompositionWriteContext,
  params: {
    personaId: bigint;
    skillHashes: readonly `0x${string}`[];
    runtimeParamsHash: `0x${string}`;
  },
): Promise<`0x${string}`> {
  return ctx.wallet.writeContract({
    address: ctx.address,
    abi: compositionAbi,
    functionName: "compose",
    args: [params.personaId, params.skillHashes, params.runtimeParamsHash],
    account: ctx.account,
    chain: null,
  });
}
