/**
 * Protocol constants. These mirror the values defined in the Cleon Protocol
 * whitepaper (v1.0) and are stable across schema versions unless explicitly
 * superseded.
 */

export const SCHEMA_VERSIONS = {
  persona: "cleon/persona/v1",
  skill: "cleon/skill/v1",
  composition: "cleon/composition/v1",
  executionRecord: "cleon/execution-record/v1",
} as const;

export type SchemaVersion = (typeof SCHEMA_VERSIONS)[keyof typeof SCHEMA_VERSIONS];

/**
 * Chain IDs for the networks Cleon contracts are deployed on.
 */
export const CHAIN_IDS = {
  base: 8453,
  baseSepolia: 84532,
} as const;

export type ChainId = (typeof CHAIN_IDS)[keyof typeof CHAIN_IDS];

/**
 * Risk classes for skill permissions (Section 4.4 of the whitepaper).
 * 0 = no impact on user state, 5 = full control of user funds.
 */
export const RISK_CLASS_MIN = 0;
export const RISK_CLASS_MAX = 5;

/**
 * Permission scopes a skill may declare.
 */
export const PERMISSION_SCOPES = [
  "read",
  "onchain_read",
  "onchain_action",
  "external_api",
  "persistent_state",
] as const;

export type PermissionScope = (typeof PERMISSION_SCOPES)[number];
