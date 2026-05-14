/**
 * @cleonlab/sdk
 *
 * Official TypeScript SDK for the Cleon Protocol. This entry point re-exports
 * the most commonly used surface. For tree-shaken imports, prefer the
 * subpath entry points:
 *
 *   import { parsePersona } from "@cleonlab/sdk/schemas";
 *   import { hashPayload } from "@cleonlab/sdk/hashing";
 *   import { personaAbi } from "@cleonlab/sdk/contracts";
 *   import { buildSkillAuth } from "@cleonlab/sdk/signatures";
 */

export * from "./constants.js";
export * from "./schemas/index.js";
export * from "./hashing/index.js";
export * from "./contracts/index.js";
export * from "./signatures/index.js";

/** Package metadata. */
export const SDK_VERSION = "0.1.0";
