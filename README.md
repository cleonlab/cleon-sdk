# @cleonlab/sdk

> Official TypeScript SDK for the [Cleon Protocol](https://cleonlab.com) — typed bindings for personas, skills, compositions, and on-chain registries on Base.

[**Whitepaper**](https://cleonlab.com/whitepaper.pdf) · [**Docs**](https://docs.cleonlab.com) · [**Try the agent**](https://agent.cleonlab.com) · [**GitHub**](https://github.com/cleonlab) · [**Telegram**](https://t.me/cleonlab) · [**X**](https://x.com/cleonlab)


The Cleon Protocol specifies an open, content-addressed substrate for autonomous AI agents. This SDK gives you everything you need to validate, hash, sign, and read/write the on-chain primitives defined in the protocol whitepaper (v1.0):

- **Personas** — on-chain ERC-721 identities for agents
- **Skills** — content-addressed, typed callable modules
- **Compositions** — runtime bindings of a persona with a set of skills
- **Execution records** — signed, optionally attested records of every invocation

This package is **AI-utility-first**: it has no token dependency. You can validate personas, hash payloads, build EIP-712 authorizations, and call protocol contracts without ever touching `$CLEON`.

---

## Table of Contents

- [Installation](#installation)
- [Quick start](#quick-start)
- [API surface](#api-surface)
  - [Schemas](#schemas)
  - [Hashing](#hashing)
  - [Contracts](#contracts)
  - [Signatures](#signatures)
- [Examples](#examples)
- [Subpath exports](#subpath-exports)
- [Versioning and stability](#versioning-and-stability)
- [Development](#development)
- [License](#license)

---

## Installation

```bash
# pnpm (recommended)
pnpm add @cleonlab/sdk

# npm
npm install @cleonlab/sdk

# yarn
yarn add @cleonlab/sdk
```

**Peer requirements.** Node 18+ (for native `fetch` / Web Crypto where used). The package is published as **ESM + CJS dual**, with `.d.ts` types. No runtime polyfills required.

---

## Quick start

### 1. Validate a persona

```ts
import { parsePersona } from "@cleonlab/sdk";

const persona = parsePersona({
  schema_version: "cleon/persona/v1",
  identity: {
    name: "Cassandra",
    handle: "cassandra",
    avatar_uri: "ipfs://bafy...",
    voice_uri: null,
  },
  backstory: "A market analyst...",
  values: { axes: [{ name: "risk", value: -0.4 }] },
  expertise: ["derivatives"],
  rules: { always: [], never: [] },
  signature: { patterns: [], output_format: "markdown" },
  metadata: {
    creator: "0x1234567890123456789012345678901234567890",
    minted_at: 1714521600,
    royalty_bps: 250,
  },
});

console.log(persona.identity.name); // "Cassandra"
```

If the payload is invalid, `parsePersona` throws a `ZodError` with a structured list of issues. For non-throwing usage, use `safeParsePersona`.

### 2. Compute the on-chain anchor

```ts
import { hashPayload } from "@cleonlab/sdk";

const personaHash = hashPayload(persona);
// → "0x9f8c...d3a2"   (keccak256 of the RFC 8785 canonical JSON)
```

This is the exact 32-byte value you pass to `Persona.mint(...)`.

### 3. Sign a SkillAuth (EIP-712)

```ts
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { signSkillAuth } from "@cleonlab/sdk";

const account = privateKeyToAccount("0x...");
const wallet = createWalletClient({ account, chain: base, transport: http() });

const signature = await signSkillAuth(wallet, account.address, {
  chainId: 8453,
  verifyingContract: "0xRUNTIME_VERIFIER",
  message: {
    composition: "0x...",       // composition reference hash
    skill_hash: "0x...",        // manifest hash from SkillRegistry
    input_hash: "0x...",        // keccak256 of canonical input
    scope: "external_api",
    expires_at: BigInt(Math.floor(Date.now() / 1000) + 300),
    nonce: 1n,
  },
});
```

### 4. Read from on-chain registries

```ts
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { personaContract, getAddresses, CHAIN_IDS } from "@cleonlab/sdk";

const client = createPublicClient({ chain: base, transport: http() });
const addr = getAddresses(CHAIN_IDS.base);

const onChainHash = await personaContract.readPersonaHash(
  { client, address: addr.persona },
  1234n,
);
```

---

## API surface

### Schemas

All schemas are built with [Zod](https://zod.dev). Each comes with:

- a `*Schema` Zod object (composable, extendable)
- a `parse*` function (throws on failure)
- a `safeParse*` function (returns a tagged union)
- exported TypeScript types

| Export | Description |
|---|---|
| `PersonaSchema`, `parsePersona`, `safeParsePersona` | Persona payload (`cleon/persona/v1`) |
| `SkillManifestSchema`, `parseSkillManifest`, `safeParseSkillManifest` | Skill manifest (`cleon/skill/v1`) |
| `CompositionSchema`, `parseComposition` | Composition tuple |
| `ExecutionRecordSchema`, `parseExecutionRecord` | Signed execution record |

Types like `Persona`, `SkillManifest`, `Composition`, `ExecutionRecord`, and their nested counterparts (`PersonaIdentity`, `PersonaValues`, `SkillInterface`, etc.) are all exported.

### Hashing

| Export | Description |
|---|---|
| `canonicalize(value)` | RFC 8785 canonical JSON string |
| `canonicalizeBytes(value)` | Canonical JSON as `Uint8Array` |
| `keccak256(bytes)` | keccak256 → `0x`-prefixed hex |
| `keccak256OfString(str)` | UTF-8 string → keccak256 |
| `hashPayload(value)` | `keccak256(canonicalize(value))` — the canonical "payload hash" |
| `toHex(bytes)` / `fromHex(hex)` | Byte ↔ hex helpers |

### Contracts

ABIs and viem-based read/write helpers for the four protocol contracts:

| Contract | ABI export | Helper namespace |
|---|---|---|
| `Persona` (ERC-721) | `personaAbi` | `personaContract` |
| `SkillRegistry` | `skillRegistryAbi` | `skillRegistryContract` |
| `Composition` (ERC-721) | `compositionAbi` | `compositionContract` |
| `AttestationRegistry` | `attestationRegistryAbi` | `attestationRegistryContract` |

Helper modules expose typed `readX` / `writeX` functions that wrap viem's `readContract` / `writeContract`. See [`src/contracts/`](src/contracts) for the full surface.

Default contract addresses per chain are exposed via `getAddresses(chainId)` (currently placeholders pending mainnet deployment — override these in your config until the deployment transactions are published).

### Signatures

EIP-712 typed data builders, signers, and verifiers for the two protocol authorization messages:

| Message | Types | Builder | Signer | Verifier |
|---|---|---|---|---|
| `SkillAuth` | `SkillAuthTypes` | `buildSkillAuth` | `signSkillAuth` | `verifySkillAuth` |
| `SessionGrant` | `SessionGrantTypes` | `buildSessionGrant` | `signSessionGrant` | `verifySessionGrant` |

Both work with any viem `WalletClient` (EOA via `privateKeyToAccount` or smart accounts via `toAccount`).

---

## Examples

### Mint a persona end-to-end

```ts
import {
  parsePersona,
  hashPayload,
  personaContract,
  SCHEMA_VERSIONS,
} from "@cleonlab/sdk";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

// 1. Validate
const persona = parsePersona(rawJson);

// 2. Hash
const personaHash = hashPayload(persona);

// 3. Pin to IPFS — using your provider of choice. The SDK is provider-agnostic;
//    use kubo-rpc-client, web3.storage, or pinata. (Example omitted.)

// 4. Mint
const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
const wallet = createWalletClient({ account, chain: base, transport: http() });

const txHash = await personaContract.mintPersona(
  { address: PERSONA_CONTRACT_ADDRESS, wallet, account: account.address },
  {
    to: account.address,
    personaHash,
    schemaVersion: SCHEMA_VERSIONS.persona,
    royaltyBps: persona.metadata.royalty_bps,
  },
);

console.log("Minted:", txHash);
```

### Verify a persona payload off-chain

```ts
import { hashPayload, personaContract } from "@cleonlab/sdk";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";

const client = createPublicClient({ chain: base, transport: http() });

async function verifyPersona(tokenId: bigint, payload: unknown) {
  const localHash = hashPayload(payload);
  const onChainHash = await personaContract.readPersonaHash(
    { client, address: PERSONA_CONTRACT_ADDRESS },
    tokenId,
  );
  return localHash === onChainHash;
}
```

### Publish a skill manifest

```ts
import {
  parseSkillManifest,
  hashPayload,
  skillRegistryContract,
} from "@cleonlab/sdk";

const manifest = parseSkillManifest(rawJson);
const manifestHash = hashPayload(manifest);

// Pin manifest to IPFS via your preferred provider (omitted), then:

await skillRegistryContract.publishSkill(
  { address: SKILL_REGISTRY_ADDRESS, wallet, account: wallet.account.address },
  {
    manifestHash,
    id: manifest.id,
    version: manifest.version,
    category: manifest.category,
    riskClass: manifest.permissions.risk_class,
  },
);
```

---

## Subpath exports

For minimal bundle size, prefer subpath imports:

```ts
import { parsePersona } from "@cleonlab/sdk/schemas";
import { hashPayload } from "@cleonlab/sdk/hashing";
import { personaAbi, getAddresses } from "@cleonlab/sdk/contracts";
import { signSkillAuth } from "@cleonlab/sdk/signatures";
```

Available subpaths:

- `@cleonlab/sdk/schemas`
- `@cleonlab/sdk/hashing`
- `@cleonlab/sdk/contracts`
- `@cleonlab/sdk/signatures`

The main entry (`@cleonlab/sdk`) re-exports everything for convenience.

---

## Versioning and stability

- The SDK follows [SemVer](https://semver.org).
- **v0.x** is pre-1.0: minor versions may include breaking changes. We aim to keep them narrow and well-documented in the changelog.
- Schema version strings (`cleon/persona/v1`, `cleon/skill/v1`, …) are independent of the SDK version. New schema versions will be additive; old payloads remain valid indefinitely.
- Contract addresses returned by `getAddresses(...)` are placeholders until mainnet deployment. Until then, override addresses explicitly in your application config.

---

## Development

```bash
# Install deps
pnpm install

# Run typecheck
pnpm typecheck

# Run tests
pnpm test

# Build
pnpm build

# Lint + format
pnpm lint
pnpm format
```

Project layout:

```
src/
├── constants.ts             # Protocol constants (schema versions, scopes, ...)
├── schemas/                 # Zod schemas for all protocol payloads
├── hashing/                 # RFC 8785 + keccak256 + payload hash
├── contracts/               # ABIs + viem read/write helpers
│   ├── abis/                # Raw ABI exports
│   └── addresses.ts         # Per-chain contract addresses
├── signatures/              # EIP-712 typed data builders / signers
└── index.ts                 # Public API
```

CI runs typecheck, lint, tests, and build on Node 18/20/22 (see `.github/workflows/ci.yml`).



## License

[MIT](LICENSE) © 2026 Cleon Lab
