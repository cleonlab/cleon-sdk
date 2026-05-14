import type { PublicClient, WalletClient } from "viem";
import { personaAbi } from "./abis/persona.js";

/**
 * Typed helpers for the Persona ERC-721 contract.
 *
 * These helpers wrap viem's `readContract` / `writeContract` with the Cleon
 * extension methods. Standard ERC-721 operations (ownerOf, transferFrom, etc.)
 * should be performed via viem's built-in `erc721Abi`.
 */

export interface PersonaContractContext {
  address: `0x${string}`;
  client: PublicClient;
}

export interface PersonaWriteContext {
  address: `0x${string}`;
  wallet: WalletClient;
  account: `0x${string}`;
}

/**
 * Read the on-chain persona hash anchor for a given token ID.
 */
export async function readPersonaHash(
  ctx: PersonaContractContext,
  tokenId: bigint,
): Promise<`0x${string}`> {
  const result = await ctx.client.readContract({
    address: ctx.address,
    abi: personaAbi,
    functionName: "personaHash",
    args: [tokenId],
  });
  return result as `0x${string}`;
}

/**
 * Read the schema version a persona was minted under.
 */
export async function readSchemaVersion(
  ctx: PersonaContractContext,
  tokenId: bigint,
): Promise<string> {
  const result = await ctx.client.readContract({
    address: ctx.address,
    abi: personaAbi,
    functionName: "schemaVersion",
    args: [tokenId],
  });
  return result as string;
}

/**
 * Read the creator address (the original minter) for a persona.
 */
export async function readCreator(
  ctx: PersonaContractContext,
  tokenId: bigint,
): Promise<`0x${string}`> {
  const result = await ctx.client.readContract({
    address: ctx.address,
    abi: personaAbi,
    functionName: "creator",
    args: [tokenId],
  });
  return result as `0x${string}`;
}

/**
 * Mint a new persona. Returns the transaction hash; the caller is responsible
 * for awaiting the receipt and extracting the `PersonaMinted` event to obtain
 * the assigned token ID.
 */
export async function mintPersona(
  ctx: PersonaWriteContext,
  params: {
    to: `0x${string}`;
    personaHash: `0x${string}`;
    schemaVersion: string;
    royaltyBps: number;
  },
): Promise<`0x${string}`> {
  return ctx.wallet.writeContract({
    address: ctx.address,
    abi: personaAbi,
    functionName: "mint",
    args: [params.to, params.personaHash, params.schemaVersion, params.royaltyBps],
    account: ctx.account,
    chain: null,
  });
}
