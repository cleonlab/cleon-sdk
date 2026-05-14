/**
 * ABI for the Persona ERC-721 contract.
 * See whitepaper Section 9.1. Includes only the Cleon extensions; standard
 * ERC-721 methods (transferFrom, approve, etc.) are exposed by viem's own
 * `erc721Abi` and are not duplicated here.
 */
export const personaAbi = [
  {
    type: "function",
    name: "mint",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "personaHash", type: "bytes32" },
      { name: "schemaVersion", type: "string" },
      { name: "royaltyBps", type: "uint16" },
    ],
    outputs: [{ name: "tokenId", type: "uint256" }],
  },
  {
    type: "function",
    name: "personaHash",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "bytes32" }],
  },
  {
    type: "function",
    name: "schemaVersion",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "string" }],
  },
  {
    type: "function",
    name: "creator",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
  },
  {
    type: "event",
    name: "PersonaMinted",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "personaHash", type: "bytes32", indexed: false },
      { name: "schemaVersion", type: "string", indexed: false },
    ],
    anonymous: false,
  },
] as const;
