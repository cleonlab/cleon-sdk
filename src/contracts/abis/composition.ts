/**
 * ABI for the Composition ERC-721 contract.
 * See whitepaper Section 9.3.
 */
export const compositionAbi = [
  {
    type: "function",
    name: "compose",
    stateMutability: "nonpayable",
    inputs: [
      { name: "personaId", type: "uint256" },
      { name: "skillHashes", type: "bytes32[]" },
      { name: "runtimeParamsHash", type: "bytes32" },
    ],
    outputs: [{ name: "compositionId", type: "uint256" }],
  },
  {
    type: "function",
    name: "compositionOf",
    stateMutability: "view",
    inputs: [{ name: "compositionId", type: "uint256" }],
    outputs: [
      { name: "personaId", type: "uint256" },
      { name: "skillHashes", type: "bytes32[]" },
      { name: "runtimeParamsHash", type: "bytes32" },
    ],
  },
  {
    type: "event",
    name: "CompositionCreated",
    inputs: [
      { name: "compositionId", type: "uint256", indexed: true },
      { name: "personaId", type: "uint256", indexed: true },
      { name: "creator", type: "address", indexed: true },
      { name: "runtimeParamsHash", type: "bytes32", indexed: false },
    ],
    anonymous: false,
  },
] as const;
