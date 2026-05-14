/**
 * ABI for the SkillRegistry contract.
 * See whitepaper Section 9.2.
 */
export const skillRegistryAbi = [
  {
    type: "function",
    name: "publish",
    stateMutability: "nonpayable",
    inputs: [
      { name: "manifestHash", type: "bytes32" },
      { name: "id", type: "string" },
      { name: "version", type: "string" },
      { name: "category", type: "string" },
      { name: "riskClass", type: "uint8" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "manifest",
    stateMutability: "view",
    inputs: [{ name: "manifestHash", type: "bytes32" }],
    outputs: [
      { name: "publisher", type: "address" },
      { name: "id", type: "string" },
      { name: "version", type: "string" },
      { name: "publishedAt", type: "uint64" },
    ],
  },
  {
    type: "function",
    name: "latest",
    stateMutability: "view",
    inputs: [{ name: "id", type: "string" }],
    outputs: [{ name: "", type: "bytes32" }],
  },
  {
    type: "event",
    name: "SkillPublished",
    inputs: [
      { name: "manifestHash", type: "bytes32", indexed: true },
      { name: "publisher", type: "address", indexed: true },
      { name: "id", type: "string", indexed: false },
      { name: "version", type: "string", indexed: false },
      { name: "category", type: "string", indexed: false },
      { name: "riskClass", type: "uint8", indexed: false },
    ],
    anonymous: false,
  },
] as const;
