import type { Account, Address, Hex, TypedData, TypedDataDomain, WalletClient } from "viem";
import { verifyTypedData } from "viem";

/**
 * EIP-712 typed data definitions for Cleon authorization messages.
 *
 * Two message types are defined at the protocol level:
 *   - SkillAuth      → user authorization for a single skill invocation
 *   - SessionGrant   → user delegation to a session key for long-lived agent
 *                      operation under a bounded scope
 *
 * Both are signed by the user's primary account (ECDSA-secp256k1 or, for smart
 * accounts, ERC-1271). See whitepaper Sections 10.2 and 10.3.
 */

export const CLEON_DOMAIN_NAME = "Cleon";
export const CLEON_DOMAIN_VERSION = "1";

/**
 * Build the EIP-712 domain separator. Pass the chain id and the address of
 * the contract that will verify the signature (typically the runtime's
 * authorization verifier or the skill endpoint itself).
 */
export function cleonDomain(chainId: number, verifyingContract: Address): TypedDataDomain {
  return {
    name: CLEON_DOMAIN_NAME,
    version: CLEON_DOMAIN_VERSION,
    chainId,
    verifyingContract,
  };
}

// ---------- SkillAuth ----------

export const SkillAuthTypes = {
  SkillAuth: [
    { name: "composition", type: "bytes32" },
    { name: "skill_hash", type: "bytes32" },
    { name: "input_hash", type: "bytes32" },
    { name: "scope", type: "string" },
    { name: "expires_at", type: "uint64" },
    { name: "nonce", type: "uint256" },
  ],
} as const satisfies TypedData;

export interface SkillAuthMessage {
  composition: Hex;
  skill_hash: Hex;
  input_hash: Hex;
  scope: string;
  expires_at: bigint;
  nonce: bigint;
}

export interface BuildSkillAuthParams {
  chainId: number;
  verifyingContract: Address;
  message: SkillAuthMessage;
}

export function buildSkillAuth(params: BuildSkillAuthParams) {
  return {
    domain: cleonDomain(params.chainId, params.verifyingContract),
    types: SkillAuthTypes,
    primaryType: "SkillAuth" as const,
    message: params.message,
  };
}

export async function signSkillAuth(
  wallet: WalletClient,
  account: Account | Address,
  params: BuildSkillAuthParams,
): Promise<Hex> {
  const typed = buildSkillAuth(params);
  return wallet.signTypedData({
    account,
    domain: typed.domain,
    types: typed.types,
    primaryType: typed.primaryType,
    message: typed.message,
  });
}

export async function verifySkillAuth(
  signer: Address,
  signature: Hex,
  params: BuildSkillAuthParams,
): Promise<boolean> {
  const typed = buildSkillAuth(params);
  return verifyTypedData({
    address: signer,
    domain: typed.domain,
    types: typed.types,
    primaryType: typed.primaryType,
    message: typed.message,
    signature,
  });
}

// ---------- SessionGrant ----------

export const SessionGrantTypes = {
  SessionGrant: [
    { name: "session_key", type: "address" },
    { name: "composition", type: "bytes32" },
    { name: "scopes", type: "string" },
    { name: "expires_at", type: "uint64" },
    { name: "nonce", type: "uint256" },
  ],
} as const satisfies TypedData;

export interface SessionGrantMessage {
  session_key: Address;
  composition: Hex;
  /**
   * Comma-separated list of permission scopes granted to the session key.
   * Scopes are the same enumeration as in skill manifests (see
   * `PERMISSION_SCOPES` in `constants.ts`).
   */
  scopes: string;
  expires_at: bigint;
  nonce: bigint;
}

export interface BuildSessionGrantParams {
  chainId: number;
  verifyingContract: Address;
  message: SessionGrantMessage;
}

export function buildSessionGrant(params: BuildSessionGrantParams) {
  return {
    domain: cleonDomain(params.chainId, params.verifyingContract),
    types: SessionGrantTypes,
    primaryType: "SessionGrant" as const,
    message: params.message,
  };
}

export async function signSessionGrant(
  wallet: WalletClient,
  account: Account | Address,
  params: BuildSessionGrantParams,
): Promise<Hex> {
  const typed = buildSessionGrant(params);
  return wallet.signTypedData({
    account,
    domain: typed.domain,
    types: typed.types,
    primaryType: typed.primaryType,
    message: typed.message,
  });
}

export async function verifySessionGrant(
  signer: Address,
  signature: Hex,
  params: BuildSessionGrantParams,
): Promise<boolean> {
  const typed = buildSessionGrant(params);
  return verifyTypedData({
    address: signer,
    domain: typed.domain,
    types: typed.types,
    primaryType: typed.primaryType,
    message: typed.message,
    signature,
  });
}
