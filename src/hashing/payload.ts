import { canonicalize, canonicalizeBytes } from "./canonical-json.js";
import { keccak256 } from "./keccak.js";

/**
 * The canonical "payload hash" of any protocol object: keccak256 of the RFC
 * 8785 canonical JSON encoding. This is the value stored in on-chain anchors
 * (e.g. `personaHash[tokenId]`) and used as the content identifier in the
 * Skill Registry.
 *
 * @example
 *   const persona = { schema_version: "cleon/persona/v1", ... };
 *   const h = hashPayload(persona);
 *   // → "0x9f8c..." (64 hex chars)
 */
export function hashPayload(value: unknown): `0x${string}` {
  return keccak256(canonicalizeBytes(value));
}

/**
 * Return the canonical JSON string for inspection or off-chain pinning.
 * Equivalent to `canonicalize(value)`, re-exported here for discoverability.
 */
export function canonicalJson(value: unknown): string {
  return canonicalize(value);
}
