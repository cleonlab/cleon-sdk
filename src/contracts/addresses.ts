import { CHAIN_IDS, type ChainId } from "../constants.js";

/**
 * Canonical contract addresses per supported chain.
 *
 * Addresses are placeholders until the protocol contracts are deployed.
 * Consumers MUST override these via the `addresses` option of each contract
 * helper until the production deployments are finalized.
 */
export interface ContractAddresses {
  persona: `0x${string}`;
  skillRegistry: `0x${string}`;
  composition: `0x${string}`;
  attestationRegistry: `0x${string}`;
}

const PLACEHOLDER: `0x${string}` = "0x0000000000000000000000000000000000000000";

export const DEFAULT_ADDRESSES: Record<ChainId, ContractAddresses> = {
  [CHAIN_IDS.base]: {
    persona: PLACEHOLDER,
    skillRegistry: PLACEHOLDER,
    composition: PLACEHOLDER,
    attestationRegistry: PLACEHOLDER,
  },
  [CHAIN_IDS.baseSepolia]: {
    persona: PLACEHOLDER,
    skillRegistry: PLACEHOLDER,
    composition: PLACEHOLDER,
    attestationRegistry: PLACEHOLDER,
  },
};

export function getAddresses(chainId: ChainId): ContractAddresses {
  return DEFAULT_ADDRESSES[chainId];
}
