/**
 * ABI for the AttestationRegistry contract.
 * See whitepaper Section 9.4.
 */
export const attestationRegistryAbi = [
  {
    type: "function",
    name: "register",
    stateMutability: "nonpayable",
    inputs: [
      { name: "runtimeMeasurement", type: "bytes32" },
      { name: "measurementType", type: "string" },
      { name: "attestationRoot", type: "bytes" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "isRegistered",
    stateMutability: "view",
    inputs: [{ name: "runtimeMeasurement", type: "bytes32" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "measurement",
    stateMutability: "view",
    inputs: [{ name: "runtimeMeasurement", type: "bytes32" }],
    outputs: [
      { name: "measurementType", type: "string" },
      { name: "attestationRoot", type: "bytes" },
      { name: "registeredAt", type: "uint64" },
    ],
  },
  {
    type: "event",
    name: "RuntimeRegistered",
    inputs: [
      { name: "runtimeMeasurement", type: "bytes32", indexed: true },
      { name: "registrant", type: "address", indexed: true },
      { name: "measurementType", type: "string", indexed: false },
    ],
    anonymous: false,
  },
] as const;
